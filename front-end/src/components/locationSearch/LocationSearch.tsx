"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";
import { useGeolocation } from "../hooks/useGeolocation";

interface LocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  className?: string;
}

interface LocationResult {
  address: string;
  latitude: number;
  longitude: number;
  type: "current" | "search" | "popular";
}

interface PopularLocation {
  wilaya: string;
  commune: string;
  property_count: number;
  center_lat: number;
  center_lng: number;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search location or use current location",
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>(
    [],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    latitude,
    longitude,
    loading: geoLoading,
    error: geoError,
    getCurrentPosition,
  } = useGeolocation();

  // Fetch popular locations on mount
  useEffect(() => {
    const fetchPopularLocations = async () => {
      try {
        const response = await fetch("/api/properties/locations/popular");
        if (response.ok) {
          const data = await response.json();
          setPopularLocations(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch popular locations:", error);
      }
    };

    fetchPopularLocations();
  }, []);

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayedSearch = setTimeout(() => {
        searchLocations(searchQuery);
      }, 300);

      return () => clearTimeout(delayedSearch);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    setLoading(true);
    try {
      // Mock geocoding - in production, use a real geocoding service
      const algerianCities = [
        { name: "Algiers", lat: 36.7538, lng: 3.0588 },
        { name: "Oran", lat: 35.6911, lng: -0.6417 },
        { name: "Constantine", lat: 36.365, lng: 6.6147 },
        { name: "Annaba", lat: 36.9, lng: 7.7667 },
        { name: "Blida", lat: 36.4711, lng: 2.8277 },
        { name: "Batna", lat: 35.5559, lng: 6.1742 },
        { name: "Djelfa", lat: 34.6711, lng: 3.253 },
        { name: "Setif", lat: 36.1914, lng: 5.4137 },
        { name: "Sidi Bel Abbes", lat: 35.1878, lng: -0.6308 },
        { name: "Biskra", lat: 34.8481, lng: 5.7281 },
      ];

      const filtered = algerianCities
        .filter((city) => city.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map((city) => ({
          address: city.name,
          latitude: city.lat,
          longitude: city.lng,
          type: "search" as const,
        }));

      setSuggestions(filtered);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentPosition();
  };

  // Update suggestions when geolocation is available
  useEffect(() => {
    if (latitude && longitude) {
      onLocationSelect({
        address: "Current Location",
        latitude,
        longitude,
        type: "current",
      });
      setIsOpen(false);
    }
  }, [latitude, longitude, onLocationSelect]);

  const handleLocationSelect = (location: LocationResult) => {
    onLocationSelect(location);
    setSearchQuery(location.address);
    setIsOpen(false);
  };

  const popularLocationSuggestions = popularLocations
    .slice(0, 3)
    .map((location) => ({
      address: `${location.commune}, ${location.wilaya}`,
      latitude: location.center_lat,
      longitude: location.center_lng,
      type: "popular" as const,
    }));

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          title="Use current location"
        >
          {geoLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Current Location Option */}
          {!geoError && (
            <button
              onClick={handleUseCurrentLocation}
              className="flex w-full items-center space-x-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
              disabled={geoLoading}
            >
              <Navigation className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">
                {geoLoading
                  ? "Getting your location..."
                  : "Use current location"}
              </span>
            </button>
          )}

          {/* Search Results */}
          {loading ? (
            <div className="flex items-center space-x-3 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-gray-500">Searching...</span>
            </div>
          ) : (
            <>
              {suggestions.length > 0 && (
                <div>
                  <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Search Results
                  </div>
                  {suggestions.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(location)}
                      className="flex w-full items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{location.address}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Locations */}
              {searchQuery.length <= 2 &&
                popularLocationSuggestions.length > 0 && (
                  <div>
                    <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Popular Locations
                    </div>
                    {popularLocationSuggestions.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(location)}
                        className="flex w-full items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>{location.address}</span>
                      </button>
                    ))}
                  </div>
                )}
            </>
          )}

          {/* No Results */}
          {!loading && searchQuery.length > 2 && suggestions.length === 0 && (
            <div className="px-4 py-3 text-center text-gray-500">
              No locations found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {geoError && <div className="mt-2 text-sm text-red-600">{geoError}</div>}
    </div>
  );
};
