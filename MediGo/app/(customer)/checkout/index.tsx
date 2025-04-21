import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../contexts/CartContext';
import { Colors } from '../../../constants/Colors';
import { styles } from './styles';

interface Address {
  fullName: string;
  phoneNumber: string;
  countryCode: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  state: string;
  city: string;
  pincode: string;
}

interface CardDetails {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: string;
}

const localStyles = StyleSheet.create({
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  addressForm: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  requiredStar: {
    color: '#FF5252',
  },
  input: {
    height: 48,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1A1A',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedPayment: {
    borderColor: '#6C63FF',
    backgroundColor: '#F8F7FF',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 13,
    color: '#666666',
  },
  selectedPaymentText: {
    color: '#6C63FF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#6C63FF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6C63FF',
  },
  summarySection: {
    marginBottom: 100,
  },
  summaryContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  totalDescription: {
    fontSize: 13,
    color: '#666666',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  placeOrderButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardDetailsContainer: {
    marginTop: 20,
  },
  cardDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTextContainer: {
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    color: '#6C63FF',
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  countryCodeContainer: {
    flex: 0.3,
  },
  phoneNumberContainer: {
    flex: 0.7,
  },
  countryCodeInput: {
    textAlign: 'center',
  },
});

export default function Checkout() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<Address>({
    fullName: '',
    phoneNumber: '',
    countryCode: '+91',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    state: '',
    city: '',
    pincode: ''
  });
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
  });

  const validateFields = () => {
    // Validate address fields
    if (!address.fullName || !address.phoneNumber || !address.addressLine1 || !address.state || !address.city || !address.pincode) {
      Alert.alert('Error', 'Please fill all required address fields');
      return false;
    }

    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(address.phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    // Validate country code
    if (!/^\+\d{2,3}$/.test(address.countryCode)) {
      Alert.alert('Error', 'Please enter a valid country code (e.g., +91)');
      return false;
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(address.pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return false;
    }

    // Validate card details if card payment selected
    if (selectedPayment === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardHolderName || !cardDetails.expiryDate || !cardDetails.cvv) {
        Alert.alert('Error', 'Please fill all card details');
        return false;
      }

      // Validate card number (16 digits)
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Error', 'Invalid card number');
        return false;
      }

      // Validate expiry date (MM/YY format)
      const [month, year] = cardDetails.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (!month || !year || 
          parseInt(month) < 1 || parseInt(month) > 12 ||
          parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        Alert.alert('Error', 'Invalid expiry date');
        return false;
      }

      // Validate CVV (3 digits)
      if (cardDetails.cvv.length !== 3) {
        Alert.alert('Error', 'Invalid CVV');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => {
          const discountedPrice = item.discount 
            ? Math.round(item.price * (1 - item.discount.percentage / 100))
            : item.price;

          return {
            product: item.id,
            quantity: item.quantity,
            price: discountedPrice, // Send discounted price
            originalPrice: item.price, // Keep original price for reference
            discount: item.discount
          };
        }),
        totalAmount: getTotal() + 50, // Including delivery fee
        deliveryFee: 50,
        totalSavings: items.reduce((total, item) => {
          if (item.discount) {
            const originalTotal = item.price * item.quantity;
            const discountedTotal = Math.round(item.price * (1 - item.discount.percentage / 100)) * item.quantity;
            return total + (originalTotal - discountedTotal);
          }
          return total;
        }, 0),
        deliveryAddress: {
          fullName: address.fullName,
          phoneNumber: `${address.countryCode}${address.phoneNumber}`,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || undefined,
          landmark: address.landmark || undefined,
          state: address.state,
          city: address.city,
          pincode: address.pincode
        },
        paymentMethod: selectedPayment
      };

      const response = await fetch('http://192.168.1.102:8082/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order');
      }

      // Handle successful order placement
      await clearCart();
      
      // Navigate to success page
      router.push({
        pathname: '/checkout/success',
        params: { orderId: result.data._id }
      });
    } catch (error) {
      console.error('Order placement error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods: PaymentMethod[] = [
    { 
      id: 'cod', 
      name: 'Cash on Delivery', 
      icon: 'cash-multiple',
      description: 'Pay when your order arrives'
    },
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: 'credit-card',
      description: 'Visa, Mastercard, RuPay accepted'
    },
  ];

  const handleUPIPayment = async () => {
    try {
      // Check if we have scanned UPI details
      const scannedUpiUrl = await AsyncStorage.getItem('scannedUpiUrl');
      if (scannedUpiUrl) {
        // Clear the stored UPI URL
        await AsyncStorage.removeItem('scannedUpiUrl');
        
        // Process payment with scanned UPI details
        setLoading(true);
        // Add your payment processing logic here
        await processUPIPayment(scannedUpiUrl);
        setLoading(false);
      } else {
        // No scanned UPI details, open scanner
        router.push('/(customer)/profile/payment/scanner/page?returnTo=checkout');
      }
    } catch (error) {
      setLoading(false);
      alert('Payment process nahi ho paaya. Please try again.');
    }
  };

  const processUPIPayment = async (upiUrl: string) => {
    try {
      // Extract UPI ID from URL
      const upiId = upiUrl.split('upi://pay?')[1];
      if (!upiId) {
        throw new Error('Invalid UPI URL');
      }

      // Process payment with UPI ID
      // Add your payment gateway integration here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing
      
      // Payment successful
      await handlePaymentSuccess();
    } catch (error) {
      throw new Error('Payment failed');
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Clear cart
      await AsyncStorage.removeItem('cart');
      
      // Navigate to success page
      router.push('/(customer)/checkout/success' as const);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'phone-pad' | 'number-pad' = 'default',
    isOptional: boolean = false
  ) => (
    <View style={localStyles.inputContainer}>
      <Text style={localStyles.inputLabel}>
        {label}
        {!isOptional && <Text style={localStyles.requiredStar}> *</Text>}
      </Text>
      <TextInput
        style={localStyles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || '';
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <KeyboardAvoidingView 
      style={localStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={localStyles.header}>
        <TouchableOpacity 
          style={localStyles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView 
        style={localStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={localStyles.section}
        >
          <Text style={localStyles.sectionTitle}>Delivery Address</Text>
          <View style={localStyles.addressForm}>
            {renderInput(
              'Full Name',
              address.fullName,
              (text) => setAddress(prev => ({ ...prev, fullName: text })),
              'Enter your full name'
            )}
            {/* Phone Number Input with Country Code */}
            <View style={localStyles.phoneContainer}>
              <View style={localStyles.countryCodeContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={localStyles.inputLabel}>Country Code</Text>
                  <Text style={localStyles.requiredStar}> *</Text>
                </View>
                <TextInput
                  style={[localStyles.input, localStyles.countryCodeInput]}
                  value={address.countryCode}
                  onChangeText={(text) => {
                    // Ensure it starts with + and only contains numbers
                    const formatted = text.startsWith('+') ? text : `+${text}`;
                    setAddress(prev => ({ 
                      ...prev, 
                      countryCode: formatted.replace(/[^\d+]/g, '').slice(0, 4)
                    }));
                  }}
                  placeholder="+91"
                  keyboardType="phone-pad"
                  maxLength={4}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={localStyles.phoneNumberContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={localStyles.inputLabel}>Phone Number</Text>
                  <Text style={localStyles.requiredStar}> *</Text>
                </View>
                <TextInput
                  style={localStyles.input}
                  value={address.phoneNumber}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '');
                    setAddress(prev => ({ ...prev, phoneNumber: cleaned.slice(0, 10) }));
                  }}
                  placeholder="Enter 10-digit number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {renderInput(
              'Address Line 1',
              address.addressLine1,
              (text) => setAddress(prev => ({ ...prev, addressLine1: text })),
              'House/Flat No., Building Name, Street'
            )}
            {renderInput(
              'Address Line 2',
              address.addressLine2 || '',
              (text) => setAddress(prev => ({ ...prev, addressLine2: text })),
              'Area, Colony, Sector',
              'default',
              true
            )}
            {renderInput(
              'Landmark',
              address.landmark || '',
              (text) => setAddress(prev => ({ ...prev, landmark: text })),
              'Nearby landmark (optional)',
              'default',
              true
            )}
            {renderInput(
              'State',
              address.state || '',
              (text) => setAddress(prev => ({ ...prev, state: text })),
              'Enter your state'
            )}
            {renderInput(
              'City',
              address.city,
              (text) => setAddress(prev => ({ ...prev, city: text })),
              'Enter your city'
            )}
            {renderInput(
              'Pincode',
              address.pincode,
              (text) => setAddress(prev => ({ ...prev, pincode: text.replace(/\D/g, '').slice(0, 6)})),
              'Enter your pincode',
              'number-pad'
            )}
          </View>
        </Animated.View>

        {/* Payment Method */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={localStyles.section}
        >
          <Text style={localStyles.sectionTitle}>Payment Method</Text>
          <View style={localStyles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  localStyles.paymentMethod,
                  selectedPayment === method.id && localStyles.selectedPayment,
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={localStyles.paymentMethodIcon}>
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={24}
                    color={selectedPayment === method.id ? '#6C63FF' : '#666666'}
                  />
                </View>
                <View style={localStyles.paymentMethodInfo}>
                  <Text style={[
                    localStyles.paymentMethodName,
                    selectedPayment === method.id && localStyles.selectedPaymentText
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={localStyles.paymentMethodDescription}>
                    {method.description}
                  </Text>
                </View>
                <View style={[
                  localStyles.radioButton,
                  selectedPayment === method.id && localStyles.radioButtonSelected,
                ]}>
                  {selectedPayment === method.id && (
                    <View style={localStyles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Credit Card Details */}
          {selectedPayment === 'card' && (
            <Animated.View 
              entering={FadeInDown}
              style={localStyles.cardDetailsContainer}
            >
              <View style={localStyles.cardDetails}>
                <View style={localStyles.inputContainer}>
                  <Text style={localStyles.inputLabel}>
                    Card Number
                    <Text style={localStyles.requiredStar}> *</Text>
                  </Text>
                  <TextInput
                    style={localStyles.input}
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChangeText={(text) => setCardDetails({ 
                      ...cardDetails, 
                      cardNumber: formatCardNumber(text)
                    })}
                    keyboardType="number-pad"
                    maxLength={19}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={localStyles.inputContainer}>
                  <Text style={localStyles.inputLabel}>
                    Card Holder Name
                    <Text style={localStyles.requiredStar}> *</Text>
                  </Text>
                  <TextInput
                    style={localStyles.input}
                    placeholder="Enter card holder name"
                    value={cardDetails.cardHolderName}
                    onChangeText={(text) => setCardDetails({ 
                      ...cardDetails, 
                      cardHolderName: text.toUpperCase()
                    })}
                    autoCapitalize="characters"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={localStyles.rowContainer}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={localStyles.inputLabel}>
                      Expiry Date
                      <Text style={localStyles.requiredStar}> *</Text>
                    </Text>
                    <TextInput
                      style={localStyles.input}
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChangeText={(text) => setCardDetails({ 
                        ...cardDetails, 
                        expiryDate: formatExpiryDate(text)
                      })}
                      keyboardType="number-pad"
                      maxLength={5}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={localStyles.inputLabel}>
                      CVV
                      <Text style={localStyles.requiredStar}> *</Text>
                    </Text>
                    <TextInput
                      style={localStyles.input}
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChangeText={(text) => setCardDetails({ 
                        ...cardDetails, 
                        cvv: text.replace(/\D/g, '').slice(0, 3)
                      })}
                      keyboardType="number-pad"
                      maxLength={3}
                      secureTextEntry
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Order Summary */}
        <Animated.View 
          entering={FadeInDown.delay(300)}
          style={[localStyles.section, localStyles.summarySection]}
        >
          <Text style={localStyles.sectionTitle}>Order Summary</Text>
          <View style={localStyles.summaryContent}>
            <View style={localStyles.summaryItem}>
              <Text style={localStyles.summaryLabel}>Items ({items.length})</Text>
              <Text style={localStyles.summaryValue}>₹{getTotal().toFixed(2)}</Text>
            </View>
            <View style={localStyles.summaryItem}>
              <Text style={localStyles.summaryLabel}>Delivery Fee</Text>
              <Text style={localStyles.summaryValue}>₹50.00</Text>
            </View>
            {items.some(item => item.discount) && (
              <View style={localStyles.summaryItem}>
                <Text style={[localStyles.summaryLabel, { color: '#4CD964' }]}>Total Savings</Text>
                <Text style={[localStyles.summaryValue, { color: '#4CD964' }]}>
                  -₹{items.reduce((savings, item) => {
                    if (item.discount) {
                      const originalPrice = item.price * item.quantity;
                      const discountedPrice = item.price * (1 - item.discount.percentage / 100) * item.quantity;
                      return savings + (originalPrice - discountedPrice);
                    }
                    return savings;
                  }, 0).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={localStyles.summaryDivider} />
            <View style={localStyles.totalItem}>
              <View>
                <Text style={localStyles.totalLabel}>Total Amount</Text>
                <Text style={localStyles.totalDescription}>Including all taxes</Text>
              </View>
              <Text style={localStyles.totalValue}>₹{(getTotal() + 50).toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Place Order Button */}
      <Animated.View 
        entering={FadeInDown.delay(400)}
        style={localStyles.footer}
      >
        <TouchableOpacity 
          style={[
            localStyles.placeOrderButton,
            loading && localStyles.placeOrderButtonDisabled
          ]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={localStyles.placeOrderButtonText}>Place Order</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
} 