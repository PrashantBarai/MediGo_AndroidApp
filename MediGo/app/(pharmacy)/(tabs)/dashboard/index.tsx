import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface ProfileData {
  name: string;
  role: string;
  pharmacyName: string;
  address: string;
  phone: string;
  email: string;
  profileImage?: string;
  license: string;
  gstin: string;
  timings: {
    open: string;
    close: string;
    days: string[];
  };
  description: string;
  rating: number;
  reviews: number;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Base URL for API
  const API_BASE_URL = 'http://192.168.1.102:8082';

  useEffect(() => {
    loadProfileData();
    loadDashboardStats();
  }, []);

  const loadProfileData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('profileData');
      if (storedData) {
        setProfileData(JSON.parse(storedData));
      } else {
        // Set default profile data if nothing is stored
        const defaultProfileData: ProfileData = {
          name: 'Dr. Rajesh Kumar',
          role: 'Owner',
          pharmacyName: 'MedPlus Pharmacy',
          address: '123, Healthcare Street, Medical Hub, Mumbai - 400001',
          phone: '+91 9876543210',
          email: 'rajesh.kumar@medplus.com',
          license: 'PH123456789',
          gstin: 'GSTIN123456789',
          timings: {
            open: '09:00 AM',
            close: '09:00 PM',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          },
          description: 'Your trusted neighborhood pharmacy providing quality medicines and healthcare products since 1995.',
          rating: 4.5,
          reviews: 120
        };
        await AsyncStorage.setItem('profileData', JSON.stringify(defaultProfileData));
        setProfileData(defaultProfileData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // For now, use dummy data since the API is not ready
      setStats({
        totalOrders: 156,
        pendingOrders: 23,
        totalProducts: 482,
        lowStockProducts: 12
      });

      // TODO: Uncomment this when the API is ready
      /*
      // Fetch orders stats
      const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!ordersResponse.ok) {
        throw new Error(`Orders API error: ${ordersResponse.status}`);
      }

      const ordersStats = await ordersResponse.json();
      
      // Fetch products stats
      const productsResponse = await fetch(`${API_BASE_URL}/api/products/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!productsResponse.ok) {
        throw new Error(`Products API error: ${productsResponse.status}`);
      }

      const productsStats = await productsResponse.json();
      
      setStats({
        totalOrders: ordersStats.total || 0,
        pendingOrders: ordersStats.pending || 0,
        totalProducts: productsStats.total || 0,
        lowStockProducts: productsStats.lowStock || 0
      });
      */

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Use dummy data in case of error
      setStats({
        totalOrders: 156,
        pendingOrders: 23,
        totalProducts: 482,
        lowStockProducts: 12
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#6C63FF',
        padding: 24,
        paddingTop: 48,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24
      }}>
        <Text style={{ color: 'white', fontSize: 32, fontWeight: '700' }}>MediGo</Text>
        <Text style={{ color: '#FFFFFF99', fontSize: 18, marginTop: 4 }}>Pharmacy Dashboard</Text>

        {/* Profile Card */}
        <View style={{ 
          backgroundColor: '#FFFFFF20',
          borderRadius: 16,
          padding: 16,
          marginTop: 16,
          marginBottom: 8
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#E3F2FD',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: '#FFFFFF40'
            }}>
              {profileData?.profileImage ? (
                <Image 
                  source={{ uri: profileData.profileImage }} 
                  style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
              ) : (
                <MaterialCommunityIcons name="account" size={40} color="#2196F3" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: 'white' }}>{profileData?.name || 'Loading...'}</Text>
              <Text style={{ color: '#FFFFFF99', fontSize: 14, marginTop: 2 }}>{profileData?.role || 'Loading...'}</Text>
              <Text style={{ color: '#FFFFFF99', fontSize: 14, marginTop: 2 }}>{profileData?.pharmacyName || 'Loading...'}</Text>
            </View>
          </View>

          <View style={{ marginTop: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#FFFFFF99" />
              <Text style={{ color: '#FFFFFF99', fontSize: 14, flex: 1 }}>{profileData?.address || 'Loading...'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF99" />
              <Text style={{ color: '#FFFFFF99', fontSize: 14 }}>{profileData?.phone || 'Loading...'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="email" size={20} color="#FFFFFF99" />
              <Text style={{ color: '#FFFFFF99', fontSize: 14 }}>{profileData?.email || 'Loading...'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Dashboard Stats */}
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {/* Total Orders */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#6C63FF20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <MaterialCommunityIcons name="clipboard-list" size={24} color="#6C63FF" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>{isLoading ? '...' : stats.totalOrders}</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Total Orders</Text>
          </View>

          {/* Pending Orders */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FFC10720',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <MaterialCommunityIcons name="clock" size={24} color="#FFC107" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>{isLoading ? '...' : stats.pendingOrders}</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Pending Orders</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          {/* Total Products */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#4CAF5020',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <MaterialCommunityIcons name="pill" size={24} color="#4CAF50" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>{isLoading ? '...' : stats.totalProducts}</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Total Products</Text>
          </View>

          {/* Low Stock */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FF525220',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <MaterialCommunityIcons name="alert" size={24} color="#FF5252" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>{isLoading ? '...' : stats.lowStockProducts}</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Low Stock</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  }
}); 