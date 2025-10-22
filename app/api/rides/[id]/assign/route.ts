// app/api/rides/[id]/assign/route.ts - COMPLETE VERSION
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RideModel, DeviceModel, UserModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { 
  sendDriverAssignmentToUser, 
  sendDriverAssignmentToPM,
  sendAssignmentNotificationToDriver
} from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const decoded = verifyToken(token) as any;

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { driverId, vehicleId } = await request.json();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Ride ID is required' }, { status: 400 });
    }

    if (!driverId) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
    }

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    console.log('🚗 Assigning driver:', driverId, 'and vehicle:', vehicleId, 'to ride:', id);

    const ride = await RideModel.findById(id);
    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    if (ride.status !== 'approved') {
      return NextResponse.json({ 
        error: `Ride must be approved first. Current status: ${ride.status}` 
      }, { status: 400 });
    }

    const vehicle = await DeviceModel.findOne({ terminalId: vehicleId });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (vehicle.vehicleStatus === 'busy') {
      return NextResponse.json({ error: 'Vehicle is currently busy on another ride' }, { status: 400 });
    }

    const driver = await UserModel.findById(driverId);
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    if (driver.driverStatus === 'busy') {
      return NextResponse.json({ error: 'Driver is currently busy on another ride' }, { status: 400 });
    }

    const user = await UserModel.findById(ride.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    ride.driverId = driverId;
    ride.vehicleId = vehicleId;
    ride.status = 'assigned';
    ride.assignedAt = new Date();
    await ride.save();

    await UserModel.findByIdAndUpdate(driverId, { 
      isAvailable: true,
      driverStatus: 'pending' 
    });
    console.log(`✅ Driver ${driverId} marked as PENDING`);
    
    await DeviceModel.findOneAndUpdate({ terminalId: vehicleId }, { 
      isAvailable: true,
      vehicleStatus: 'assigned' 
    });
    console.log(`✅ Vehicle ${vehicleId} marked as ASSIGNED`);

    setImmediate(async () => {
      try {
        await sendDriverAssignmentToUser({
          rideId: ride._id.toString(),
          userName: user.name,
          userEmail: user.email,
          driverName: driver.name,
          driverEmail: driver.email,
          vehicleName: vehicle.vehicle,
          vehicleType: vehicle.vehicleType,
          vehicleNumber: vehicle.terminalId,
          pickupLocation: ride.startLocation.address,
          dropoffLocation: ride.endLocation.address,
          requestedDate: new Date(ride.createdAt).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }),
          requestedTime: new Date(ride.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          }),
          distanceKm: ride.distanceKm.toFixed(1),
          tripType: ride.tripType === 'return-trip' ? 'Return Trip' : 'One-Way',
        });
        console.log(`✅ User notification sent to: ${user.email}`);
        
        await sendAssignmentNotificationToDriver({
          driverName: driver.name,
          driverEmail: driver.email,
          rideId: ride._id.toString(),
          userName: user.name,
          userEmail: user.email,
          pickupLocation: ride.startLocation.address,
          dropoffLocation: ride.endLocation.address,
          distanceKm: ride.distanceKm.toFixed(1),
          tripType: ride.tripType === 'return-trip' ? 'Return Trip' : 'One-Way',
          vehicleName: vehicle.vehicle,
          vehicleType: vehicle.vehicleType,
          vehicleNumber: vehicle.terminalId,
          requestedDate: new Date(ride.createdAt).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }),
          requestedTime: new Date(ride.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          }),
        });
        console.log(`✅ Driver notification sent to: ${driver.email}`);
        
        await sendDriverAssignmentToPM({
          rideId: ride._id.toString(),
          userName: user.name,
          userEmail: user.email,
          driverName: driver.name,
          driverEmail: driver.email,
          vehicleName: vehicle.vehicle,
          vehicleType: vehicle.vehicleType,
          vehicleNumber: vehicle.terminalId,
          pickupLocation: ride.startLocation.address,
          dropoffLocation: ride.endLocation.address,
          requestedDate: new Date(ride.createdAt).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }),
          requestedTime: new Date(ride.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          }),
          distanceKm: ride.distanceKm.toFixed(1),
          tripType: ride.tripType === 'return-trip' ? 'Return Trip' : 'One-Way',
        });
        console.log('✅ PM notification sent');
      } catch (emailError) {
        console.error('⚠️ Email notification error:', emailError);
      }
    });

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Assign driver and vehicle error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}