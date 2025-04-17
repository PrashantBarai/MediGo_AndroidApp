import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CardType = 'credit' | 'debit';

interface PaymentMethod {
  id: string;
  type: CardType;
  cardNumber: string;
  expiryDate: string;
  cardHolderName: string;
}

export default function AddPaymentMethod() {
  const [cardData, setCardData] = useState<{
    type: CardType;
    cardNumber: string;
    expiryDate: string;
    cardHolderName: string;
  }>({
    type: 'credit',
    cardNumber: '',
    expiryDate: '',
    cardHolderName: '',
  });

  const handleSave = async () => {
    try {
      // Validate fields
      if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cardHolderName) {
        Alert.alert('Error', 'Sabhi fields fill karein');
        return;
      }

      // Validate card number (16 digits)
      if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Error', 'Card number 16 digits ka hona chahiye');
        return;
      }

      // Validate expiry date (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryRegex.test(cardData.expiryDate)) {
        Alert.alert('Error', 'Expiry date MM/YY format mein enter karein');
        return;
      }

      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const newCard: PaymentMethod = {
          id: Date.now().toString(),
          ...cardData
        };
        profile.paymentMethods = [...(profile.paymentMethods || []), newCard];
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        Alert.alert('Success', 'Card add ho gaya hai', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Card add nahi ho paya. Dobara try karein.');
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Card</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardTypeSelector}>
            <TouchableOpacity 
              style={[
                styles.cardTypeButton,
                cardData.type === 'credit' && styles.cardTypeButtonActive
              ]}
              onPress={() => setCardData({ ...cardData, type: 'credit' })}
            >
              <MaterialCommunityIcons 
                name="credit-card" 
                size={24} 
                color={cardData.type === 'credit' ? '#6C63FF' : '#666666'} 
              />
              <Text style={[
                styles.cardTypeText,
                cardData.type === 'credit' && styles.cardTypeTextActive
              ]}>
                Credit Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.cardTypeButton,
                cardData.type === 'debit' && styles.cardTypeButtonActive
              ]}
              onPress={() => setCardData({ ...cardData, type: 'debit' })}
            >
              <MaterialCommunityIcons 
                name="credit-card-outline" 
                size={24} 
                color={cardData.type === 'debit' ? '#6C63FF' : '#666666'} 
              />
              <Text style={[
                styles.cardTypeText,
                cardData.type === 'debit' && styles.cardTypeTextActive
              ]}>
                Debit Card
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              value={cardData.cardNumber}
              onChangeText={(text) => setCardData({ 
                ...cardData, 
                cardNumber: formatCardNumber(text)
              })}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={cardData.expiryDate}
                onChangeText={(text) => setCardData({
                  ...cardData,
                  expiryDate: formatExpiryDate(text)
                })}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              value={cardData.cardHolderName}
              onChangeText={(text) => setCardData({ ...cardData, cardHolderName: text })}
              placeholder="Enter card holder name"
              autoCapitalize="characters"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Add Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/profile/payment/scanner')}
        >
          <View style={styles.scanButtonContent}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#6C63FF" />
            <View style={styles.scanTextContainer}>
              <Text style={styles.scanTitle}>Scan UPI QR Code</Text>
              <Text style={styles.scanSubtitle}>Pay using any UPI QR code</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cardTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  cardTypeButtonActive: {
    backgroundColor: '#F0F0FF',
  },
  cardTypeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  cardTypeTextActive: {
    color: '#6C63FF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
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
  saveButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanTextContainer: {
    marginLeft: 12,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scanSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 