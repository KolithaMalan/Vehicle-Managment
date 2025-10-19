// lib/mileage.ts
import { VehicleMileageModel } from './models';

interface UpdateMileageParams {
  vehicleId: string;
  mileage: number;
  rideId?: string;
  dailyRideId?: string;
  type: 'user-ride' | 'daily-ride';
}

/**
 * Update monthly vehicle mileage
 * Automatically creates new month entry if needed
 */
export async function updateVehicleMileage(params: UpdateMileageParams) {
  const { vehicleId, mileage, rideId, dailyRideId, type } = params;
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  
  try {
    // Find or create current month's mileage document
    let vehicleMileage = await VehicleMileageModel.findOne({
      vehicleId,
      month: currentMonth,
      year: currentYear
    });
    
    if (!vehicleMileage) {
      // Create new month entry
      vehicleMileage = new VehicleMileageModel({
        vehicleId,
        month: currentMonth,
        year: currentYear,
        totalMileage: 0,
        rides: []
      });
      console.log(`📊 Created new mileage entry for ${vehicleId} - ${currentYear}-${currentMonth}`);
    }
    
    // Add ride entry
    vehicleMileage.rides.push({
      rideId,
      dailyRideId,
      type,
      mileage,
      date: now
    });
    
    // Update total mileage
    vehicleMileage.totalMileage += mileage;
    vehicleMileage.updatedAt = now;
    
    await vehicleMileage.save();
    
    console.log(`✅ Updated mileage for ${vehicleId}: +${mileage} km (Total: ${vehicleMileage.totalMileage} km)`);
    
    return vehicleMileage;
  } catch (error) {
    console.error('❌ Error updating vehicle mileage:', error);
    throw error;
  }
}

/**
 * Get current month's mileage for a vehicle
 */
export async function getCurrentMonthMileage(vehicleId: string) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  try {
    const mileage = await VehicleMileageModel.findOne({
      vehicleId,
      month: currentMonth,
      year: currentYear
    });
    
    return mileage || null;
  } catch (error) {
    console.error('❌ Error getting current month mileage:', error);
    throw error;
  }
}

/**
 * Get mileage history for a vehicle
 */
export async function getMileageHistory(vehicleId: string, limit = 12) {
  try {
    const history = await VehicleMileageModel.find({ vehicleId })
      .sort({ year: -1, month: -1 })
      .limit(limit);
    
    return history;
  } catch (error) {
    console.error('❌ Error getting mileage history:', error);
    throw error;
  }
}

/**
 * Reset all monthly mileages (called by cron job at end of month)
 * This function doesn't delete old data, just ensures new month starts fresh
 */
export async function ensureNewMonthInitialized() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  console.log(`🔄 Checking if new month ${currentYear}-${currentMonth} is initialized...`);
  
  // The system automatically creates new entries when first mileage is added
  // This function is just for logging/verification
  
  const existingEntries = await VehicleMileageModel.countDocuments({
    month: currentMonth,
    year: currentYear
  });
  
  console.log(`✅ Month ${currentYear}-${currentMonth} has ${existingEntries} vehicle entries`);
  
  return { month: currentMonth, year: currentYear, entries: existingEntries };
}