import axios from 'axios';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

// OpenStreetMap API endpoints
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

interface LatLng {
  latitude: number;
  longitude: number;
}

interface LocationAddress {
  display_name: string;
  address: {
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    [key: string]: string | undefined;
  };
  lat: string;
  lon: string;
}

export const osmService = {
  // Get current device location
  getCurrentLocation: async (): Promise<LatLng> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }
      
      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      console.error('Location Error:', error);
      throw new Error('Failed to get current location');
    }
  },
  
  // Search for places by query
  searchPlaces: async (query: string): Promise<LocationAddress[]> => {
    try {
      const response = await axios.get(`${NOMINATIM_API}/search`, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 10
        },
        headers: {
          'User-Agent': 'MediGo-App'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Search Places Error:', error);
      throw new Error('Failed to search places');
    }
  },
  
  // Get address from coordinates (reverse geocoding)
  getAddressFromCoordinates: async (latitude: number, longitude: number): Promise<LocationAddress> => {
    try {
      const response = await axios.get(`${NOMINATIM_API}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'MediGo-App'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
      throw new Error('Failed to get address from coordinates');
    }
  },
  
  // Calculate distance between two coordinates (in kilometers)
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  },
  
  // Find nearby pharmacies within a radius
  findNearbyPharmacies: async (latitude: number, longitude: number, radius: number = 5): Promise<any[]> => {
    try {
      // In a real implementation, you would fetch pharmacy data from your backend API
      // For demonstration, this function would make an API call to your backend
      // which would query MongoDB for pharmacies within the radius
      
      // Example API call to your backend
      /*
      const response = await axios.get('https://your-api-url.com/api/pharmacies/nearby', {
        params: {
          lat: latitude,
          lng: longitude,
          radius: radius
        }
      });
      
      return response.data;
      */
      
      // Placeholder return (replace with actual API call)
      return [
        {
          id: '1',
          name: 'MediCare Pharmacy',
          address: '123 Health Street',
          latitude: latitude + 0.01,
          longitude: longitude + 0.01,
          distance: 1.2
        },
        {
          id: '2',
          name: 'City Pharmacy',
          address: '456 Wellness Avenue',
          latitude: latitude - 0.01,
          longitude: longitude - 0.01,
          distance: 1.5
        }
      ];
    } catch (error) {
      console.error('Find Nearby Pharmacies Error:', error);
      throw new Error('Failed to find nearby pharmacies');
    }
  }
};

// Helper function to convert degrees to radians
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default osmService;
