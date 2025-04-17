import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  cardNumber: string;
  expiryDate: string;
  cardHolderName: string;
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const { paymentMethods } = JSON.parse(savedProfile);
        setPaymentMethods(paymentMethods || []);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setIsLoading(false);
    }
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert(
      'Delete Card',
      'Kya aap sure hain ki aap is card ko delete karna chahte hain?',
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
                profile.paymentMethods = profile.paymentMethods.filter(
                  (method: PaymentMethod) => method.id !== id
                );
                await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
                setPaymentMethods(profile.paymentMethods);
                Alert.alert('Success', 'Card delete ho gaya hai');
              }
            } catch (error) {
              Alert.alert('Error', 'Card delete nahi ho paya. Dobara try karein.');
            }
          }
        }
      ]
    );
  };

  const handleAddCard = () => {
    router.push('/(customer)/profile/payment/add' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={handleAddCard} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <Text>Loading...</Text>
          </View>
        ) : paymentMethods.length === 0 ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="credit-card" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>No payment methods added yet</Text>
            <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
              <Text style={styles.addCardButtonText}>Add New Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons 
                    name={method.type === 'credit' ? 'credit-card' : 'credit-card-outline'} 
                    size={24} 
                    color="#6C63FF" 
                  />
                  <TouchableOpacity 
                    onPress={() => handleDeleteCard(method.id)}
                    style={styles.deleteButton}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={20} color="#FF5252" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardNumber}>
                  •••• •••• •••• {method.cardNumber.slice(-4)}
                </Text>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardLabel}>Card Holder</Text>
                    <Text style={styles.cardValue}>{method.cardHolderName}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardLabel}>Expires</Text>
                    <Text style={styles.cardValue}>{method.expiryDate}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
  },
  addCardButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardsList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButton: {
    padding: 4,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
}); 