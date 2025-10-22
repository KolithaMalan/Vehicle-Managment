'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MapPin, Clock, Check, X, Plus, Users, Car, UserCheck, History, 
  Navigation, Activity, Eye, RefreshCw, MapPinIcon, ArrowLeftRight, 
  ArrowRight, Gauge, BarChart3, TrendingUp, CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LiveLocationModal } from '@/components/LiveTrackingMap';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isAvailable?: boolean;
  driverStatus?: 'available' | 'pending' | 'busy'; // ✅ NEW
}

interface Vehicle {
  _id: string;
  terminalId: string;
  vehicle: string;
  vehicleType: string;
  status: string;
  latitude: string;
  longitude: string;
  speed: number;
  lastMessage: string;
  expire: string;
  isAvailable: boolean;
  vehicleStatus?: 'available' | 'assigned' | 'busy'; // ✅ NEW
}

interface VehicleWithMileage extends Vehicle {
  monthlyMileage: number;
  rideCount: number;
  userRideCount: number;
  dailyRideCount: number;
  lastUpdated: string | null;
}

interface MileageSummary {
  totalVehicles: number;
  totalMileage: number;
  activeVehicles: number;
  availableVehicles: number;
  month: number;
  year: number;
}

interface Ride {
  _id: string;
  userId: string;
  driverId?: string;
  vehicleId?: string;
  status: string;
  distanceKm: number;
  tripType: 'one-way' | 'return-trip';
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
  user?: User;
  driver?: User;
  vehicle?: Vehicle;
  approval?: {
    projectManager?: {
      approved: boolean;
      approvedAt: string;
      approvedBy?: string;
    };
    admin?: {
      approved: boolean;
      approvedAt: string;
      approvedBy?: string;
    };
  };
  assignedAt?: string;
  startedAt?: string;
  startMileage?: number;
  endMileage?: number;
  totalMileage?: number;
  createdAt: string;
}

interface Device {
  _id: string;
  terminalId: string;
  vehicle: string;
  vehicleType: string;
  status: string;
  latitude: string;
  longitude: string;
  speed: number;
  lastMessage: string;
  expire: string;
  isAvailable: boolean;
  vehicleStatus?: 'available' | 'assigned' | 'busy'; // ✅ NEW
}

interface LiveRide extends Ride {
  currentLocation: {
    lat: number;
    lng: number;
  };
}

interface MileageHistory {
  _id: string;
  vehicleId: string;
  month: number;
  year: number;
  totalMileage: number;
  rides: Array<{
    rideId?: string;
    dailyRideId?: string;
    type: 'user-ride' | 'daily-ride';
    mileage: number;
    date: string;
  }>;
}


export default function AdminDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [liveRides, setLiveRides] = useState<LiveRide[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [vehicleMileages, setVehicleMileages] = useState<VehicleWithMileage[]>([]);
  const [mileageSummary, setMileageSummary] = useState<MileageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rides');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedLiveRide, setSelectedLiveRide] = useState<LiveRide | null>(null);
  const [showLiveLocation, setShowLiveLocation] = useState(false);
  const [assignmentData, setAssignmentData] = useState<{[key: string]: {driverId: string, vehicleId: string}}>({});
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'driver'
  });
  
  const [showMileageHistory, setShowMileageHistory] = useState(false);
  const [selectedVehicleHistory, setSelectedVehicleHistory] = useState<MileageHistory[]>([]);
  const [selectedVehicleName, setSelectedVehicleName] = useState('');

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    terminalId: '',
    vehicle: '',
    vehicleType: ''
  });

useEffect(() => {
  fetchData();
}, []);

// ✅ Separate useEffect for manual refresh on tab change
useEffect(() => {
  if (activeTab === 'users' || activeTab === 'vehicles' || activeTab === 'rides') {
    fetchData();
  }
}, [activeTab]);

  useEffect(() => {
    if (activeTab === 'tracking') {
      fetchLiveRides();
      const interval = setInterval(fetchLiveRides, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchVehicleMileages = async () => {
    try {
      const response = await fetch('/api/vehicles/mileage-summary');
      if (response.ok) {
        const data = await response.json();
        setVehicleMileages(data.vehicles);
        setMileageSummary(data.summary);
        console.log('✅ Mileage Summary loaded:', data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch mileage summary:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [ridesRes, usersRes, devicesRes] = await Promise.all([
        fetch('/api/rides'),
        fetch('/api/users'),
        fetch('/api/devices')
      ]);

      if (ridesRes.ok) {
        const ridesData = await ridesRes.json();
        setRides(ridesData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
        setDrivers(usersData.filter((user: User) => user.role === 'driver'));
      }

      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        setDevices(devicesData);
      }

      await fetchVehicleMileages();
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveRides = async () => {
    setLiveLoading(true);
    try {
      const response = await fetch('/api/rides/live');
      if (response.ok) {
        const liveRidesData = await response.json();
        setLiveRides(liveRidesData);
      }
    } catch (error) {
      console.error('Failed to fetch live rides:', error);
    } finally {
      setLiveLoading(false);
    }
  };

    const deleteUser = async (userId: string, userName: string, userEmail: string, userRole: string) => {
    const confirmMessage = `Are you sure you want to delete user "${userName}" (${userEmail})?\n\nRole: ${userRole}\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    if (userRole === 'admin') {
      const adminConfirm = confirm(`⚠️ WARNING: You are about to delete an ADMIN user!\n\nUser: ${userName}\nEmail: ${userEmail}\n\nThis will permanently remove their admin access. Are you absolutely sure?`);
      if (!adminConfirm) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ User "${result.deletedUser.name}" deleted successfully!`);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const fetchMileageHistory = async (vehicleId: string, vehicleName: string) => {
    try {
      const response = await fetch(`/api/vehicles/mileage-history?vehicleId=${vehicleId}&limit=12`);
      if (response.ok) {
        const history = await response.json();
        setSelectedVehicleHistory(history);
        setSelectedVehicleName(vehicleName);
        setShowMileageHistory(true);
      }
    } catch (error) {
      console.error('Failed to fetch mileage history:', error);
      alert('Failed to load mileage history');
    }
  };

  const handleViewLiveLocation = (ride: LiveRide) => {
    setSelectedLiveRide(ride);
    setShowLiveLocation(true);
  };

  const approveRide = async (rideId: string) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('✅ Ride approved! User has been notified via email.');
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to approve ride: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to approve ride:', error);
      alert('Error approving ride');
    }
  };

  const rejectRide = async (rideId: string) => {
    const rejectionReason = prompt('Please enter the reason for rejection (optional):');
    
    if (rejectionReason === null) {
      return;
    }

    try {
      const response = await fetch(`/api/rides/${rideId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rejectionReason: rejectionReason || 'No specific reason provided'
        }),
      });

      if (response.ok) {
        alert('❌ Ride rejected! User has been notified via email.');
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to reject ride: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to reject ride:', error);
      alert('Error rejecting ride');
    }
  };

  const assignDriverAndVehicle = async (rideId: string) => {
    const assignment = assignmentData[rideId];
    if (!assignment?.driverId || !assignment?.vehicleId) {
      alert('Please select both driver and vehicle');
      return;
    }

    try {
      const response = await fetch(`/api/rides/${rideId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          driverId: assignment.driverId, 
          vehicleId: assignment.vehicleId 
        }),
      });

      if (response.ok) {
        alert('✅ Driver and vehicle assigned! Notifications sent to user, driver, and PM.');
        setAssignmentData(prev => {
          const newData = { ...prev };
          delete newData[rideId];
          return newData;
        });
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to assign: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to assign driver and vehicle:', error);
      alert('Error assigning driver and vehicle');
    }
  };

  const updateAssignment = (rideId: string, field: 'driverId' | 'vehicleId', value: string) => {
    setAssignmentData(prev => ({
      ...prev,
      [rideId]: {
        ...prev[rideId],
        [field]: value
      }
    }));
  };

  const createUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert('✅ User created successfully!');
        setIsCreateUserOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'driver' });
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to create user: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Error creating user');
    }
  };

  const addVehicle = async () => {
    if (!newVehicle.terminalId || !newVehicle.vehicle || !newVehicle.vehicleType) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });

      if (response.ok) {
        alert('✅ Vehicle added successfully!');
        setShowAddVehicle(false);
        setNewVehicle({ terminalId: '', vehicle: '', vehicleType: '' });
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to add vehicle: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      alert('Error adding vehicle');
    }
  };

  const deleteVehicle = async (vehicleId: string, vehicleName: string) => {
    if (!confirm(`Are you sure you want to delete vehicle "${vehicleName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles?id=${vehicleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Vehicle deleted successfully!');
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to delete vehicle: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      alert('Error deleting vehicle');
    }
  };

  // ✅ NEW: Helper function to get driver status badge
  const getDriverStatusBadge = (user: User) => {
    if (user.role !== 'driver') {
      return <Badge variant="outline">Active</Badge>;
    }

    const status = user.driverStatus || 'available';
    
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'busy':
        return <Badge className="bg-red-100 text-red-800">Busy</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
    }
  };

  // ✅ NEW: Helper function to get vehicle status badge with detailed info
  const getVehicleAvailabilityBadge = (vehicle: Device) => {
    const status = vehicle.vehicleStatus || 'available';
    
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'assigned':
        return <Badge className="bg-yellow-100 text-yellow-800">Assigned - Not in Use</Badge>;
      case 'busy':
        return <Badge className="bg-red-100 text-red-800">Busy</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      awaiting_pm: 'bg-blue-100 text-blue-800',
      awaiting_admin: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      assigned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getVehicleStatusBadge = (status: string) => {
    const statusColors = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      idle: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <Badge variant="outline" className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getTripTypeBadge = (tripType: 'one-way' | 'return-trip') => {
    return (
      <Badge className={`${
        tripType === 'return-trip' 
          ? 'bg-purple-100 text-purple-800 border-purple-300' 
          : 'bg-blue-100 text-blue-800 border-blue-300'
      } border`}>
        {tripType === 'return-trip' ? (
          <><ArrowLeftRight className="w-3 h-3 mr-1" /> Return</>
        ) : (
          <><ArrowRight className="w-3 h-3 mr-1" /> One-Way</>
        )}
      </Badge>
    );
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || 'Unknown';
  };

  // ✅ UPDATED: Filter logic for available drivers and vehicles
  const pendingRides = rides.filter(ride => ride.status === 'awaiting_admin');
  const approvedRides = rides.filter(ride => ride.status === 'approved');
  const completedRides = rides.filter(ride => ['completed', 'rejected'].includes(ride.status));
  
  // ✅ NEW: Only show drivers that are AVAILABLE (not pending or busy)
  const availableDrivers = drivers.filter(driver => 
    driver.driverStatus === 'available' || !driver.driverStatus
  );
  
  // ✅ NEW: Only show vehicles that are AVAILABLE (not assigned or busy)
  const availableDevices = devices.filter(device => 
    (device.vehicleStatus === 'available' || !device.vehicleStatus) && 
    device.status === 'online'
  );
  
  const totalMonthlyMileage = mileageSummary?.totalMileage || vehicleMileages.reduce((sum, v) => sum + v.monthlyMileage, 0);

    return (
    <DashboardLayout>
      <div className="space-y-6">
<div className="flex justify-between items-center">
  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
  <div className="flex gap-3">
    {/* ✅ ADD THIS REFRESH BUTTON */}
    <Button 
      onClick={() => {
        console.log('🔄 Manual refresh clicked');
        fetchData();
      }}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className="w-4 h-4" />
      Refresh
    </Button>
    
    {activeTab === 'tracking' && (
      <Button 
        onClick={fetchLiveRides} 
        variant="outline" 
        size="sm"
        disabled={liveLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${liveLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    )}
            {activeTab === 'tracking' && (
              <Button 
                onClick={fetchLiveRides} 
                variant="outline" 
                size="sm"
                disabled={liveLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${liveLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new driver or project manager account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="project_manager">Project Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createUser} className="w-full">
                    Create User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-7 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingRides.length}</div>
              <p className="text-xs text-gray-500">&lt;25km rides</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Live Rides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{liveRides.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drivers.length}</div>
              <p className="text-xs text-gray-500">{availableDrivers.length} available</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {availableDevices.length}
              </div>
              <p className="text-xs text-gray-500">out of {devices.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Rides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rides.filter(ride => ['approved', 'assigned', 'in_progress'].includes(ride.status)).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {rides.filter(ride => 
                  ride.status === 'completed' && 
                  new Date(ride.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Monthly Mileage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalMonthlyMileage.toFixed(1)} km
              </div>
              <p className="text-xs text-purple-600">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              {mileageSummary && (
                <p className="text-xs text-purple-500 mt-1">
                  {mileageSummary.activeVehicles} of {mileageSummary.totalVehicles} vehicles active
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rides')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rides'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ride Management
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracking'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Navigation className="w-4 h-4 mr-1 inline" />
              Live Tracking ({liveRides.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 mr-1 inline" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Car className="w-4 h-4 mr-1 inline" />
              Vehicle Management
            </button>
            <button
              onClick={() => setActiveTab('mileage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mileage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Gauge className="w-4 h-4 mr-1 inline" />
              Vehicle Mileage
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4 mr-1 inline" />
              History
            </button>
          </div>
        </div>

                {/* Ride Management Tab */}
        {activeTab === 'rides' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rides Awaiting Admin Approval</CardTitle>
                <CardDescription>
                  {pendingRides.length} short-distance rides (&lt;25km) need your approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRides.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No rides pending approval (only &lt;25km rides appear here)</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRides.map((ride) => (
                      <div key={ride._id} className="border rounded-lg p-4 border-l-4 border-l-orange-500">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-medium">Ride #{ride._id.slice(-6)}</h4>
                            {getTripTypeBadge(ride.tripType)}
                            <Badge className="bg-orange-100 text-orange-800">
                              Short Distance: {ride.distanceKm.toFixed(1)} km
                            </Badge>
                            <p className="text-sm text-gray-600">
                              {new Date(ride.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(ride.status)}
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{ride.startLocation.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="text-sm">{ride.endLocation.address}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveRide(ride._id)}>
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectRide(ride._id)}>
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approved Rides - Driver & Vehicle Assignment</CardTitle>
                <CardDescription>
                  {approvedRides.length} approved rides need driver and vehicle assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvedRides.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No approved rides awaiting assignment</p>
                ) : (
                  <div className="space-y-4">
                    {approvedRides.map((ride) => (
                      <div key={ride._id} className="border rounded-lg p-4 border-l-4 border-l-green-500">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-medium">Ride #{ride._id.slice(-6)}</h4>
                            {getTripTypeBadge(ride.tripType)}
                            <Badge className={ride.distanceKm <= 25 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {ride.distanceKm.toFixed(1)} km {ride.distanceKm <= 25 ? '(Short)' : '(Long)'}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              {new Date(ride.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(ride.status)}
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{ride.startLocation.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="text-sm">{ride.endLocation.address}</span>
                          </div>
                        </div>
                        
                        {/* ✅ UPDATED: Assignment dropdowns with better messaging */}
                        <div className="space-y-3">
                          <div className="flex gap-3 items-center flex-wrap">
                            <Select 
                              onValueChange={(driverId) => updateAssignment(ride._id, 'driverId', driverId)}
                              value={assignmentData[ride._id]?.driverId || ''}
                            >
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select available driver" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDrivers.length === 0 ? (
                                  <div className="p-2 text-sm text-gray-500">No available drivers</div>
                                ) : (
                                  availableDrivers.map((driver) => (
                                    <SelectItem key={driver._id} value={driver._id}>
                                      <div className="flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-green-600" />
                                        {driver.name}
                                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
                                          Available
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            
                            <Select 
                              onValueChange={(vehicleId) => updateAssignment(ride._id, 'vehicleId', vehicleId)}
                              value={assignmentData[ride._id]?.vehicleId || ''}
                            >
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select available vehicle" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDevices.length === 0 ? (
                                  <div className="p-2 text-sm text-gray-500">No available vehicles</div>
                                ) : (
                                  availableDevices.map((device) => (
                                    <SelectItem key={device._id} value={device.terminalId}>
                                      <div className="flex items-center gap-2">
                                        <Car className="w-4 h-4 text-green-600" />
                                        {device.vehicle} ({device.vehicleType})
                                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
                                          Available
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              size="sm" 
                              onClick={() => assignDriverAndVehicle(ride._id)}
                              disabled={!assignmentData[ride._id]?.driverId || !assignmentData[ride._id]?.vehicleId}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                          
                          {/* ✅ NEW: Show warning if no drivers/vehicles available */}
                          {(availableDrivers.length === 0 || availableDevices.length === 0) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800">
                                ⚠️ {availableDrivers.length === 0 && 'No available drivers. '}
                                {availableDevices.length === 0 && 'No available vehicles. '}
                                All resources are currently busy or assigned.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ✅ UPDATED: User Management Tab with Driver Status */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage drivers, project managers, and admin users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(user => user.role !== 'user').map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'project_manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* ✅ NEW: Show detailed driver status */}
                        {getDriverStatusBadge(user)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="opacity-50"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user._id, user.name, user.email, user.role)}
                            className="hover:bg-red-600"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {users.filter(user => user.role !== 'user').length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No staff users found</h3>
                  <p className="text-gray-500">Create your first driver or project manager account</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}


                {/* ✅ UPDATED: Vehicle Management Tab with Detailed Status */}
        {activeTab === 'vehicles' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vehicle Management</CardTitle>
                  <CardDescription>
                    Add, view, and manage vehicles with real-time availability status
                  </CardDescription>
                </div>
                <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                      <DialogDescription>
                        Enter vehicle details to add to the fleet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="terminalId">Terminal ID</Label>
                        <Input
                          id="terminalId"
                          placeholder="e.g., TERM001"
                          value={newVehicle.terminalId}
                          onChange={(e) => setNewVehicle({ ...newVehicle, terminalId: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicle">Vehicle Name</Label>
                        <Input
                          id="vehicle"
                          placeholder="e.g., Toyota Hiace"
                          value={newVehicle.vehicle}
                          onChange={(e) => setNewVehicle({ ...newVehicle, vehicle: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicleType">Vehicle Type</Label>
                        <Select 
                          value={newVehicle.vehicleType} 
                          onValueChange={(value) => setNewVehicle({ ...newVehicle, vehicleType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Van">Van</SelectItem>
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Truck">Truck</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addVehicle} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vehicle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Terminal ID</TableHead>
                    <TableHead>Vehicle Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>System Status</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device._id}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{device.terminalId}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{device.vehicle}</TableCell>
                      <TableCell>{device.vehicleType}</TableCell>
                      <TableCell>
                        {/* System online/offline status */}
                        {getVehicleStatusBadge(device.status)}
                      </TableCell>
                      <TableCell>
                        {/* ✅ NEW: Detailed availability status */}
                        {getVehicleAvailabilityBadge(device)}
                      </TableCell>
                      <TableCell>{device.speed} km/h</TableCell>
                      <TableCell className="text-xs text-gray-500">{device.lastMessage}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteVehicle(device._id, device.vehicle)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* ✅ NEW: Vehicle status legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">Vehicle Status Guide:</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                    <span className="text-gray-600">Ready for assignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Assigned - Not in Use</Badge>
                    <span className="text-gray-600">Assigned but not started</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Busy</Badge>
                    <span className="text-gray-600">Currently on a ride</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Mileage Tab */}
        {activeTab === 'mileage' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            {mileageSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Fleet Mileage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {mileageSummary.totalMileage.toFixed(1)} km
                    </div>
                    <p className="text-xs text-purple-600">This Month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {mileageSummary.activeVehicles}
                    </div>
                    <p className="text-xs text-gray-500">Out of {mileageSummary.totalVehicles}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Average Mileage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {mileageSummary.totalVehicles > 0 ? (mileageSummary.totalMileage / mileageSummary.totalVehicles).toFixed(1) : '0'} km
                    </div>
                    <p className="text-xs text-gray-500">Per Vehicle</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Available Now</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {mileageSummary.availableVehicles}
                    </div>
                    <p className="text-xs text-gray-500">Ready for rides</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Vehicle Mileage Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-purple-600" />
                      Vehicle Mileage Tracking
                    </CardTitle>
                    <CardDescription>
                      Current month mileage for each vehicle - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={fetchVehicleMileages}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Mileage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Terminal ID</TableHead>
                      <TableHead>System Status</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Monthly Mileage</TableHead>
                      <TableHead>Ride Breakdown</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicleMileages
                      .sort((a, b) => b.monthlyMileage - a.monthlyMileage)
                      .map((vehicle) => (
                      <TableRow key={vehicle._id}>
                        <TableCell className="font-medium">{vehicle.vehicle}</TableCell>
                        <TableCell>{vehicle.vehicleType}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{vehicle.terminalId}</Badge>
                        </TableCell>
                        <TableCell>{getVehicleStatusBadge(vehicle.status)}</TableCell>
                        <TableCell>
                          {/* ✅ NEW: Show detailed availability in mileage tab too */}
                          {getVehicleAvailabilityBadge(vehicle)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-purple-600" />
                            <span className="font-bold text-purple-600 text-lg">
                              {vehicle.monthlyMileage.toFixed(1)} km
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {vehicle.rideCount || 0} total rides
                              </Badge>
                            </div>
                            {vehicle.rideCount > 0 && (
                              <div className="text-gray-500">
                                <div>👤 {vehicle.userRideCount || 0} user rides</div>
                                <div>🚌 {vehicle.dailyRideCount || 0} daily rides</div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchMileageHistory(vehicle.terminalId, vehicle.vehicle)}
                            className="flex items-center gap-1"
                          >
                            <BarChart3 className="w-3 h-3" />
                            History
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}


                {/* Live Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Live Vehicle Tracking
                  {liveLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                </CardTitle>
                <CardDescription>
                  Real-time tracking of {liveRides.length} ongoing rides with live location monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                {liveRides.length === 0 ? (
                  <div className="text-center py-12">
                    <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No active rides</h3>
                    <p className="text-gray-500">No rides are currently in progress</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ride ID</TableHead>
                        <TableHead>Trip Type</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Speed</TableHead>
                        <TableHead>Mileage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liveRides.map((ride) => (
                        <TableRow key={ride._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full animate-pulse" 
                                style={{ 
                                  backgroundColor: ride.vehicle?.status === 'online' ? '#10b981' : '#ef4444' 
                                }}
                              ></div>
                              #{ride._id.slice(-6)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTripTypeBadge(ride.tripType)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                              {ride.driver?.name || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Car className="w-4 h-4 text-purple-600" />
                                {ride.vehicle?.vehicle || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {ride.vehicle?.vehicleType} • {ride.vehicle?.terminalId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-green-600" />
                              {ride.user?.name || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-green-600" />
                                <span className="text-xs truncate">{ride.startLocation.address}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-red-600" />
                                <span className="text-xs truncate">{ride.endLocation.address}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {ride.distanceKm.toFixed(1)} km
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ 
                                  backgroundColor: (ride.vehicle?.speed || 0) > 0 ? '#10b981' : '#ef4444' 
                                }}
                              ></div>
                              <span className="font-medium">{ride.vehicle?.speed || 0} km/h</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {ride.startMileage ? (
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1">
                                  <Gauge className="w-3 h-3 text-green-600" />
                                  <span>Start: {ride.startMileage} km</span>
                                </div>
                                {ride.endMileage && (
                                  <div className="flex items-center gap-1">
                                    <Gauge className="w-3 h-3 text-blue-600" />
                                    <span>End: {ride.endMileage} km</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Not recorded</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getStatusBadge(ride.status)}
                              {getVehicleStatusBadge(ride.vehicle?.status || 'offline')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewLiveLocation(ride)}
                              className="flex items-center gap-2"
                            >
                              <MapPinIcon className="w-3 h-3" />
                              Live
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Ride History</CardTitle>
              <CardDescription>
                View completed and rejected rides with full details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ride ID</TableHead>
                    <TableHead>Trip Type</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedRides.map((ride) => {
                    const driver = drivers.find(d => d._id === ride.driverId);
                    
                    return (
                      <TableRow key={ride._id}>
                        <TableCell className="font-medium">#{ride._id.slice(-6)}</TableCell>
                        <TableCell>{getTripTypeBadge(ride.tripType)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-xs text-gray-600 truncate">From: {ride.startLocation.address}</div>
                            <div className="text-xs text-gray-600 truncate">To: {ride.endLocation.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>{ride.distanceKm.toFixed(1)} km</TableCell>
                        <TableCell>
                          {ride.startMileage && ride.endMileage ? (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <Gauge className="w-3 h-3 text-green-600" />
                                <span>{ride.startMileage} km</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Gauge className="w-3 h-3 text-blue-600" />
                                <span>{ride.endMileage} km</span>
                              </div>
                              <div className="font-medium text-purple-600">
                                Total: {ride.totalMileage?.toFixed(1)} km
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not recorded</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(ride.status)}</TableCell>
                        <TableCell>
                          {driver ? (
                            <div className="text-xs">
                              <div className="font-medium">{driver.name}</div>
                              <div className="text-gray-500">{driver.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(ride.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Mileage History Modal */}
        <Dialog open={showMileageHistory} onOpenChange={setShowMileageHistory}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Mileage History - {selectedVehicleName}
              </DialogTitle>
              <DialogDescription>
                Past 12 months mileage records for this vehicle
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {selectedVehicleHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No mileage history available</p>
              ) : (
                <div className="grid gap-4">
                  {selectedVehicleHistory.map((record) => (
                    <Card key={record._id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {getMonthName(record.month)} {record.year}
                          </CardTitle>
                          <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-1">
                            {record.totalMileage.toFixed(1)} km
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-600">
                          <p><strong>Total Rides:</strong> {record.rides.length}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs font-medium">User Rides:</p>
                              <p className="text-sm">{record.rides.filter(r => r.type === 'user-ride').length} rides</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Daily Rides:</p>
                              <p className="text-sm">{record.rides.filter(r => r.type === 'daily-ride').length} rides</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Live Location Modal */}
        {selectedLiveRide && (
          <LiveLocationModal
            isOpen={showLiveLocation}
            onClose={() => setShowLiveLocation(false)}
            ride={selectedLiveRide}
          />
        )}
      </div>
    </DashboardLayout>
  );
}