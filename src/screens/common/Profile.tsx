import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the types for navigation
type RootStackParamList = {
  Profile: undefined;
  Dashboard: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const Profile: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const userType = useSelector((state: any) => state.auth.userType);

  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  const handleSaveProfile = () => {
    // Here you would update the user profile in your backend
    // For now, we'll just show an alert
    Alert.alert(
      "Success",
      "Profile updated successfully",
      [{ text: "OK", onPress: () => setEditing(false) }]
    );
  };

  const handleLogout = () => {
    // Dispatch logout action
    dispatch({ type: 'auth/logout' });
    // Navigate to auth screen
    navigation.navigate('Dashboard');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>{userType === 'customer' ? 'Customer' : 'Pharmacy'} Account</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
            />
          ) : (
            <Text style={styles.fieldValue}>{profileData.name || 'Not provided'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profileData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.fieldValue}>{profileData.email || 'Not provided'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{profileData.phone || 'Not provided'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Address</Text>
          {editing ? (
            <TextInput
              style={[styles.input, styles.addressInput]}
              value={profileData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your address"
              multiline
            />
          ) : (
            <Text style={styles.fieldValue}>{profileData.address || 'Not provided'}</Text>
          )}
        </View>

        {editing ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {userType === 'pharmacy' && (
        <View style={styles.pharmacySection}>
          <Text style={styles.sectionTitle}>Pharmacy Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Pharmacy Name</Text>
            <Text style={styles.fieldValue}>{user?.pharmacyName || 'Not provided'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>License Number</Text>
            <Text style={styles.fieldValue}>{user?.licenseNumber || 'Not provided'}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Business Hours</Text>
            <Text style={styles.fieldValue}>{user?.businessHours || 'Not provided'}</Text>
          </View>
        </View>
      )}

      <View style={styles.accountSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notification Preferences</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Privacy Settings</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
  },
  pharmacySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    padding: 16,
    elevation: 2,
  },
  accountSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingText: {
    fontSize: 16,
    color: '#333333',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Profile;
