import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useCart } from '../../../contexts/CartContext';
import type { CartItem } from '../../../contexts/CartContext';

export default function Cart() {
  const router = useRouter();
  const { items, updateQuantity, clearCart, getTotal } = useCart();

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearCart
        }
      ]
    );
  };

  const calculateDiscount = (price: number, discount?: { percentage: number }) => {
    if (!discount) return price;
    return Math.round(price * (1 - discount.percentage / 100));
  };

  const calculateTotalSavings = () => {
    return items.reduce((savings, item) => {
      if (item.discount) {
        const originalTotal = item.price * item.quantity;
        const discountedTotal = calculateDiscount(item.price, item.discount) * item.quantity;
        return savings + (originalTotal - discountedTotal);
      }
      return savings;
    }, 0);
  };

  const renderDefaultIcon = (category: string) => {
    console.log('Rendering default icon for category:', category); // Debug log
    return (
      <View style={styles.defaultIcon}>
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
  };

  const renderItemImage = (item: CartItem) => {
    console.log('Rendering item image:', item.image); // Debug log
    if (item.image) {
      return (
        <Image 
          source={{ uri: item.image }} 
          style={styles.itemImage}
          onError={() => {
            console.log('Image load error for:', item.name); // Debug log
            return renderDefaultIcon(item.category);
          }}
        />
      );
    }
    return renderDefaultIcon(item.category);
  };

  if (items.length === 0) {
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
          <Text style={styles.itemCount}>{items.length} items</Text>
        </View>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearCart}
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
        {items.map((item, index) => {
          const discountedPrice = calculateDiscount(item.price, item.discount);
          const totalItemPrice = discountedPrice * item.quantity;

          return (
            <Animated.View 
              key={item.id}
              entering={FadeInDown.delay(index * 100)}
              exiting={FadeOutDown}
              style={styles.cartItem}
            >
              <View style={styles.itemHeader}>
                {renderItemImage(item)}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemManufacturer}>{item.manufacturer}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.itemPrice}>₹{discountedPrice}</Text>
                    {item.discount && (
                      <>
                        <Text style={styles.originalPrice}>₹{item.price}</Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{item.discount.percentage}% OFF</Text>
                        </View>
                      </>
                    )}
                  </View>
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
                <Text style={styles.totalPrice}>₹{totalItemPrice}</Text>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Summary */}
      <Animated.View 
        entering={FadeInDown}
        style={styles.summary}
      >
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Items ({items.length})</Text>
            <Text style={styles.summaryValue}>₹{getTotal()}</Text>
          </View>
          {calculateTotalSavings() > 0 && (
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: '#4CD964' }]}>Total Savings</Text>
              <Text style={[styles.summaryValue, { color: '#4CD964' }]}>
                -₹{calculateTotalSavings()}
              </Text>
            </View>
          )}
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
  defaultIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#6C63FF15',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  originalPrice: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FF525215',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '600',
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
  summary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  summaryContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
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