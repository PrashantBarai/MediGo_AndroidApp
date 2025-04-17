import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import type { ExternalPathString, RelativePathString } from 'expo-router/build/types';

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
  paymentMethods: Array<{
    id: string;
    type: string;
    last4: string;
  }>;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Could not save profile changes');
    }
  };

  const handleSendOTP = async () => {
    if (!profile?.email) {
      Alert.alert('Error', 'Please add your email address first');
      return;
    }

    try {
      // TODO: Implement actual OTP sending logic
      Alert.alert('OTP Sent', 'OTP has been sent to your registered email');
      setOtpSent(true);
    } catch (error) {
      Alert.alert('Error', 'Could not send OTP. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (!otpSent) {
      Alert.alert('Error', 'Please request OTP first');
      return;
    }

    try {
      // TODO: Implement actual password change logic
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        otp: '',
      });
      setOtpSent(false);
    } catch (error) {
      Alert.alert('Error', 'Could not change password. Please try again.');
    }
  };

  const pickImage = async () => {
    if (!isEditing || !profile) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your photos to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const updatedProfile = { ...profile, image: result.assets[0].uri };
      setProfile(updatedProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Kya aap sure hain ki aap logout karna chahte hain?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'account-edit',
      onPress: () => setIsEditing(!isEditing)
    },
    {
      id: 'password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'lock',
      onPress: () => setShowPasswordChange(!showPasswordChange)
    },
    {
      id: 'addresses',
      title: 'Delivery Addresses',
      subtitle: 'Manage your delivery locations',
      icon: 'map-marker',
      onPress: () => router.push('/(customer)/profile/addresses' as RelativePathString)
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      icon: 'credit-card',
      onPress: () => router.push('/(customer)/profile/payment' as RelativePathString)
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notifications',
      icon: 'bell',
      onPress: () => router.push('/(customer)/profile/notifications' as RelativePathString)
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your account security',
      icon: 'shield-check',
      onPress: () => router.push('/(customer)/profile/privacy' as RelativePathString)
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact us',
      icon: 'help-circle',
      onPress: () => router.push('/(customer)/profile/help' as RelativePathString)
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out from your account',
      icon: 'logout',
      onPress: handleLogout
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6C63FF', '#4A42E8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
            {profile?.image ? (
              <Image source={{ uri: profile.image }} style={styles.profileImage} />
            ) : (
              <MaterialCommunityIcons name="account" size={64} color="white" />
            )}
            {isEditing && (
              <View style={styles.editIconContainer}>
                <MaterialCommunityIcons name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{profile?.name || 'Your Name'}</Text>
          <Text style={styles.email}>{profile?.email || 'Add your email'}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={24} color="#666" style={styles.inputIcon} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profile?.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Enter your name"
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email" size={24} color="#666" style={styles.inputIcon} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profile?.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="phone" size={24} color="#666" style={styles.inputIcon} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profile?.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  editable={isEditing}
                />
              </View>
            </View>

            {isEditing && (
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Change Password Form */}
        {showPasswordChange && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Change Password</Text>
            </View>

            <View style={styles.passwordContainer}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock" size={24} color="#666" style={styles.inputIcon} />
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordData.currentPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                    placeholder="Enter current password"
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                    placeholder="Enter new password"
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-check" size={24} color="#666" style={styles.inputIcon} />
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                    placeholder="Confirm new password"
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.otpContainer}>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="email" size={24} color="#666" style={styles.inputIcon} />
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>OTP</Text>
                    <TextInput
                      style={styles.input}
                      value={passwordData.otp}
                      onChangeText={(text) => setPasswordData({ ...passwordData, otp: text })}
                      placeholder="Enter OTP"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.otpButton, otpSent && styles.otpButtonDisabled]} 
                  onPress={handleSendOTP}
                  disabled={otpSent}
                >
                  <Text style={styles.otpButtonText}>
                    {otpSent ? 'OTP Sent' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Options</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIconContainer, item.id === 'logout' && styles.logoutIconContainer]}>
                  <MaterialCommunityIcons 
                    name={item.icon} 
                    size={24} 
                    color={item.id === 'logout' ? '#FF4444' : '#6C63FF'} 
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuItemTitle, item.id === 'logout' && styles.logoutText]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.menuItemSubtitle, item.id === 'logout' && styles.logoutText]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={item.id === 'logout' ? '#FF4444' : '#666'} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C63FF',
    padding: 8,
    borderRadius: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 1,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  inputDisabled: {
    color: '#666',
    borderBottomColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordContainer: {
    gap: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  otpButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    alignSelf: 'flex-end',
  },
  otpButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  otpButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutIconContainer: {
    backgroundColor: '#FFE5E5',
  },
  logoutText: {
    color: '#FF4444',
  },
}); 