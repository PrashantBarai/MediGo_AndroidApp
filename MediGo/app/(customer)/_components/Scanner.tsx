import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';

interface ScannerProps {
  onScanComplete: (upiUrl: string) => void;
}

export default function Scanner({ onScanComplete }: ScannerProps) {
  const [loading, setLoading] = useState(false);

  const handleOpenScanner = () => {
    setLoading(true);
    // External QR code scanner API URL
    const scannerUrl = 'https://your-external-scanner-api.com';
    
    // Open external scanner in browser
    router.push({
      pathname: '/webview',
      params: { url: scannerUrl }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading scanner...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Scan QR Code',
          headerShown: true,
        }}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>Scan UPI QR Code</Text>
        <Text style={styles.subtitle}>
          Please scan the UPI QR code to make payment
        </Text>
        
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleOpenScanner}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={40} color="white" />
          <Text style={styles.scanButtonText}>Open Scanner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#6C63FF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
}); 