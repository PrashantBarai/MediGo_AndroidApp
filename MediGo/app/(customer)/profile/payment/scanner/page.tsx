import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScannerPage() {
  const { returnTo } = useLocalSearchParams();

  useEffect(() => {
    // Simulate scanning UPI QR code
    const simulateScan = async () => {
      // In real app, this would be the URL from external scanner
      const upiUrl = 'upi://pay?pa=merchant@upi&pn=Merchant&am=100&cu=INR';
      
      // Store the scanned UPI URL
      await AsyncStorage.setItem('scannedUpiUrl', upiUrl);
      
      // Navigate back to the previous screen
      if (returnTo) {
        router.replace(returnTo as string);
      } else {
        router.back();
      }
    };

    simulateScan();
  }, [returnTo]);

  return (
    <View style={styles.container}>
      {/* Loading indicator or scanner UI */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
}); 