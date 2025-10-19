export interface User {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'driver' | 'project_manager' | 'admin';
  isAvailable?: boolean; // ✅ NEW: Driver availability
  createdAt: Date;
}

export interface Ride {
  _id: string;
  userId: string;
  driverId?: string;
  vehicleId?: string;
  
  // Trip Type
  tripType: 'one-way' | 'return-trip';
  
  // Status
  status: 'pending' | 'awaiting_pm' | 'awaiting_admin' | 'approved' | 'assigned' | 'in_progress' | 'completed' | 'rejected';
  
  // Distance
  distanceKm: number;
  
  // Locations
  startLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  endLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  
  // Mileage Tracking
  startMileage?: number;
  endMileage?: number;
  totalMileage?: number;
  
  // Approvals
  approval?: {
    projectManager?: {
      approved: boolean;
      approvedAt: Date;
      approvedBy?: string;
    };
    admin?: {
      approved: boolean;
      approvedAt: Date;
      approvedBy?: string;
    };
  };
  
  // Timestamps
  assignedAt?: Date;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// NEW: Daily Staff Transport Ride
export interface DailyRide {
  _id?: string;
  driverId: string;
  vehicleId: string;
  destination: 'Site-Gampaha' | 'Site-Kadana' | 'Site-Colombo';
  startMileage: number;
  endMileage?: number;
  totalMileage?: number;
  status: 'in_progress' | 'completed';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

// NEW: Monthly Vehicle Mileage Tracking
export interface VehicleMileage {
  _id?: string;
  vehicleId: string; // terminalId
  month: number; // 1-12
  year: number; // 2024
  totalMileage: number; // Accumulated mileage for the month
  rides: Array<{
    rideId?: string;
    dailyRideId?: string;
    type: 'user-ride' | 'daily-ride';
    mileage: number;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Device {
  _id?: string;
  terminalId: string;
  vehicle: string;
  vehicleType: string;
  status: string;
  latitude: string;
  longitude: string;
  speed: number;
  lastMessage: string;
  expire: string;
  isAvailable?: boolean;
}

export interface DeviceApiResponse {
  id: number;
  terminal_id: string;
  vehicle: string;
  vehicle_type: string;
  protocol: string;
  phone: string;
  status: string;
  speed_limit: number;
  stop_time: string;
  latitude: string;
  longitude: string;
  speed: number;
  last_message: string;
  rotation: number;
  acc: number;
  expire: string;
}