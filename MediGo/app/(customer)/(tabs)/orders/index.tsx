import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';

type OrderStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
  product: {
    name: string;
    price: number;
    image?: string;
    category: string;
    manufacturer: string;
  };
  quantity: number;
  price: number;
  originalPrice: number;
  discount?: {
    percentage: number;
    validUntil: string;
  };
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  totalSavings: number;
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    address: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  displayStatus?: string;
}

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

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case 'ALL':
      return 'list-outline';
    case 'PENDING':
      return 'time-outline';
    case 'CONFIRMED':
      return 'checkmark-circle-outline';
    case 'SHIPPED':
      return 'bicycle-outline';
    case 'DELIVERED':
      return 'checkmark-done-outline';
    case 'CANCELLED':
      return 'close-circle-outline';
    default:
      return 'list-outline';
  }
};

export default function Orders() {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDisplayStatus = (status: string): string => {
    return status === 'placed' ? 'PENDING' : status.toUpperCase();
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://192.168.1.102:8082/api/orders/user?userId=guest');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Refresh when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Orders screen focused - fetching orders');
      fetchOrders();
    });

    return unsubscribe;
  }, [navigation]);

  const filteredOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter(order => getDisplayStatus(order.orderStatus) === selectedStatus);

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/(customer)/orders/[id]",
      params: { id: orderId }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchOrders}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterContainer, { maxHeight: 40 }]}
        contentContainerStyle={styles.filterContent}
      >
        {(['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === (status === 'All' ? 'ALL' : status.toUpperCase()) && styles.filterButtonActive,
            ]}
            onPress={() => {
              const newStatus = status === 'All' ? 'ALL' : status.toUpperCase();
              console.log('Setting status to:', newStatus);
              setSelectedStatus(newStatus);
            }}
          >
            <Ionicons
              name={getStatusIcon(status === 'All' ? 'ALL' : status.toUpperCase())}
              size={14}
              color={selectedStatus === (status === 'All' ? 'ALL' : status.toUpperCase()) 
                ? '#FFFFFF' 
                : getStatusColor(status === 'All' ? 'ALL' : status.toUpperCase())}
            />
            <Text
              style={[
                styles.filterText,
                selectedStatus === (status === 'All' ? 'ALL' : status.toUpperCase()) && styles.filterTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#9E9E9E" />
          <Text style={styles.emptyText}>No orders yet</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(customer)/(tabs)/home")}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#9E9E9E" />
          <Text style={styles.emptyText}>No {selectedStatus.toLowerCase()} orders</Text>
          <TouchableOpacity
            style={styles.filterResetButton}
            onPress={() => setSelectedStatus('ALL')}
          >
            <Text style={styles.filterResetButtonText}>Show All Orders</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.ordersList}>
          {filteredOrders.map((order, index) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order._id)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>Order: {index + 1}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.orderDate).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(getDisplayStatus(order.orderStatus)) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(getDisplayStatus(order.orderStatus))}
                    size={14}
                    color={getStatusColor(getDisplayStatus(order.orderStatus))}
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(getDisplayStatus(order.orderStatus)) },
                    ]}
                  >
                    {getDisplayStatus(order.orderStatus)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.itemCount}>{order.items.length} items</Text>
                <Text style={styles.orderTotal}>₹{order.totalAmount}</Text>
              </View>
              <View style={styles.viewDetailsContainer}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={20} color="#6C63FF" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    color: '#FF5252',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterResetButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  filterResetButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    height: 40,
  },
  filterContent: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 8,
    alignItems: 'center',
    height: '100%',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    gap: 4,
    minWidth: 85,
    height: 32,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#6C63FF',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  ordersList: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingTop: 8,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusIcon: {
    marginRight: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemCount: {
    fontSize: 13,
    color: '#666',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#6C63FF',
    marginRight: 2,
  },
}); 