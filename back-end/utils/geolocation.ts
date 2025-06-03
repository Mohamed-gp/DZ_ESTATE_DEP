// Geolocation utility functions
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Get bounding box coordinates for a given center point and radius
 * @param center Center coordinates
 * @param radiusKm Radius in kilometers
 * @returns Bounding box coordinates
 */
export const getBoundingBox = (
  center: Coordinates,
  radiusKm: number
): LocationBounds => {
  const latDelta = radiusKm / 111; // Approximate km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(center.latitude)));

  return {
    north: center.latitude + latDelta,
    south: center.latitude - latDelta,
    east: center.longitude + lngDelta,
    west: center.longitude - lngDelta,
  };
};

/**
 * Validate coordinates
 */
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * Get Algerian wilaya coordinates (sample data)
 */
export const getWilayaCoordinates = (
  wilayaCode: number
): Coordinates | null => {
  const wilayaCoords: Record<number, Coordinates> = {
    16: { latitude: 36.7538, longitude: 3.0588 }, // Algiers
    31: { latitude: 35.6911, longitude: -0.6417 }, // Oran
    25: { latitude: 36.365, longitude: 6.6147 }, // Constantine
    19: { latitude: 36.4633, longitude: 2.8281 }, // Setif
    6: { latitude: 36.7755, longitude: 5.0711 }, // Bejaia
    9: { latitude: 36.1833, longitude: 2.8833 }, // Blida
    // Add more wilaya coordinates as needed
  };

  return wilayaCoords[wilayaCode] || null;
};

/**
 * Generate location search suggestions
 */
export const generateLocationSuggestions = (query: string): string[] => {
  const algerianCities = [
    "Algiers",
    "Oran",
    "Constantine",
    "Batna",
    "Djelfa",
    "Setif",
    "Annaba",
    "Sidi Bel Abbes",
    "Biskra",
    "Tebessa",
    "El Oued",
    "Skikda",
    "Tiaret",
    "Bejaia",
    "Tlemcen",
    "Ouargla",
    "Blida",
    "Jijel",
    "Relizane",
    "Medea",
  ];

  return algerianCities
    .filter((city) => city.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);
};
