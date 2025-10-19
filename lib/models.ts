// lib/models.ts

import { User, Ride, Device, DailyRide, VehicleMileage } from './types';
import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'driver', 'project_manager', 'admin'], 
    required: true 
  },
  isAvailable: { type: Boolean, default: true }, // ✅ NEW: Track driver availability
  createdAt: { type: Date, default: Date.now }
});

const RideSchema = new mongoose.Schema<Ride>({
  userId: { type: String, required: true },
  driverId: { type: String },
  vehicleId: { type: String },
  
  tripType: { 
    type: String, 
    enum: ['one-way', 'return-trip'], 
    required: true,
    default: 'one-way'
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'awaiting_pm', 'awaiting_admin', 'approved', 'assigned', 'in_progress', 'completed', 'rejected'], 
    default: 'pending' 
  },
  
  distanceKm: { type: Number, required: true },
  
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: false }
  },
  endLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: false }
  },
  
  startMileage: { type: Number },
  endMileage: { type: Number },
  totalMileage: { type: Number },
  
  approval: {
    projectManager: {
      approved: { type: Boolean },
      approvedAt: { type: Date },
      approvedBy: { type: String }
    },
    admin: {
      approved: { type: Boolean },
      approvedAt: { type: Date },
      approvedBy: { type: String }
    }
  },
  
  assignedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// NEW: Daily Ride Schema
const DailyRideSchema = new mongoose.Schema<DailyRide>({
  driverId: { type: String, required: true },
  vehicleId: { type: String, required: true },
  destination: { 
    type: String, 
    enum: ['Site-Gampaha', 'Site-Kadana', 'Site-Colombo'],
    required: true 
  },
  startMileage: { type: Number, required: true },
  endMileage: { type: Number },
  totalMileage: { type: Number },
  status: { 
    type: String, 
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// NEW: Vehicle Mileage Schema
const VehicleMileageSchema = new mongoose.Schema<VehicleMileage>({
  vehicleId: { type: String, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  totalMileage: { type: Number, default: 0 },
  rides: [{
    rideId: { type: String },
    dailyRideId: { type: String },
    type: { 
      type: String, 
      enum: ['user-ride', 'daily-ride'],
      required: true 
    },
    mileage: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for vehicle + month + year
VehicleMileageSchema.index({ vehicleId: 1, month: 1, year: 1 }, { unique: true });

const DeviceSchema = new mongoose.Schema<Device>({
  terminalId: { type: String, required: true, unique: true },
  vehicle: { type: String, required: true },
  vehicleType: { type: String, required: true },
  status: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  speed: { type: Number, required: true },
  lastMessage: { type: String, required: true },
  expire: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
});

const NotificationSchema = new Schema(
  {
    recipientRole: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Notification = models.Notification || model("Notification", NotificationSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const RideModel = mongoose.models.Ride || mongoose.model('Ride', RideSchema);
export const DailyRideModel = mongoose.models.DailyRide || mongoose.model('DailyRide', DailyRideSchema);
export const VehicleMileageModel = mongoose.models.VehicleMileage || mongoose.model('VehicleMileage', VehicleMileageSchema);
export const DeviceModel = mongoose.models.Device || mongoose.model('Device', DeviceSchema);