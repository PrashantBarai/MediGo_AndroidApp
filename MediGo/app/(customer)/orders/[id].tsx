import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import QRCode from 'qrcode';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { BACKEND_API_URL } from '../../config/config';
import { cancelOrder } from '../../../services/order.service';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  manufacturer: string;
  quantity: number;
  discount?: {
    percentage: number;
    validUntil: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  manufacturer: string;
  stock: number;
  discount?: {
    percentage: number;
    validUntil: string;
  };
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  originalPrice: number;
  discount?: {
    percentage: number;
    validUntil: string;
  };
}

interface TrackingStep {
    title: string;
    description: string;
    date: string;
    completed: boolean;
  color: string;
}

interface DeliveryAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  totalSavings: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  trackingSteps?: TrackingStep[];
}

export default function OrderDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, removeItem, clearCart } = useCart();
  let stockChecks: { product: Product; requestedQuantity: number; availableStock: number; isAvailable: boolean }[] = [];
  const [qrVisible, setQrVisible] = useState(false);
  const qrViewRef = useRef<View>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BACKEND_API_URL}/api/orders/${id}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      
      const data = await response.json();
      console.log('Order Status:', data.orderStatus); // Debug log
      const trackingSteps = getTrackingSteps(data.orderStatus);
      setOrder({ ...data, trackingSteps });
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Sorry, ye order nahi mil paya');
    } finally {
      setLoading(false);
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      {
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
        date: order?.orderDate ? new Date(order.orderDate).toLocaleString('en-IN') : '',
        completed: true,
        color: status === 'cancelled' ? '#FF9800' : '#4CAF50'
      },
      {
        title: 'Order Confirmed',
        description: 'Seller has confirmed your order',
        date: '',
        completed: ['confirmed', 'shipped', 'delivered'].includes(status),
        color: status === 'cancelled' ? '#FF9800' : '#4CAF50'
      },
      {
        title: 'Shipped',
        description: 'Your order has been shipped',
        date: '',
        completed: ['shipped', 'delivered'].includes(status),
        color: status === 'cancelled' ? '#FF9800' : '#4CAF50'
      },
      {
        title: 'Delivered',
        description: 'Order has been delivered',
        date: '',
        completed: status === 'delivered',
        color: status === 'cancelled' ? '#FF9800' : '#4CAF50'
      }
    ];

    if (status === 'cancelled') {
      return [
        ...steps.filter(step => step.completed),
        {
          title: 'Order Cancelled',
          description: 'Order has been cancelled',
          date: new Date().toLocaleString('en-IN'),
          completed: true,
          color: '#F44336'
        }
      ];
    }

    return steps;
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      'Cancel Order',
      'Kya aap sure hain ki aap order cancel karna chahte hain?',
      [
        {
          text: 'Nahi',
          style: 'cancel',
        },
        {
          text: 'Haan',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`${BACKEND_API_URL}/api/orders/${id}/cancel`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                throw new Error('Failed to cancel order');
              }

              Alert.alert(
                'Success',
                'Order cancel ho gaya hai',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back()
                  }
                ]
              );
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Order cancel nahi ho paya. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const showSuccessAlert = () => {
    Alert.alert(
      'Success',
      'Saare items cart mein add ho gaye hain',
      [
        {
          text: 'View Cart',
          onPress: () => router.push('/(customer)/(tabs)/cart'),
        },
        {
          text: 'Checkout',
          onPress: async () => {
            // Clear existing cart first to avoid mixing items
            await clearCart();
            // Add all items again to ensure fresh state
            for (const check of stockChecks) {
              if (check.availableStock > 0) {
                const quantity = Math.min(check.requestedQuantity, check.availableStock);
                addToCart({
                  id: check.product._id,
                  name: check.product.name,
                  price: check.product.price,
                  image: check.product.image,
                  category: check.product.category,
                  manufacturer: check.product.manufacturer,
                  quantity: quantity,
                  discount: check.product.discount
                });
              }
            }
            // Then navigate to checkout
            router.push('/checkout');
          },
        },
      ]
    );
  };

  const handleReorder = async () => {
    try {
      // Store stock checks in component state for use in showSuccessAlert
      stockChecks = await Promise.all(order?.items.map(async (item) => {
        const response = await fetch(`${BACKEND_API_URL}/api/products/${item.product._id}`);
        if (!response.ok) throw new Error(`Could not check stock for ${item.product.name}`);
        const productData = await response.json();
        
        // Ensure we have the complete image URL
        const imageUrl = productData.images && productData.images.length > 0 
          ? (productData.images[0].startsWith('http') 
            ? productData.images[0] 
            : `${BACKEND_API_URL}${productData.images[0]}`)
          : null;
        
        return {
          product: {
            ...item.product,
            stock: productData.stock,
            image: imageUrl,
            price: productData.price, // Use latest price from product data
            discount: productData.discount // Use latest discount from product data
          },
          requestedQuantity: item.quantity,
          availableStock: productData.stock,
          isAvailable: productData.stock >= item.quantity
        };
      }) || []);

      // Check if any items have insufficient stock
      const unavailableItems = stockChecks.filter(item => !item.isAvailable);
      
      if (unavailableItems.length > 0) {
        // Create message for unavailable items
        const itemMessages = unavailableItems.map(item => 
          `${item.product.name} (requested: ${item.requestedQuantity}, available: ${item.availableStock})`
        ).join('\n');

      Alert.alert(
          'Stock Not Available',
          `Some items have insufficient stock:\n\n${itemMessages}\n\nWould you like to add available items to cart?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Add Available Items',
              onPress: async () => {
                // Add items with available stock
                for (const check of stockChecks) {
                  if (check.availableStock > 0) {
                    const quantity = Math.min(check.requestedQuantity, check.availableStock);
                    addToCart({
                      id: check.product._id,
                      name: check.product.name,
                      price: check.product.price,
                      image: check.product.image,
                      category: check.product.category,
                      manufacturer: check.product.manufacturer,
                      quantity: quantity,
                      discount: check.product.discount
                    });
                  }
                }
                showSuccessAlert();
              }
            }
          ]
        );
        return;
      }

      // If all items are available, add them to cart
      for (const check of stockChecks) {
        addToCart({
          id: check.product._id,
          name: check.product.name,
          price: check.product.price,
          image: check.product.image,
          category: check.product.category,
          manufacturer: check.product.manufacturer,
          quantity: check.requestedQuantity,
          discount: check.product.discount
        });
      }

      showSuccessAlert();
    } catch (error) {
      console.error('Reorder error:', error);
      Alert.alert('Error', 'Items cart mein add nahi ho paye. Please try again.');
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity: number }) => {
    console.log('addToCart called with item:', item); // Debug log
    
    // First remove any existing instance of this item
    removeItem(item.id);
    
    // Then add the item once with all properties
    const itemWithoutQuantity = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      manufacturer: item.manufacturer,
      discount: item.discount
    };
    
    console.log('Adding to cart:', itemWithoutQuantity); // Debug log
    
    // Add the item the specified number of times
    for (let i = 0; i < item.quantity; i++) {
      addItem(itemWithoutQuantity);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PLACED':
      case 'PENDING':
        return '#FF9800';
      case 'CONFIRMED':
        return '#2196F3';
      case 'SHIPPED':
        return '#9C27B0';
      case 'DELIVERED':
        return '#4CAF50';
      case 'CANCELLED':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const generateOrderQRData = () => {
    if (!order) return '';
    
    const qrData = {
      orderId: order._id,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      orderDate: order.orderDate,
      customerName: order.deliveryAddress.fullName,
      phoneNumber: order.deliveryAddress.phoneNumber
    };

    return JSON.stringify(qrData);
  };

  const handleShareQR = async () => {
    try {
      const qrData = generateOrderQRData();
      const filePath = `${FileSystem.cacheDirectory}order_${order?._id}_qr.png`;
      
      // Generate QR code as base64
      const qrBase64 = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Convert base64 to file
      const base64Data = qrBase64.replace(/^data:image\/png;base64,/, '');
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Share the QR code image
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'image/png',
          dialogTitle: `Order #${order?._id.slice(-6)} QR Code`
        });
        
        // Clean up
        await FileSystem.deleteAsync(filePath);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'QR code generate nahi ho paya. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const canCancelOrder = order.orderStatus === 'placed' || order.orderStatus === 'confirmed';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Status */}
        <View style={styles.section}>
          <View style={styles.orderInfo}>
            <View>
              <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.orderDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.orderStatus) + '20' }
            ]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>
                {order.orderStatus.charAt(0) + order.orderStatus.slice(1).toLowerCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Timeline */}
        {order.trackingSteps && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
              {order.trackingSteps.map((step, index) => (
              <View key={index} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                      { backgroundColor: step.completed ? step.color : '#E0E0E0' }
                  ]} />
                    {order.trackingSteps && index !== order.trackingSteps.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                        { backgroundColor: step.completed ? step.color : '#E0E0E0' }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      step.color === '#F44336' && { color: '#F44336' }
                    ]}>{step.title}</Text>
                  <Text style={styles.timelineDescription}>{step.description}</Text>
                  {step.date && (
                    <Text style={styles.timelineDate}>{step.date}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              </View>
              <View style={styles.itemPricing}>
                {item.discount && (
                  <Text style={styles.itemDiscount}>{item.discount.percentage}% off</Text>
                )}
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressDetails}>
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>Name:</Text>
              <Text style={styles.addressValue}>{order.deliveryAddress.fullName}</Text>
            </View>
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>Contact:</Text>
              <Text style={styles.addressValue}>{order.deliveryAddress.phoneNumber}</Text>
            </View>
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>Address:</Text>
              <Text style={styles.addressValue}>{order.deliveryAddress.addressLine1}</Text>
            </View>
            {order.deliveryAddress.addressLine2 && (
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>Address 2:</Text>
                <Text style={styles.addressValue}>{order.deliveryAddress.addressLine2}</Text>
              </View>
            )}
            {order.deliveryAddress.landmark && (
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>Landmark:</Text>
                <Text style={styles.addressValue}>{order.deliveryAddress.landmark}</Text>
              </View>
            )}
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>City:</Text>
              <Text style={styles.addressValue}>{order.deliveryAddress.city}</Text>
            </View>
            {order.deliveryAddress.state && (
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>State:</Text>
                <Text style={styles.addressValue}>{order.deliveryAddress.state}</Text>
              </View>
            )}
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>Pincode:</Text>
              <Text style={styles.addressValue}>{order.deliveryAddress.pincode}</Text>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentValue}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status</Text>
            <Text style={[
              styles.paymentStatus,
              { color: order.paymentStatus === 'PAID' ? '#4CAF50' : '#FF9800' }
            ]}>
              {order.paymentStatus}
            </Text>
            </View>
            </View>

        {/* Price Details */}
        <View style={[styles.section, styles.priceSection]}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Total</Text>
            <Text style={styles.priceValue}>₹{order.totalAmount - order.deliveryFee}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>₹{order.deliveryFee}</Text>
          </View>
          {order.totalSavings > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.savingsLabel}>Total Savings</Text>
              <Text style={styles.savingsValue}>-₹{order.totalSavings}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {(order.orderStatus === 'placed' || order.orderStatus === 'confirmed') && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#D32F2F" />
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          {/* QR Code Button */}
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={handleShareQR}
          >
            <MaterialCommunityIcons name="qrcode" size={20} color="#6C63FF" />
            <Text style={styles.qrButtonText}>Share Order QR</Text>
          </TouchableOpacity>
          
          {/* Existing reorder button */}
          <TouchableOpacity 
            style={[
              styles.reorderButton,
              order.orderStatus === 'cancelled' && { backgroundColor: '#FFF5F5' }
            ]}
            onPress={handleReorder}
          >
            <MaterialCommunityIcons 
              name="cart-plus" 
              size={20} 
              color={order.orderStatus === 'cancelled' ? '#FF5252' : '#6C63FF'} 
            />
            <Text style={[
              styles.reorderButtonText,
              order.orderStatus === 'cancelled' && { color: '#FF5252' }
            ]}>
              Reorder Items
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={20} color="#6C63FF" />
            <Text style={styles.helpButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    marginTop: -4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemDiscount: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addressDetails: {
    marginTop: 8,
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
    fontWeight: '500',
  },
  addressValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceSection: {
    backgroundColor: '#FAFAFA',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  savingsLabel: {
    fontSize: 14,
    color: '#4CAF50',
  },
  savingsValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#D32F2F',
    marginLeft: 8,
    fontWeight: '600',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F0F0FF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reorderButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    marginLeft: 8,
    fontWeight: '600',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  helpButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    marginLeft: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  goBackButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F0F0FF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    marginLeft: 8,
    fontWeight: '600',
  },
}); 