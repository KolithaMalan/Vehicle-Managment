// app/api/vehicles/available/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { DeviceModel, RideModel } from '@/lib/models';
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

    // Get all vehicles
    const allVehicles = await DeviceModel.find({});

    // Get vehicles with active rides
    const busyRides = await RideModel.find({
      status: { $in: ['assigned', 'in_progress'] }
    }).select('vehicleId status');

    const busyVehicleIds = busyRides.map(ride => ride.vehicleId).filter(Boolean);

    // Add status to each vehicle
    const vehiclesWithStatus = allVehicles.map(vehicle => {
      const ride = busyRides.find(r => r.vehicleId === vehicle.terminalId);
      
      let vehicleStatus = 'Available';
      if (ride) {
        if (ride.status === 'in_progress') {
          vehicleStatus = 'Busy';
        } else if (ride.status === 'assigned') {
          vehicleStatus = 'Assigned-Not Use';
        }
      }

      const isBusy = busyVehicleIds.includes(vehicle.terminalId);

      return {
        ...vehicle.toObject(),
        vehicleStatus,
        isBusy,
        isAvailable: !isBusy && vehicle.status === 'online'
      };
    });

    // Return only available vehicles for assignment
    const onlyAvailable = vehiclesWithStatus.filter(v => v.vehicleStatus === 'Available' && v.status === 'online');

    return NextResponse.json(onlyAvailable);
  } catch (error) {
    console.error('Get available vehicles error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}