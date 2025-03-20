import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { placeholderImageBase64 } from '../../../assets/placeholder';

interface Medicine {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const CustomerDashboard = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();

    // Mock data for demonstration
    setMedicines([
      {
        id: '1',
        name: 'Paracetamol',
        price: 5.99,
        description: 'Pain reliever and fever reducer',
        imageUrl: placeholderImageBase64,
      },
      {
        id: '2',
        name: 'Amoxicillin',
        price: 12.99,
        description: 'Antibiotic used to treat bacterial infections',
        imageUrl: placeholderImageBase64,
      },
      {
        id: '3',
        name: 'Ibuprofen',
        price: 7.49,
        description: 'Anti-inflammatory pain reliever',
        imageUrl: placeholderImageBase64,
      },
    ]);

    setNearbyPharmacies([
      {
        id: '1',
        name: 'City Pharmacy',
        address: '123 Main St',
        latitude: 37.78825,
        longitude: -122.4324,
      },
      {
        id: '2',
        name: 'Health Plus',
        address: '456 Oak Ave',
        latitude: 37.78925,
        longitude: -122.4344,
      },
    ]);
  }, []);

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <TouchableOpacity
      style={styles.medicineCard}
      onPress={() => {
        // @ts-ignore - Ignore navigation type errors temporarily
        navigation.navigate('ProductDetails', { 
          product: {
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.imageUrl,
            manufacturer: 'Generic Pharma',
            category: 'General Medicine',
            requiresPrescription: false,
            inStock: true,
            rating: 4.5
          }
        });
      }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.medicineImage}
      />
      <Text style={styles.medicineName}>{item.name}</Text>
      <Text style={styles.medicinePrice}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search medicines..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>
      {userLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {nearbyPharmacies.map((pharmacy) => (
            <Marker
              key={pharmacy.id}
              coordinate={{
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }}
              title={pharmacy.name}
              description={pharmacy.address}
            />
          ))}
        </MapView>
      )}

      <Text style={styles.sectionTitle}>Available Medicines</Text>
      <FlatList
        data={medicines}
        renderItem={renderMedicineItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  map: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  medicineCard: {
    width: 150,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  medicineImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
  },
  medicinePrice: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
});

export default CustomerDashboard;
