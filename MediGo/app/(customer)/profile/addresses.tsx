import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface Address {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  name: string;
  address: string;
  landmark?: string;
  pincode: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export default function Addresses() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'HOME',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setAddresses(profile.addresses || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Kripya location access allow karein. Ye feature aapke current location ko detect karke address auto-fill karne ke liye zaroori hai.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Settings',
              onPress: () => {
                // Open app settings
                Linking.openSettings();
              }
            }
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (address[0]) {
        const formattedAddress = `${address[0].street || ''}, ${address[0].city || ''}, ${address[0].region || ''}, ${address[0].postalCode || ''}`;
        setNewAddress({
          ...newAddress,
          address: formattedAddress,
          pincode: address[0].postalCode || '',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } else {
        Alert.alert('Error', 'Location detect nahi ho paya. Kripya manually address enter karein.');
      }
    } catch (error) {
      Alert.alert('Error', 'Location fetch karne mein error aaya. Kripya manually address enter karein.');
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.name || !newAddress.address || !newAddress.pincode) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const updatedAddresses = [...(profile.addresses || [])];
        
        if (newAddress.isDefault) {
          updatedAddresses.forEach(addr => addr.isDefault = false);
        }

        updatedAddresses.push({
          ...newAddress as Address,
          id: Date.now().toString(),
        });

        profile.addresses = updatedAddresses;
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        setAddresses(updatedAddresses);
        setShowAddForm(false);
        setNewAddress({ type: 'HOME', isDefault: false });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not save address. Please try again.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const updatedAddresses = profile.addresses.map((addr: Address) => ({
          ...addr,
          isDefault: addr.id === id
        }));

        profile.addresses = updatedAddresses;
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        setAddresses(updatedAddresses);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not update default address. Please try again.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert(
      'Delete Address',
      'Kya aap sure hain ki aap is address ko delete karna chahte hain?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const savedProfile = await AsyncStorage.getItem('userProfile');
              if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                const updatedAddresses = profile.addresses.filter((addr: Address) => addr.id !== id);
                profile.addresses = updatedAddresses;
                await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
                setAddresses(updatedAddresses);
              }
            } catch (error) {
              Alert.alert('Error', 'Could not delete address. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Add New Address Button */}
        {!showAddForm && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#6C63FF" />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <View style={styles.typeSelector}>
              {(['HOME', 'WORK', 'OTHER'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    newAddress.type === type && styles.typeButtonActive
                  ]}
                  onPress={() => setNewAddress({ ...newAddress, type })}
                >
                  <MaterialCommunityIcons
                    name={type === 'HOME' ? 'home' : type === 'WORK' ? 'briefcase' : 'map-marker'}
                    size={20}
                    color={newAddress.type === type ? '#6C63FF' : '#666666'}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    newAddress.type === type && styles.typeButtonTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.locationButton}
              onPress={handleGetCurrentLocation}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#6C63FF" />
              <Text style={styles.locationButtonText}>Use Current Location</Text>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
                placeholder="Enter full name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Complete Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({ ...newAddress, address: text })}
                placeholder="House/Flat No., Building, Street, Area"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newAddress.landmark}
                onChangeText={(text) => setNewAddress({ ...newAddress, landmark: text })}
                placeholder="Nearby landmark for easy location"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput
                style={styles.input}
                value={newAddress.pincode}
                onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                placeholder="Enter 6-digit pincode"
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={styles.defaultCheckbox}
              onPress={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
            >
              <MaterialCommunityIcons
                name={newAddress.isDefault ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color="#6C63FF"
              />
              <Text style={styles.defaultCheckboxText}>Make this my default address</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddForm(false);
                  setNewAddress({ type: 'HOME', isDefault: false });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveAddress}
              >
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Addresses List */}
        {!showAddForm && addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressType}>
                <MaterialCommunityIcons
                  name={address.type === 'HOME' ? 'home' : address.type === 'WORK' ? 'briefcase' : 'map-marker'}
                  size={20}
                  color="#6C63FF"
                />
                <Text style={styles.addressTypeText}>{address.type}</Text>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <TouchableOpacity 
                    style={styles.addressAction}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <MaterialCommunityIcons name="star-outline" size={20} color="#666666" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.addressAction}
                  onPress={() => handleDeleteAddress(address.id)}
                >
                  <MaterialCommunityIcons name="delete-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.addressName}>{address.name}</Text>
            <Text style={styles.addressText}>{address.address}</Text>
            {address.landmark && (
              <Text style={styles.landmarkText}>Landmark: {address.landmark}</Text>
            )}
            <Text style={styles.pincodeText}>Pincode: {address.pincode}</Text>
          </View>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#F0F0FF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#6C63FF',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F0F0FF',
    borderRadius: 8,
    marginBottom: 16,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  defaultCheckboxText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressTypeText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 16,
  },
  addressAction: {
    padding: 4,
  },
  addressName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  landmarkText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  pincodeText: {
    fontSize: 14,
    color: '#666666',
  },
}); 