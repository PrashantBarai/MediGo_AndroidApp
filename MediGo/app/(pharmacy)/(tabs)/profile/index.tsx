import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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
  description?: string;
  rating: number;
  reviews: number;
}

export default function Profile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
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
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload profile photo!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileData({
        ...profileData,
        profileImage: result.assets[0].uri
      });
    }
  };

  const handleEdit = (field: string) => {
    setEditField(field);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsEditing(false);
    setEditField(null);
    try {
      await AsyncStorage.setItem('profileData', JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditField(null);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure to Logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data from AsyncStorage
              await AsyncStorage.clear();
              
              // Navigate to pharmacy login
              router.replace('/(auth)/pharmacy/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    // Load profile data from storage when component mounts
    const loadProfileData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('profileData');
        if (storedData) {
          setProfileData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Profile Header */}
      <View style={{ 
        backgroundColor: '#6C63FF',
        padding: 24,
        paddingTop: 48,
        alignItems: 'center'
      }}>
        <TouchableOpacity 
          onPress={isEditing ? pickImage : undefined}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            overflow: 'hidden'
          }}
        >
          {profileData.profileImage ? (
            <Image 
              source={{ uri: profileData.profileImage }} 
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <MaterialCommunityIcons name="medical-bag" size={48} color="#6C63FF" />
          )}
          {isEditing && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: 4,
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 12 }}>Change Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '600' }}>{profileData.name}</Text>
        <Text style={{ color: '#FFFFFF99', fontSize: 16 }}>{profileData.role}</Text>
      </View>

      {/* Profile Details */}
      <View style={{ padding: 16, gap: 16 }}>
        {/* Basic Information */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Basic Information</Text>
          
          <View style={{ gap: 16 }}>
            {/* Name */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#666', fontSize: 14 }}>Name</Text>
                <TouchableOpacity onPress={() => handleEdit('name')}>
                  <MaterialCommunityIcons name="pencil" size={20} color="#6C63FF" />
                </TouchableOpacity>
              </View>
              {editField === 'name' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <TextInput
                    value={profileData.name}
                    onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      borderRadius: 8,
                      padding: 8,
                      fontSize: 16
                    }}
                  />
                  <TouchableOpacity 
                    onPress={handleSave}
                    style={{
                      backgroundColor: '#4CAF50',
                      padding: 8,
                      borderRadius: 8
                    }}
                  >
                    <MaterialCommunityIcons name="check" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleCancel}
                    style={{
                      backgroundColor: '#FF525220',
                      padding: 8,
                      borderRadius: 8
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={{ fontSize: 16, marginTop: 4 }}>{profileData.name}</Text>
              )}
            </View>

            {/* Email */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#666', fontSize: 14 }}>Email</Text>
                <TouchableOpacity onPress={() => handleEdit('email')}>
                  <MaterialCommunityIcons name="pencil" size={20} color="#6C63FF" />
                </TouchableOpacity>
              </View>
              {editField === 'email' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <TextInput
                    value={profileData.email}
                    onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                    keyboardType="email-address"
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      borderRadius: 8,
                      padding: 8,
                      fontSize: 16
                    }}
                  />
                  <TouchableOpacity 
                    onPress={handleSave}
                    style={{
                      backgroundColor: '#4CAF50',
                      padding: 8,
                      borderRadius: 8
                    }}
                  >
                    <MaterialCommunityIcons name="check" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleCancel}
                    style={{
                      backgroundColor: '#FF525220',
                      padding: 8,
                      borderRadius: 8
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={{ fontSize: 16, marginTop: 4 }}>{profileData.email}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Business Information</Text>
          
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ color: '#666', fontSize: 14 }}>Pharmacy Name</Text>
              {isEditing ? (
                <TextInput
                  value={profileData.pharmacyName}
                  onChangeText={(text) => setProfileData({...profileData, pharmacyName: text})}
                  style={{
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 4
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{profileData.pharmacyName}</Text>
              )}
            </View>

            <View>
              <Text style={{ color: '#666', fontSize: 14 }}>Address</Text>
              {isEditing ? (
                <TextInput
                  value={profileData.address}
                  onChangeText={(text) => setProfileData({...profileData, address: text})}
                  multiline
                  style={{
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 4
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{profileData.address}</Text>
              )}
            </View>

            <View>
              <Text style={{ color: '#666', fontSize: 14 }}>Phone</Text>
              {isEditing ? (
                <TextInput
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData({...profileData, phone: text})}
                  keyboardType="phone-pad"
                  style={{
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 4
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{profileData.phone}</Text>
              )}
            </View>

            <View>
              <Text style={{ color: '#666', fontSize: 14 }}>Description</Text>
              {isEditing ? (
                <TextInput
                  value={profileData.description}
                  onChangeText={(text) => setProfileData({...profileData, description: text})}
                  multiline
                  style={{
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 4,
                    minHeight: 80
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{profileData.description}</Text>
              )}
            </View>

            <View>
              <Text style={{ color: '#666', fontSize: 14 }}>License Number</Text>
              {isEditing ? (
                <TextInput
                  value={profileData.license}
                  onChangeText={(text) => setProfileData({...profileData, license: text})}
                  style={{
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 4
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{profileData.license}</Text>
              )}
            </View>

            <View>
              <Text style={{ color: '#666', fontSize: 14 }}>GSTIN</Text>
              {isEditing ? (
                <TextInput
                  value={profileData.gstin}
                  onChangeText={(text) => setProfileData({...profileData, gstin: text})}
                  style={{
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 4
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{profileData.gstin}</Text>
              )}
            </View>

            <View>
              <Text style={{ color: '#666', fontSize: 14 }}>Business Hours</Text>
              {isEditing ? (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      value={profileData.timings.open}
                      onChangeText={(text) => setProfileData({
                        ...profileData,
                        timings: { ...profileData.timings, open: text }
                      })}
                      placeholder="Opening Time"
                      style={{
                        flex: 1,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 8,
                        padding: 8
                      }}
                    />
                    <TextInput
                      value={profileData.timings.close}
                      onChangeText={(text) => setProfileData({
                        ...profileData,
                        timings: { ...profileData.timings, close: text }
                      })}
                      placeholder="Closing Time"
                      style={{
                        flex: 1,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 8,
                        padding: 8
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <TouchableOpacity
                        key={day}
                        onPress={() => {
                          const days = profileData.timings.days.includes(day)
                            ? profileData.timings.days.filter(d => d !== day)
                            : [...profileData.timings.days, day];
                          setProfileData({
                            ...profileData,
                            timings: { ...profileData.timings, days }
                          });
                        }}
                        style={{
                          backgroundColor: profileData.timings.days.includes(day) ? '#6C63FF' : 'white',
                          borderWidth: 1,
                          borderColor: '#6C63FF',
                          borderRadius: 8,
                          paddingVertical: 6,
                          paddingHorizontal: 12
                        }}
                      >
                        <Text style={{ 
                          color: profileData.timings.days.includes(day) ? 'white' : '#6C63FF',
                          fontSize: 14
                        }}>
                          {day.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={{ fontSize: 16 }}>
                    {profileData.timings.open} - {profileData.timings.close}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                    {profileData.timings.days.join(', ')}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#666', fontSize: 14 }}>Rating</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <MaterialCommunityIcons name="star" size={20} color="#FFC107" />
                  <Text style={{ fontSize: 16, marginLeft: 4 }}>{profileData.rating}</Text>
                  <Text style={{ color: '#666', fontSize: 14, marginLeft: 4 }}>
                    ({profileData.reviews} reviews)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {isEditing ? (
            <>
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  flex: 1,
                  backgroundColor: '#4CAF50',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <MaterialCommunityIcons name="check" size={20} color="white" />
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  backgroundColor: '#FF5252',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <MaterialCommunityIcons name="close" size={20} color="white" />
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={{
                flex: 1,
                backgroundColor: '#6C63FF',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings Menu */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { icon: 'bell-outline', label: 'Notifications', onPress: () => router.push('/notifications') },
            { icon: 'lock-outline', label: 'Privacy', onPress: () => console.log('Privacy') },
            { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => console.log('Help') },
            { icon: 'logout', label: 'Logout', onPress: handleLogout, color: '#FF5252' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: index === 3 ? 0 : 1,
                borderBottomColor: '#F0F0F0',
                gap: 12
              }}
            >
              <MaterialCommunityIcons 
                name={item.icon as any} 
                size={24} 
                color={item.color || '#6C63FF'} 
              />
              <Text style={{ 
                flex: 1, 
                fontSize: 16,
                color: item.color || '#000'
              }}>
                {item.label}
              </Text>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={item.color || '#666'} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
} 