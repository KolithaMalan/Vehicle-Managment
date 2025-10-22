// app/api/drivers/available/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { UserModel, RideModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const decoded = verifyToken(token) as any;
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    // Get all drivers
    const allDrivers = await UserModel.find({ role: 'driver' }).select('-passwordHash');

    // Get drivers with active rides (assigned or in_progress)
    const busyRides = await RideModel.find({
      status: { $in: ['assigned', 'in_progress'] }
    }).select('driverId');

    const busyDriverIds = busyRides.map(ride => ride.driverId).filter(Boolean);

    // Filter out busy drivers and add status
    const availableDrivers = allDrivers.map(driver => {
      const isBusy = busyDriverIds.includes(driver._id.toString());
      const hasAssignedRide = busyRides.some(
        ride => ride.driverId === driver._id.toString() && ride.status === 'assigned'
      );
      const hasActiveRide = busyRides.some(
        ride => ride.driverId === driver._id.toString() && ride.status === 'in_progress'
      );

      let driverStatus = 'Available';
      if (hasActiveRide) {
        driverStatus = 'Busy';
      } else if (hasAssignedRide) {
        driverStatus = 'Pending';
      }

      return {
        ...driver.toObject(),
        driverStatus,
        isBusy
      };
    });

    // Return only available drivers for assignment
    const onlyAvailable = availableDrivers.filter(d => d.driverStatus === 'Available');

    return NextResponse.json(onlyAvailable);
  } catch (error) {
    console.error('Get available drivers error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}