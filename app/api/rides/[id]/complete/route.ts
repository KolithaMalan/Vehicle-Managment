// app/api/rides/[id]/complete/route.ts - COMPLETE UPDATED VERSION
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RideModel, DeviceModel, VehicleMileageModel, UserModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { updateVehicleMileage } from '@/lib/mileage';

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
    
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { endMileage } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Ride ID is required' }, { status: 400 });
    }

    const ride = await RideModel.findById(id);
    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }
    
    if (ride.status !== 'in_progress') {
      return NextResponse.json({ 
        error: `Ride is not in progress. Current status: ${ride.status}` 
      }, { status: 400 });
    }

    // Validate end mileage
    if (!endMileage || isNaN(endMileage) || endMileage <= 0) {
      return NextResponse.json({ error: 'Valid end mileage is required' }, { status: 400 });
    }

    if (ride.startMileage && endMileage <= ride.startMileage) {
      return NextResponse.json({ 
        error: 'End mileage must be greater than start mileage' 
      }, { status: 400 });
    }

    // Calculate total mileage
    const totalMileage = ride.startMileage 
      ? parseFloat((endMileage - ride.startMileage).toFixed(2))
      : 0;

    // ✅ 1. UPDATE RIDE STATUS
    ride.status = 'completed';
    ride.endMileage = endMileage;
    ride.totalMileage = totalMileage;
    ride.completedAt = new Date();
    await ride.save();

    console.log(`✅ Ride completed - Start: ${ride.startMileage}, End: ${endMileage}, Total: ${totalMileage} km`);

    // ✅ 2. UPDATE MONTHLY VEHICLE MILEAGE
    if (ride.vehicleId && totalMileage > 0) {
      await updateVehicleMileage({
        vehicleId: ride.vehicleId,
        mileage: totalMileage,
        rideId: ride._id.toString(),
        type: 'user-ride'
      });
      console.log(`✅ Vehicle mileage updated: +${totalMileage} km`);
    }

    // ✅ 3. MARK VEHICLE AS AVAILABLE
    if (ride.vehicleId) {
      await DeviceModel.findOneAndUpdate(
        { terminalId: ride.vehicleId },
        { 
          isAvailable: true,
          vehicleStatus: 'available' 
        }
      );
      console.log(`✅ Vehicle ${ride.vehicleId} marked as AVAILABLE`);
    }
    
    // ✅ 4. MARK DRIVER AS AVAILABLE
    if (ride.driverId) {
      await UserModel.findByIdAndUpdate(
        ride.driverId,
        { 
          isAvailable: true,
          driverStatus: 'available' 
        }
      );
      console.log(`✅ Driver ${ride.driverId} marked as AVAILABLE`);
    }
    
    return NextResponse.json(ride);
  } catch (error) {
    console.error('Complete ride error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}