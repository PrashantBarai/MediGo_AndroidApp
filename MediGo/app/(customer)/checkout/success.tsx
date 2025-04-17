import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CheckoutSuccess() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeInDown.delay(200)}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="check-circle" 
            size={80} 
            color="#4CAF50" 
          />
        </View>
        
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed and will be delivered soon.
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/(customer)/(tabs)/orders')}
        >
          <Text style={styles.buttonText}>View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/(customer)/(tabs)/home/home')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  secondaryButtonText: {
    color: '#6C63FF',
  },
}); 