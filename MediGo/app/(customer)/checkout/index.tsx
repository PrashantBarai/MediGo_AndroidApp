import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
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

export default function Checkout() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<string>('cod');
  const [address, setAddress] = useState<Address>({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
  });
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

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

  const handlePlaceOrder = () => {
    // TODO: Implement order placement logic
    router.replace('/(customer)/(tabs)/orders');
  };

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
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {!isOptional && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <TextInput
        style={styles.input}
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressForm}>
            {renderInput(
              'Full Name',
              address.fullName,
              (text) => setAddress({ ...address, fullName: text }),
              'Enter your full name'
            )}
            {renderInput(
              'Phone Number',
              address.phoneNumber,
              (text) => setAddress({ ...address, phoneNumber: text }),
              'Enter your phone number',
              'phone-pad'
            )}
            {renderInput(
              'Address Line 1',
              address.addressLine1,
              (text) => setAddress({ ...address, addressLine1: text }),
              'House/Flat No., Building Name'
            )}
            {renderInput(
              'Address Line 2',
              address.addressLine2,
              (text) => setAddress({ ...address, addressLine2: text }),
              'Street, Area, Landmark',
              'default',
              true
            )}
            <View style={styles.rowContainer}>
              <View style={{ flex: 2, marginRight: 12 }}>
                {renderInput(
                  'City',
                  address.city,
                  (text) => setAddress({ ...address, city: text }),
                  'Enter your city'
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput(
                  'Pincode',
                  address.pincode,
                  (text) => setAddress({ ...address, pincode: text }),
                  'Enter pincode',
                  'number-pad'
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Payment Method */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPayment === method.id && styles.selectedPayment,
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentMethodIcon}>
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={24}
                    color={selectedPayment === method.id ? '#6C63FF' : '#666666'}
                  />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={[
                    styles.paymentMethodName,
                    selectedPayment === method.id && styles.selectedPaymentText
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={styles.paymentMethodDescription}>
                    {method.description}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPayment === method.id && styles.radioButtonSelected,
                ]}>
                  {selectedPayment === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPayment === 'upi_qr' && styles.selectedPayment,
              ]}
              onPress={handleUPIPayment}
            >
              <View style={styles.paymentMethodIcon}>
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={24}
                  color={selectedPayment === 'upi_qr' ? '#6C63FF' : '#666666'}
                />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={[
                  styles.paymentMethodName,
                  selectedPayment === 'upi_qr' && styles.selectedPaymentText
                ]}>
                  Scan UPI QR
                </Text>
                <Text style={styles.paymentMethodDescription}>
                  Pay using any UPI QR code
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedPayment === 'upi_qr' && styles.radioButtonSelected,
              ]}>
                {selectedPayment === 'upi_qr' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Credit Card Details */}
          {selectedPayment === 'card' && (
            <Animated.View 
              entering={FadeInDown}
              style={styles.cardDetailsContainer}
            >
              <View style={styles.cardDetails}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Card Number
                    <Text style={styles.requiredStar}> *</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
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

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Card Holder Name
                    <Text style={styles.requiredStar}> *</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
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

                <View style={styles.rowContainer}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.inputLabel}>
                      Expiry Date
                      <Text style={styles.requiredStar}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
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
                    <Text style={styles.inputLabel}>
                      CVV
                      <Text style={styles.requiredStar}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
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
          style={[styles.section, styles.summarySection]}
        >
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹700</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹50</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.totalItem}>
              <View>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalDescription}>Including all taxes</Text>
              </View>
              <Text style={styles.totalValue}>₹750</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Place Order Button */}
      <Animated.View 
        entering={FadeInDown.delay(400)}
        style={styles.footer}
      >
        <TouchableOpacity 
          style={styles.placeOrderButton} 
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
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
}); 