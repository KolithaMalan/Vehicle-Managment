// components/MapModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  startLocation: Location;
  endLocation: Location;
  rideId: string;
  distance: number;
}

export function MapModal({ isOpen, onClose, startLocation, endLocation, rideId, distance }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Check if Google Maps script is already loaded
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
    }
  }, []);

  // Initialize map when modal opens and Google Maps is ready
  useEffect(() => {
    if (isOpen && googleMapsLoaded) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        initializeMap();
      }, 100);
    } else if (isOpen && !googleMapsLoaded) {
      loadGoogleMaps();
    }
  }, [isOpen, googleMapsLoaded]);

  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key not configured');
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setGoogleMapsLoaded(true);
      // Additional delay to ensure everything is loaded
      setTimeout(() => {
        initializeMap();
      }, 200);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps');
      setIsLoading(false);
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    try {
      // Multiple checks to ensure everything is ready
      if (!window.google || !window.google.maps) {
        setError('Google Maps not loaded');
        setIsLoading(false);
        return;
      }

      if (!mapRef.current) {
        setError('Map container not found');
        setIsLoading(false);
        return;
      }

      // Clear any existing content
      mapRef.current.innerHTML = '';

      // Calculate center point
      const centerLat = (startLocation.lat + endLocation.lat) / 2;
      const centerLng = (startLocation.lng + endLocation.lng) / 2;

      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: centerLat, lng: centerLng },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });

      // Create bounds to fit both markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(startLocation.lat, startLocation.lng));
      bounds.extend(new window.google.maps.LatLng(endLocation.lat, endLocation.lng));

      // Add markers
      const startMarker = new window.google.maps.Marker({
        position: { lat: startLocation.lat, lng: startLocation.lng },
        map: map,
        title: 'Pickup Location',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });

      const endMarker = new window.google.maps.Marker({
        position: { lat: endLocation.lat, lng: endLocation.lng },
        map: map,
        title: 'Destination',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });

      // Add info windows
      const startInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <strong style="color: #16a34a;">Pickup Location</strong><br/>
            <span style="font-size: 13px;">${startLocation.address}</span>
          </div>
        `
      });

      const endInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <strong style="color: #dc2626;">Destination</strong><br/>
            <span style="font-size: 13px;">${endLocation.address}</span>
          </div>
        `
      });

      // Add click listeners
      startMarker.addListener('click', () => {
        endInfoWindow.close();
        startInfoWindow.open(map, startMarker);
      });

      endMarker.addListener('click', () => {
        startInfoWindow.close();
        endInfoWindow.open(map, endMarker);
      });

      // Fit bounds after a short delay
      setTimeout(() => {
        map.fitBounds(bounds, 50); // Use number for padding
      }, 100);

      // Add directions
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: true, // Use our custom markers
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRenderer.setMap(map);

      directionsService.route(
        {
          origin: { lat: startLocation.lat, lng: startLocation.lng },
          destination: { lat: endLocation.lat, lng: endLocation.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
          // If directions fail, markers are still visible
        }
      );

      setIsLoading(false);
      setError(null);

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setIsLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Ride Route - #{rideId.slice(-6)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 flex flex-col overflow-y-auto">
          {/* Route Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-sm">Pickup Location</p>
                  <p className="text-sm text-gray-600">{startLocation.address}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-600 mt-1" />
                <div>
                  <p className="font-medium text-sm">Destination</p>
                  <p className="text-sm text-gray-600">{endLocation.address}</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {distance.toFixed(1)} km
                </Badge>
                {distance > 25 && (
                  <Badge className="bg-orange-100 text-orange-800">
                    Long Distance Ride
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 min-h-[400px] rounded-lg overflow-hidden border bg-gray-50 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center text-red-600 p-4">
                  <p className="mb-2 font-medium">⚠️ {error}</p>
                  <p className="text-sm text-gray-600">
                    Please ensure you have a valid Google Maps API key configured
                  </p>
                </div>
              </div>
            )}
            
            <div 
              ref={mapRef} 
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}