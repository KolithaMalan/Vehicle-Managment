// components/LiveLocationModal.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, Car, User, Activity, RefreshCw, ExternalLink } from 'lucide-react';

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
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface LiveRide {
  _id: string;
  userId: string;
  driverId?: string;
  vehicleId?: string;
  status: string;
  distanceKm: number;
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
  currentLocation: {
    lat: number;
    lng: number;
  };
  startedAt?: string;
  createdAt: string;
}

interface LiveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: LiveRide;
}

export function LiveLocationModal({ isOpen, onClose, ride }: LiveLocationModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [useStaticMap, setUseStaticMap] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMap(null);
    setCurrentLocationMarker(null);
    setIsLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      cleanup();
      setUseStaticMap(false);
      
      // Small delay to ensure modal is fully rendered
      const timeout = setTimeout(() => {
        initializeTracking();
      }, 300);

      return () => {
        clearTimeout(timeout);
        cleanup();
      };
    } else {
      cleanup();
    }
  }, [isOpen, cleanup]);

  const initializeTracking = async () => {
    try {
      // Try Google Maps first
      await loadGoogleMaps();
      
      // Set up auto-refresh
      intervalRef.current = setInterval(refreshLocation, 15000); // Every 15 seconds
    } catch (err) {
      console.error('Failed to initialize Google Maps, falling back to static map:', err);
      setUseStaticMap(true);
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    if (!ride.vehicleId || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/vehicles/${ride.vehicleId}/location`);
      if (response.ok) {
        const locationData = await response.json();
        updateCurrentLocation(locationData.latitude, locationData.longitude);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to refresh location:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateCurrentLocation = (lat: number, lng: number) => {
    if (currentLocationMarker && map && window.google) {
      try {
        currentLocationMarker.setPosition({ lat, lng });
        map.panTo({ lat, lng });
      } catch (err) {
        console.error('Failed to update marker position:', err);
      }
    }
  };

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setTimeout(() => {
          initializeMap();
          resolve(true);
        }, 100);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        reject(new Error('Google Maps API key not configured'));
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setTimeout(() => {
            initializeMap();
            resolve(true);
          }, 200);
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setTimeout(() => {
          try {
            initializeMap();
            resolve(true);
          } catch (err) {
            reject(err);
          }
        }, 300);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps'));
      };

      document.head.appendChild(script);
    });
  };

  const initializeMap = () => {
    try {
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps not loaded');
      }

      if (!mapRef.current) {
        throw new Error('Map container not found');
      }

      // Ensure container has dimensions
      const containerRect = mapRef.current.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) {
        throw new Error('Map container has no dimensions');
      }

      // Clear existing content
      mapRef.current.innerHTML = '';

      // Create map
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: ride.currentLocation.lat, lng: ride.currentLocation.lng },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'cooperative',
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      });

      // Wait for map to be fully loaded
      window.google.maps.event.addListenerOnce(newMap, 'idle', () => {
        addMarkersAndRoute(newMap);
        setMap(newMap);
        setIsLoading(false);
        setError(null);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      throw err;
    }
  };

  const addMarkersAndRoute = (map: any) => {
    try {
      // Create bounds
      const bounds = new window.google.maps.LatLngBounds();

// Add start marker (green)
const startMarker = new window.google.maps.Marker({
  position: { lat: ride.startLocation.lat, lng: ride.startLocation.lng },
  map: map,
  title: 'Pickup Location',
  icon: {
    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
  }
});
const startPos = startMarker.getPosition(); // ✅ Get position
if (startPos) { // ✅ Check if not null
  bounds.extend(startPos); // ✅ Safe to use
}

// Add end marker (red)
const endMarker = new window.google.maps.Marker({
  position: { lat: ride.endLocation.lat, lng: ride.endLocation.lng },
  map: map,
  title: 'Destination',
  icon: {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
  }
});
const endPos = endMarker.getPosition(); // ✅ Get position
if (endPos) { // ✅ Check if not null
  bounds.extend(endPos); // ✅ Safe to use
}

// Add current vehicle marker (blue)
const vehicleMarker = new window.google.maps.Marker({
  position: { lat: ride.currentLocation.lat, lng: ride.currentLocation.lng },
  map: map,
  title: `${ride.vehicle?.vehicle} - Current Location`,
  icon: {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
  }
});
const vehiclePos = vehicleMarker.getPosition(); // ✅ Get position
if (vehiclePos) { // ✅ Check if not null
  bounds.extend(vehiclePos); // ✅ Safe to use
}

      // Add info windows
      const startInfoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 8px;"><strong style="color: #16a34a;">Pickup</strong><br/>${ride.startLocation.address}</div>`
      });

      const endInfoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 8px;"><strong style="color: #dc2626;">Destination</strong><br/>${ride.endLocation.address}</div>`
      });

      const vehicleInfoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 8px;"><strong style="color: #2563eb;">🚗 ${ride.vehicle?.vehicle}</strong><br/>Speed: ${ride.vehicle?.speed} km/h</div>`
      });

      // Add click listeners
      startMarker.addListener('click', () => {
        endInfoWindow.close();
        vehicleInfoWindow.close();
        startInfoWindow.open(map, startMarker);
      });

      endMarker.addListener('click', () => {
        startInfoWindow.close();
        vehicleInfoWindow.close();
        endInfoWindow.open(map, endMarker);
      });

      vehicleMarker.addListener('click', () => {
        startInfoWindow.close();
        endInfoWindow.close();
        vehicleInfoWindow.open(map, vehicleMarker);
      });

      // Add route
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 3,
          strokeOpacity: 0.7
        }
      });

      directionsRenderer.setMap(map);

      directionsService.route(
        {
          origin: { lat: ride.startLocation.lat, lng: ride.startLocation.lng },
          destination: { lat: ride.endLocation.lat, lng: ride.endLocation.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
        }
      );

      // Fit bounds
      setTimeout(() => {
        map.fitBounds(bounds, { padding: 50 });
      }, 200);

    } catch (err) {
      console.error('Error adding markers:', err);
    }
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/${ride.startLocation.lat},${ride.startLocation.lng}/${ride.endLocation.lat},${ride.endLocation.lng}/@${ride.currentLocation.lat},${ride.currentLocation.lng},13z`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      online: '#10b981',
      offline: '#ef4444',
      idle: '#f59e0b'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Live Tracking - Ride #{ride._id.slice(-6)}
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshLocation}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openInGoogleMaps}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open in Maps
              </Button>
              <span className="text-xs text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 gap-6 min-h-0">
          {/* Map */}
          <div className="flex-1 rounded-lg overflow-hidden border bg-gray-50 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading live map...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center text-red-600 p-4">
                  <p className="mb-2 font-medium">⚠️ Map Error</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Unable to load interactive map
                  </p>
                  <Button onClick={() => setUseStaticMap(true)} variant="outline">
                    Use Static Map
                  </Button>
                </div>
              </div>
            )}
            
            {useStaticMap ? (
              <div className="w-full h-full flex flex-col">
                <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    📍 Static Map View - Current vehicle location and route
                  </p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Live Location Data</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Vehicle:</strong> {ride.vehicle?.vehicle}</p>
                      <p><strong>Current Position:</strong> {ride.currentLocation.lat.toFixed(6)}, {ride.currentLocation.lng.toFixed(6)}</p>
                      <p><strong>Speed:</strong> {ride.vehicle?.speed} km/h</p>
                      <p><strong>Status:</strong> {ride.vehicle?.status}</p>
                    </div>
                  </div>
                  <Button onClick={openInGoogleMaps} className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Full Route in Google Maps
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                ref={mapRef} 
                className="w-full h-full"
                style={{ minHeight: '500px' }}
              />
            )}
          </div>

          {/* Ride Details Sidebar */}
          <div className="w-80 space-y-4 overflow-y-auto">
            {/* Vehicle Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicle Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vehicle:</span>
                  <span className="font-medium">{ride.vehicle?.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="font-medium">{ride.vehicle?.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse" 
                      style={{ backgroundColor: getStatusColor(ride.vehicle?.status || 'offline') }}
                    ></div>
                    <span className="font-medium">{ride.vehicle?.status}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Speed:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {ride.vehicle?.speed || 0} km/h
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Terminal ID:</span>
                  <span className="font-medium text-xs">{ride.vehicle?.terminalId}</span>
                </div>
              </div>
            </div>

            {/* Ride Information */}
            <div className="p-4 bg-white border rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Ride Details
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Driver:</span>
                  <p className="font-medium">{ride.driver?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Customer:</span>
                  <p className="font-medium">{ride.user?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Distance:</span>
                  <p className="font-medium">{ride.distanceKm.toFixed(1)} km</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {ride.status.replace('_', ' ')}
                  </Badge>
                </div>
                {ride.startedAt && (
                  <div>
                    <span className="text-sm text-gray-600">Started:</span>
                    <p className="font-medium text-sm">
                      {new Date(ride.startedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Route Information */}
            <div className="p-4 bg-white border rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Route Information
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Pickup Location</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">{ride.startLocation.address}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Current Location</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">
                    {ride.currentLocation.lat.toFixed(6)}, {ride.currentLocation.lng.toFixed(6)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Destination</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">{ride.endLocation.address}</p>
                </div>
              </div>
            </div>

            {/* Last Update Info */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Last GPS Update</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {ride.vehicle?.lastMessage || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}