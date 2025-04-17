import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  manufacturer: string;
  category: string;
}

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Paracetamol 500mg',
      price: 50,
      quantity: 2,
      manufacturer: 'GSK Healthcare',
      category: 'Medicines'
    },
    {
      id: '2',
      name: 'Vitamin C 1000mg',
      price: 150,
      quantity: 1,
      manufacturer: 'HealthVit',
      category: 'Vitamins'
    },
    {
      id: '3',
      name: 'First Aid Kit',
      price: 500,
      quantity: 1,
      manufacturer: 'SafeCare',
      category: 'Medical Supplies'
    },
  ]);

  const updateQuantity = (id: string, increment: boolean) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: increment
                ? item.quantity + 1
                : Math.max(0, item.quantity - 1),
            }
          : item
      ).filter(item => item.quantity > 0) // Remove items with quantity 0
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const renderDefaultIcon = (category: string) => (
    <View style={{
      width: 60,
      height: 60,
      backgroundColor: '#6C63FF15',
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <MaterialCommunityIcons 
        name={
          category === 'Medicines' ? 'pill' : 
          category === 'Vitamins' ? 'bottle-tonic' : 
          'medical-bag'
        } 
        size={30} 
        color="#6C63FF" 
      />
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-outline" size={80} color="#6C63FF30" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add medicines to your cart and they will appear here</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push('/categories')}
        >
          <Text style={styles.shopButtonText}>Browse Medicines</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.itemCount}>{cartItems.length} items</Text>
        </View>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => setCartItems([])}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color="#FF5252" />
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <ScrollView 
        style={styles.cartList}
        contentContainerStyle={styles.cartListContent}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.map((item, index) => (
          <Animated.View 
            key={item.id}
            entering={FadeInDown.delay(index * 100)}
            exiting={FadeOutDown}
            style={styles.cartItem}
          >
            <View style={styles.itemHeader}>
              {item.image ? (
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.itemImage}
                  onError={() => renderDefaultIcon(item.category)}
                />
              ) : renderDefaultIcon(item.category)}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemManufacturer}>{item.manufacturer}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            </View>
            
            <View style={styles.itemFooter}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    item.quantity === 1 && styles.quantityButtonDanger
                  ]}
                  onPress={() => updateQuantity(item.id, false)}
                >
                  <MaterialCommunityIcons 
                    name={item.quantity === 1 ? "delete-outline" : "minus"} 
                    size={20} 
                    color={item.quantity === 1 ? "#FF5252" : "#6C63FF"} 
                  />
                </TouchableOpacity>
                <View style={styles.quantityWrapper}>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, true)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#6C63FF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalPrice}>₹{item.price * item.quantity}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <Animated.View 
        entering={FadeInDown}
        style={styles.bottomSection}
      >
        <View style={styles.totalContainer}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.itemCount}>Including all taxes</Text>
          </View>
          <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#666666',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF5252',
  },
  cartList: {
    flex: 1,
  },
  cartListContent: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemManufacturer: {
    fontSize: 14,
    color: '#666666',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C63FF',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDanger: {
    backgroundColor: '#FEE2E2',
  },
  quantityWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  checkoutButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 