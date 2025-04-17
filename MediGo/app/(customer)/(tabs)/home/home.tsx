import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  image?: string;
  addresses: Array<{
    id: string;
    type: string;
    address: string;
    isDefault: boolean;
  }>;
}

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    // Initial load
    loadProfile();

    // Check for updates every 1 second
    const interval = setInterval(loadProfile, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDefaultAddress = () => {
    if (!profile?.addresses || profile.addresses.length === 0) {
      return 'Add your location';
    }
    const defaultAddress = profile.addresses.find(addr => addr.isDefault) || profile.addresses[0];
    return defaultAddress.address;
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleCategoryPress = () => {
    router.push('/categories');
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
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
        {/* Logo and App Name */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="pill" size={32} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '600' }}>MediGo</Text>
          </View>
          <TouchableOpacity 
            onPress={handleNotificationPress}
            style={{ 
              backgroundColor: '#FFFFFF20', 
              padding: 8, 
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <MaterialCommunityIcons name="bell" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity 
            onPress={handleProfilePress} 
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              backgroundColor: '#FFFFFF20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
              overflow: 'hidden'
            }}>
              {profile?.image ? (
                <Image 
                  source={{ uri: profile.image }} 
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <MaterialCommunityIcons name="account" size={24} color="white" />
              )}
            </View>
            <View>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                {profile?.name || 'Your Name'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="phone" size={16} color="white" style={{ opacity: 0.8 }} />
                <Text style={{ color: 'white', opacity: 0.8, marginLeft: 4, marginRight: 12 }}>
                  {profile?.phone || 'Add phone number'}
                </Text>
                <MaterialCommunityIcons name="map-marker" size={16} color="white" style={{ opacity: 0.8 }} />
                <Text style={{ color: 'white', opacity: 0.8, marginLeft: 4 }}>
                  {getDefaultAddress()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={{ 
          backgroundColor: 'white', 
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: -24,
          height: 48,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <MaterialCommunityIcons name="magnify" size={24} color="#9E9E9E" />
          <TextInput
            placeholder="Search Medicine & Healthcare products"
            style={{ flex: 1, marginLeft: 12, fontSize: 14 }}
            placeholderTextColor="#9E9E9E"
          />
        </View>
      </View>
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 32 }}>
        {/* Offer Banner */}
        <View style={{ 
          backgroundColor: '#E8FFF1', 
          borderRadius: 16, 
          padding: 16,
          marginBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#00B15C' }}>80%</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#00B15C', marginTop: 4 }}>On Health Products</Text>
            <Text style={{ fontSize: 12, color: '#666666', marginTop: 4 }}>Homeopathy, Ayurveda, Personal Care & More</Text>
            <TouchableOpacity style={{
              backgroundColor: '#00B15C',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              alignSelf: 'flex-start',
              marginTop: 12
            }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>SHOP NOW</Text>
            </TouchableOpacity>
          </View>
          <View style={{ 
            width: 120, 
            height: 120, 
            backgroundColor: '#00B15C20',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <MaterialCommunityIcons name="medical-bag" size={48} color="#00B15C" />
          </View>
        </View>

        {/* Popular Categories */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Popular Categories</Text>
            <TouchableOpacity onPress={handleCategoryPress}>
              <Text style={{ color: '#6C63FF', fontWeight: '500' }}>SEE ALL</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {[
              { name: 'Nutritional Drinks', icon: 'bottle-tonic' },
              { name: 'Ayurveda', icon: 'leaf' },
              { name: 'Vitamins & Supplement', icon: 'pill' },
              { name: 'Healthcare Devices', icon: 'medical-bag' },
              { name: 'Homeopathy', icon: 'flask' },
              { name: 'Diabetes Care', icon: 'diabetes' },
            ].map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={handleCategoryPress}
                style={{
                  width: '30%',
                  alignItems: 'center',
                }}
              >
                <View style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#6C63FF10',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  <MaterialCommunityIcons name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={32} color="#6C63FF" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '500', textAlign: 'center' }}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
} 