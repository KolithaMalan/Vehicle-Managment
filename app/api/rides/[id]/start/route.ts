// app/api/rides/[id]/start/route.ts - DEBUG VERSION
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RideModel, UserModel, DeviceModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { sendRideStartNotificationToAdmin } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔵 START RIDE API CALLED');
  
  try {
    const token = request.cookies.get('token')?.value;
    console.log('🔵 Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const decoded = verifyToken(token) as any;
    console.log('🔵 Decoded token:', { userId: decoded?.userId, role: decoded?.role });
    
    if (decoded.role !== 'driver') {
      console.log('❌ Not a driver role:', decoded.role);
      return NextResponse.json({ error: 'Unauthorized - Driver access required' }, { status: 403 });
    }
    
    console.log('🔵 Connecting to DB...');
    await connectDB();
    console.log('✅ DB Connected');
    
    const { id } = await params;
    console.log('🔵 Ride ID from params:', id);
    
    const body = await request.json();
    const { startMileage } = body;
    console.log('🔵 Request body:', { startMileage });
    
    if (!id) {
      console.log('❌ No ride ID');
      return NextResponse.json({ error: 'Ride ID is required' }, { status: 400 });
    }
    
    if (!startMileage || isNaN(startMileage) || startMileage <= 0) {
      console.log('❌ Invalid mileage:', startMileage);
      return NextResponse.json({ error: 'Valid start mileage is required' }, { status: 400 });
    }

    console.log('🔵 Finding ride in database...');
    const ride = await RideModel.findById(id);
    
    if (!ride) {
      console.log('❌ Ride not found:', id);
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }
    
    console.log('✅ Ride found:', {
      rideId: ride._id,
      status: ride.status,
      driverId: ride.driverId,
      vehicleId: ride.vehicleId
    });
    
    if (ride.driverId !== decoded.userId) {
      console.log('❌ Ride not assigned to this driver. Expected:', ride.driverId, 'Got:', decoded.userId);
      return NextResponse.json({ error: 'This ride is not assigned to you' }, { status: 403 });
    }
    
    if (ride.status !== 'assigned') {
      console.log('❌ Ride status is not assigned:', ride.status);
      return NextResponse.json({ 
        error: `Cannot start ride. Current status: ${ride.status}` 
      }, { status: 400 });
    }

    console.log('🔵 Updating ride status to in_progress...');
    ride.status = 'in_progress';
    ride.startMileage = parseFloat(startMileage);
    ride.startedAt = new Date();
    await ride.save();
    
    console.log(`✅ Ride ${id} started - Mileage: ${startMileage} km`);
    
    console.log('🔵 Updating driver status to BUSY...');
    const driverUpdate = await UserModel.findByIdAndUpdate(
      decoded.userId,
      { 
        isAvailable: false,
        driverStatus: 'busy' 
      },
      { new: true } // Return updated document
    );
    console.log(`✅ Driver ${decoded.userId} marked as BUSY`, {
      isAvailable: driverUpdate?.isAvailable,
      driverStatus: driverUpdate?.driverStatus
    });
    
    if (ride.vehicleId) {
      console.log('🔵 Updating vehicle status to BUSY...');
      const vehicleUpdate = await DeviceModel.findOneAndUpdate(
        { terminalId: ride.vehicleId },
        { 
          isAvailable: false,
          vehicleStatus: 'busy' 
        },
        { new: true } // Return updated document
      );
      console.log(`✅ Vehicle ${ride.vehicleId} marked as BUSY`, {
        isAvailable: vehicleUpdate?.isAvailable,
        vehicleStatus: vehicleUpdate?.vehicleStatus
      });
    } else {
      console.log('⚠️ No vehicle ID on ride');
    }
    
    // Email notification (async)
    setImmediate(async () => {
      try {
        console.log('📧 Sending email notification...');
        const [driver, vehicle, user] = await Promise.all([
          UserModel.findById(decoded.userId),
          DeviceModel.findOne({ terminalId: ride.vehicleId }),
          UserModel.findById(ride.userId)
        ]);

        if (driver && vehicle) {
          await sendRideStartNotificationToAdmin({
            rideId: ride._id.toString(),
            driverName: driver.name,
            driverEmail: driver.email,
            vehicleName: vehicle.vehicle,
            vehicleType: vehicle.vehicleType,
            vehicleNumber: vehicle.terminalId,
            startMileage: ride.startMileage!,
            pickupLocation: ride.startLocation.address,
            dropoffLocation: ride.endLocation.address,
            distanceKm: ride.distanceKm.toFixed(1),
            tripType: ride.tripType === 'return-trip' ? 'Return Trip' : 'One-Way',
            userName: user?.name || 'Unknown',
            userEmail: user?.email || '',
            startedAt: new Date(ride.startedAt!).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
          console.log('✅ Ride start notification sent to admin');
        }
      } catch (emailError) {
        console.error('⚠️ Email notification error:', emailError);
      }
    });
    
    console.log('🔵 Returning success response...');
    return NextResponse.json(ride);
    
  } catch (error) {
    console.error('❌❌❌ Start ride error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}