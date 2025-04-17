import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

type OrderStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: number;
  total: number;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
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

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'ALL':
      return 'list-outline';
    case 'PENDING':
      return 'time-outline';
    case 'CONFIRMED':
      return 'checkmark-circle-outline';
    case 'SHIPPED':
      return 'bicycle-outline';
    case 'DELIVERED':
      return 'checkbox-outline';
    case 'CANCELLED':
      return 'close-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

export default function Orders() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('ALL');

  // Mock orders data (replace with API call)
  const orders: Order[] = [
    {
      id: '1',
      date: '2024-02-15',
      status: 'PENDING',
      items: 2,
      total: 300,
    },
    {
      id: '2',
      date: '2024-02-14',
      status: 'CONFIRMED',
      items: 1,
      total: 130,
    },
    {
      id: '5',
      date: '2024-02-14',
      status: 'SHIPPED',
      items: 2,
      total: 1500,
    },
    {
      id: '3',
      date: '2024-02-13',
      status: 'DELIVERED',
      items: 2,
      total: 700,
    },
    {
      id: '4',
      date: '2024-02-12',
      status: 'CANCELLED',
      items: 1,
      total: 550,
    }
  ];

  const filteredOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/(customer)/orders/[id]",
      params: { id: orderId }
    });
  };

  if (filteredOrders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color="#9E9E9E" />
        <Text style={styles.emptyText}>No orders yet</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/categories")}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
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
        {(['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Ionicons
              name={getStatusIcon(status)}
              size={14}
              color={selectedStatus === status ? '#FFFFFF' : getStatusColor(status)}
            />
            <Text
              style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive,
              ]}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.ordersList}>
        {filteredOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => handleOrderPress(order.id)}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(order.status)}20` },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(order.status)}
                  size={16}
                  color={getStatusColor(order.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.itemCount}>{order.items} items</Text>
              <Text style={styles.orderTotal}>₹{order.total}</Text>
            </View>
            <View style={styles.viewDetailsContainer}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons name="chevron-forward" size={20} color="#6C63FF" />
            </View>
          </TouchableOpacity>
        ))}
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
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
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
    marginTop: 15,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 