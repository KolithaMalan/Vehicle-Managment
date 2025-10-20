// app/api/vehicles/mileage-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { DeviceModel, VehicleMileageModel } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const decoded = verifyToken(token) as any;
    
    if (decoded.role !== 'admin' && decoded.role !== 'project_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get all vehicles
    const vehicles = await DeviceModel.find({}).lean();

    // Get current month mileage for all vehicles in one query
    const mileageRecords = await VehicleMileageModel.find({
      month: currentMonth,
      year: currentYear,
      vehicleId: { $in: vehicles.map(v => v.terminalId) }
    }).lean();

    // Create a map for quick lookup
    const mileageMap = new Map();
    mileageRecords.forEach(record => {
      mileageMap.set(record.vehicleId, record);
    });

    // ✅ FIX: Properly type the combined vehicle data
    const vehiclesWithMileage = vehicles.map(vehicle => {
      const mileageRecord = mileageMap.get(vehicle.terminalId);
      
      return {
        _id: vehicle._id,
        terminalId: vehicle.terminalId,
        vehicle: vehicle.vehicle,
        vehicleType: vehicle.vehicleType,
        status: vehicle.status,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        speed: vehicle.speed,
        lastMessage: vehicle.lastMessage,
        expire: vehicle.expire,
        isAvailable: vehicle.isAvailable,
        monthlyMileage: mileageRecord?.totalMileage || 0,
        rideCount: mileageRecord?.rides?.length || 0,
        userRideCount: mileageRecord?.rides?.filter((r: any) => r.type === 'user-ride').length || 0,
        dailyRideCount: mileageRecord?.rides?.filter((r: any) => r.type === 'daily-ride').length || 0,
        lastUpdated: mileageRecord?.updatedAt || null
      };
    });

    // Calculate summary statistics
    const totalVehicles = vehicles.length;
    const totalMileage = vehiclesWithMileage.reduce((sum, v) => sum + v.monthlyMileage, 0);
    const activeVehicles = vehiclesWithMileage.filter(v => v.monthlyMileage > 0).length;
    const availableVehicles = vehiclesWithMileage.filter(v => v.isAvailable && v.status === 'online').length;

    return NextResponse.json({
      vehicles: vehiclesWithMileage,
      summary: {
        totalVehicles,
        totalMileage: Number(totalMileage.toFixed(1)),
        activeVehicles,
        availableVehicles,
        month: currentMonth,
        year: currentYear
      }
    });

  } catch (error) {
    console.error('Get vehicle mileage summary error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}