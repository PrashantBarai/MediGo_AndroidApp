import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderDetails {
  id: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    address: string;
  };
  paymentMethod: string;
  trackingSteps: {
    title: string;
    description: string;
    date: string;
    completed: boolean;
  }[];
}

export default function OrderDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock orders array with different statuses
  const MOCK_ORDERS: Record<string, OrderDetails> = {
    '1': {
      id: '1',
      date: '2024-02-15',
      status: 'PENDING',
      items: [
        {
          id: '1',
          name: 'Paracetamol 500mg',
          quantity: 2,
          price: 50,
          image: 'https://via.placeholder.com/100',
        },
        {
          id: '2',
          name: 'Vitamin C 1000mg',
          quantity: 1,
          price: 150,
          image: 'https://via.placeholder.com/100',
        },
      ],
      subtotal: 250,
      deliveryFee: 50,
      total: 300,
      deliveryAddress: {
        fullName: 'John Doe',
        phoneNumber: '+91 9876543210',
        address: '123, Main Street, City - 400001',
      },
      paymentMethod: 'Cash on Delivery',
      trackingSteps: [
        {
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          date: '15 Feb, 10:30 AM',
          completed: true
        },
        {
          title: 'Order Confirmed',
          description: 'Seller has confirmed your order',
          date: '',
          completed: false
        },
        {
          title: 'Processing',
          description: 'Your order is being processed',
          date: '',
          completed: false
        },
        {
          title: 'Shipped',
          description: 'Your order has been shipped',
          date: '',
          completed: false
        },
        {
          title: 'Delivered',
          description: 'Order will be delivered soon',
          date: '',
          completed: false
        }
      ]
    },
    '2': {
      id: '2',
      date: '2024-02-14',
      status: 'CONFIRMED',
      items: [
        {
          id: '3',
          name: 'Crocin Advance',
          quantity: 1,
          price: 80,
          image: 'https://via.placeholder.com/100',
        }
      ],
      subtotal: 80,
      deliveryFee: 50,
      total: 130,
      deliveryAddress: {
        fullName: 'Jane Smith',
        phoneNumber: '+91 9876543211',
        address: '456, Park Avenue, City - 400002',
      },
      paymentMethod: 'UPI',
      trackingSteps: [
        {
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          date: '14 Feb, 09:30 AM',
          completed: true
        },
        {
          title: 'Order Confirmed',
          description: 'Seller has confirmed your order',
          date: '14 Feb, 10:00 AM',
          completed: true
        },
        {
          title: 'Processing',
          description: 'Your order is being processed',
          date: '',
          completed: false
        },
        {
          title: 'Shipped',
          description: 'Your order has been shipped',
          date: '',
          completed: false
        },
        {
          title: 'Delivered',
          description: 'Order will be delivered soon',
          date: '',
          completed: false
        }
      ]
    },
    '3': {
      id: '3',
      date: '2024-02-13',
      status: 'DELIVERED',
      items: [
        {
          id: '4',
          name: 'Multivitamin Tablets',
          quantity: 2,
          price: 200,
          image: 'https://via.placeholder.com/100',
        },
        {
          id: '5',
          name: 'Calcium Supplements',
          quantity: 1,
          price: 300,
          image: 'https://via.placeholder.com/100',
        }
      ],
      subtotal: 700,
      deliveryFee: 0,
      total: 700,
      deliveryAddress: {
        fullName: 'Mike Johnson',
        phoneNumber: '+91 9876543212',
        address: '789, Lake View, City - 400003',
      },
      paymentMethod: 'Credit Card',
      trackingSteps: [
        {
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          date: '13 Feb, 11:30 AM',
          completed: true
        },
        {
          title: 'Order Confirmed',
          description: 'Seller has confirmed your order',
          date: '13 Feb, 12:00 PM',
          completed: true
        },
        {
          title: 'Processing',
          description: 'Your order is being processed',
          date: '13 Feb, 02:00 PM',
          completed: true
        },
        {
          title: 'Shipped',
          description: 'Your order has been shipped',
          date: '13 Feb, 04:00 PM',
          completed: true
        },
        {
          title: 'Delivered',
          description: 'Order has been delivered',
          date: '14 Feb, 11:00 AM',
          completed: true
        }
      ]
    },
    '4': {
      id: '4',
      date: '2024-02-12',
      status: 'CANCELLED',
      items: [
        {
          id: '6',
          name: 'First Aid Kit',
          quantity: 1,
          price: 500,
          image: 'https://via.placeholder.com/100',
        }
      ],
      subtotal: 500,
      deliveryFee: 50,
      total: 550,
      deliveryAddress: {
        fullName: 'Sarah Wilson',
        phoneNumber: '+91 9876543213',
        address: '321, Hill Road, City - 400004',
      },
      paymentMethod: 'UPI',
      trackingSteps: [
        {
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          date: '12 Feb, 03:30 PM',
          completed: true
        },
        {
          title: 'Order Confirmed',
          description: 'Seller has confirmed your order',
          date: '12 Feb, 04:00 PM',
          completed: true
        },
        {
          title: 'Cancelled',
          description: 'Order has been cancelled',
          date: '12 Feb, 05:00 PM',
          completed: true
        }
      ]
    },
    '5': {
      id: '5',
      date: '2024-02-14',
      status: 'SHIPPED',
      items: [
        {
          id: '7',
          name: 'Blood Pressure Monitor',
          quantity: 1,
          price: 1200,
          image: 'https://via.placeholder.com/100',
        },
        {
          id: '8',
          name: 'Digital Thermometer',
          quantity: 2,
          price: 150,
          image: 'https://via.placeholder.com/100',
        }
      ],
      subtotal: 1500,
      deliveryFee: 0,
      total: 1500,
      deliveryAddress: {
        fullName: 'Robert Brown',
        phoneNumber: '+91 9876543214',
        address: '567, Green Park, City - 400005',
      },
      paymentMethod: 'Credit Card',
      trackingSteps: [
        {
          title: 'Order Placed',
          description: 'Your order has been placed successfully',
          date: '14 Feb, 02:30 PM',
          completed: true
        },
        {
          title: 'Order Confirmed',
          description: 'Seller has confirmed your order',
          date: '14 Feb, 03:00 PM',
          completed: true
        },
        {
          title: 'Processing',
          description: 'Your order is being processed',
          date: '14 Feb, 04:00 PM',
          completed: true
        },
        {
          title: 'Shipped',
          description: 'Your order has been shipped',
          date: '14 Feb, 05:00 PM',
          completed: true
        },
        {
          title: 'Delivered',
          description: 'Order will be delivered soon',
          date: '',
          completed: false
        }
      ]
    }
  };

  // Get order details based on ID
  const orderDetails = MOCK_ORDERS[id || '1'];

  // Handle invalid order ID
  if (!orderDetails) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#FF5252" />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorMessage}>Sorry, ye order nahi mil paya</Text>
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

  const handleCancelOrder = () => {
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
          onPress: () => {
            // API call to cancel order
            Alert.alert('Success', 'Order cancel ho gaya hai');
            router.back();
          },
        },
      ]
    );
  };

  const handleReorder = async () => {
    try {
      // Get existing cart items
      const existingCart = await AsyncStorage.getItem('cartItems');
      let cartItems = existingCart ? JSON.parse(existingCart) : [];
      
      // Add order items to cart
      orderDetails.items.forEach(item => {
        const existingItem = cartItems.find((cartItem: any) => cartItem.id === item.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          cartItems.push(item);
        }
      });

      // Save updated cart
      await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));

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
            onPress: () => router.push('/checkout'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Items cart mein add nahi ho paye. Please try again.');
    }
  };

  const getStatusColor = (status: OrderDetails['status']) => {
    switch (status) {
      case 'PENDING':
        return '#FFA000';
      case 'CONFIRMED':
        return '#1976D2';
      case 'PROCESSING':
        return '#7B1FA2';
      case 'SHIPPED':
        return '#0097A7';
      case 'DELIVERED':
        return '#43A047';
      case 'CANCELLED':
        return '#D32F2F';
      default:
        return '#666';
    }
  };

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
              <Text style={styles.orderId}>Order #{orderDetails.id}</Text>
              <Text style={styles.orderDate}>{orderDetails.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(orderDetails.status)}20` }]}>
              <MaterialCommunityIcons 
                name={orderDetails.status === 'CANCELLED' ? 'close-circle' : 'check-circle'} 
                size={16} 
                color={getStatusColor(orderDetails.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(orderDetails.status) }]}>
                {orderDetails.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
            {orderDetails.trackingSteps.map((step, index) => (
              <View key={index} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    { backgroundColor: step.completed ? '#4CAF50' : '#E0E0E0' }
                  ]} />
                  {index !== orderDetails.trackingSteps.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: step.completed ? '#4CAF50' : '#E0E0E0' }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{step.title}</Text>
                  <Text style={styles.timelineDescription}>{step.description}</Text>
                  {step.date && (
                    <Text style={styles.timelineDate}>{step.date}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {orderDetails.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressName}>{orderDetails.deliveryAddress.fullName}</Text>
            <Text style={styles.addressPhone}>{orderDetails.deliveryAddress.phoneNumber}</Text>
            <Text style={styles.address}>{orderDetails.deliveryAddress.address}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentMethod}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <Text style={styles.paymentMethodText}>{orderDetails.paymentMethod}</Text>
          </View>
          <View style={styles.paymentBreakdown}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal</Text>
              <Text style={styles.paymentValue}>₹{orderDetails.subtotal}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee</Text>
              <Text style={styles.paymentValue}>₹{orderDetails.deliveryFee}</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{orderDetails.total}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {orderDetails.status !== 'DELIVERED' && 
           orderDetails.status !== 'CANCELLED' && 
           orderDetails.status !== 'SHIPPED' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#D32F2F" />
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          {(orderDetails.status === 'DELIVERED' || 
            orderDetails.status === 'CONFIRMED' || 
            orderDetails.status === 'CANCELLED' ||
            orderDetails.status === 'SHIPPED') && (
            <TouchableOpacity 
              style={[
                styles.reorderButton,
                orderDetails.status === 'CANCELLED' && { backgroundColor: '#FFF5F5' }
              ]}
              onPress={handleReorder}
            >
              <MaterialCommunityIcons 
                name="cart-plus" 
                size={20} 
                color={orderDetails.status === 'CANCELLED' ? '#FF5252' : '#6C63FF'} 
              />
              <Text style={[
                styles.reorderButtonText,
                orderDetails.status === 'CANCELLED' && { color: '#FF5252' }
              ]}>
                Reorder Items
              </Text>
            </TouchableOpacity>
          )}
          
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 15,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addressContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  paymentBreakdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#FFE5E5',
    borderRadius: 10,
    marginBottom: 15,
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
    padding: 15,
    backgroundColor: '#F0F0FF',
    borderRadius: 10,
    marginBottom: 15,
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
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  helpButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    marginLeft: 8,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  goBackButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 