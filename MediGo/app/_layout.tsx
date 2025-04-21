import { Stack } from 'expo-router';
import { CartProvider } from './contexts/CartContext';

export default function Layout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CartProvider>
  );
} 