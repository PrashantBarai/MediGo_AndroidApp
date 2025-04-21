import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Discount {
  percentage: number;
  validUntil: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  manufacturer: string;
  quantity: number;
  discount?: Discount;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, increment: boolean) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalSavings: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async (cartItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    console.log('CartContext addItem called with:', item); // Debug log
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      if (existingItem) {
        const updatedItems = currentItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        console.log('Updating existing item:', updatedItems); // Debug log
        saveCart(updatedItems);
        return updatedItems;
      } else {
        const newItem = { ...item, quantity: 1 };
        const newItems = [...currentItems, newItem];
        console.log('Adding new item:', newItems); // Debug log
        saveCart(newItems);
        return newItems;
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== id);
      saveCart(newItems);
      return newItems;
    });
  };

  const updateQuantity = (id: string, increment: boolean) => {
    setItems(currentItems => {
      const updatedItems = currentItems.map(item => {
        if (item.id === id) {
          const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
          if (newQuantity === 0) {
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
      
      saveCart(updatedItems);
      return updatedItems;
    });
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem('cart');
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const calculateDiscountedPrice = (item: CartItem) => {
    if (!item.discount) return item.price;
    // Calculate with 2 decimal places precision
    return Number((item.price * (1 - item.discount.percentage / 100)).toFixed(2));
  };

  const getTotal = () => {
    return Number(items.reduce((total, item) => {
      const price = calculateDiscountedPrice(item);
      return total + (price * item.quantity);
    }, 0).toFixed(2));
  };

  const getTotalSavings = () => {
    return Number(items.reduce((savings, item) => {
      if (item.discount) {
        const originalTotal = item.price * item.quantity;
        const discountedTotal = calculateDiscountedPrice(item) * item.quantity;
        return savings + (originalTotal - discountedTotal);
      }
      return savings;
    }, 0).toFixed(2));
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getTotalSavings
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 