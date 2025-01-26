/// <reference types="google.maps" />
import { useState, useEffect, useRef, useCallback } from 'react';

import { Wrapper } from "@googlemaps/react-wrapper";

import { MapPin } from 'lucide-react';


interface PropertyLocation {
    lat: number;
    lng: number;
    address: string;
  }

interface MapProps {
  apiKey: string | null;
  onLocationSelect: (location: PropertyLocation) => void;
  defaultLocation?: { lat: number; lng: number };
}
// Removed incorrect type declaration for google
const MapComponent = ({ apiKey, onLocationSelect, defaultLocation = { lat: 36.7538, lng: 3.0588 } }: MapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  console.log(searchBox)

  // Load Google Maps script
  const loadGoogleMapsScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    loadGoogleMapsScript().then(() => {
    if (!mapRef.current) return;

  const mapInstance = new google.maps.Map(mapRef.current, {
    center: defaultLocation,
    zoom: 13,
    streetViewControl: false,
    mapTypeControl: false,
  });
    setMap(mapInstance);
    const markerInstance = new google.maps.Marker({
      map: mapInstance,
      draggable: true,
      position: defaultLocation,
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    // Handle marker drag events
    markerInstance.addListener('dragend', async () => {
      const position = markerInstance.getPosition();
      if (position) {
        const location = await getAddressFromLatLng(position.lat(), position.lng());
        onLocationSelect(location);
      }
    });
  });
  }, []);

  // Initialize search box
  useEffect(() => {
    if (!searchInputRef.current || !map) return;

    const searchBoxInstance = new google.maps.places.SearchBox(searchInputRef.current);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchInputRef.current);
    setSearchBox(searchBoxInstance);

    // Handle place selection
    searchBoxInstance.addListener('places_changed', () => {
      const places = searchBoxInstance.getPlaces();
      if (!places || places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      // Update map and marker
      map.setCenter(place.geometry.location);
      if (marker) {
        marker.setPosition(place.geometry.location);
      }

      // Get address details
      if (place.formatted_address) {
        onLocationSelect({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
        });
      }
    });
  }, [map]);

  // Helper function to get address from coordinates
  const getAddressFromLatLng = async (lat: number, lng: number): Promise<PropertyLocation> => {
    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        return {
          lat,
          lng,
          address: response.results[0].formatted_address,
        };
      }
      throw new Error('No address found');
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat, lng, address: 'Address not found' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search location..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <div ref={mapRef} className="h-[400px] rounded-lg" />
    </div>
  );
};

// Wrapper component to handle loading states
export const Map = ({ apiKey, ...props }: MapProps) => {
    apiKey =process.env.GOOGLE_MAP_API|| ''
  return (
    <Wrapper apiKey={apiKey } libraries={['places']}>
      <MapComponent apiKey={apiKey} {...props} />
    </Wrapper>
  );
};
