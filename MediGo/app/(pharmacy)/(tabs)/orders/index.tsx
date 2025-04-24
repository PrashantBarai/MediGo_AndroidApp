import { View, Text, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getOrders, Order, OrderItem, updateOrderStatus } from '@/services/order.service';

type OrderStatusType = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const getStatusColor = (status: OrderStatusType) => {
  switch (status) {
    case 'placed':
      return { bg: '#FFC10720', text: '#FFC107' };
    case 'confirmed':
      return { bg: '#2196F320', text: '#2196F3' };
    case 'shipped':
      return { bg: '#2196F320', text: '#2196F3' };
    case 'delivered':
      return { bg: '#4CAF5020', text: '#4CAF50' };
    case 'cancelled':
      return { bg: '#F4433620', text: '#F44336' };
    default:
      return { bg: '#6C63FF20', text: '#6C63FF' };
  }
};

const formatOrderId = (id: string) => {
  return id.slice(-6).toUpperCase();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${month} ${day}, ${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
};

export default function Orders() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderStats = [
    { label: 'All', count: orders.length, color: '#6C63FF' },
    { label: 'Placed', count: orders.filter(o => o.orderStatus === 'placed').length, color: '#FFC107' },
    { label: 'Processing', count: orders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'shipped').length, color: '#2196F3' },
    { label: 'Delivered', count: orders.filter(o => o.orderStatus === 'delivered').length, color: '#4CAF50' },
    { label: 'Cancelled', count: orders.filter(o => o.orderStatus === 'cancelled').length, color: '#FF5252' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    selectedStatus === 'All' || 
    (selectedStatus === 'Placed' && order.orderStatus === 'placed') ||
    (selectedStatus === 'Processing' && (order.orderStatus === 'confirmed' || order.orderStatus === 'shipped')) ||
    order.orderStatus.toLowerCase() === selectedStatus.toLowerCase()
  );

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'confirmed');
      await fetchOrders();
      setShowDetails(false);
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'cancelled');
      await fetchOrders();
      setShowDetails(false);
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'shipped');
      await fetchOrders();
      setShowDetails(false);
    } catch (error) {
      console.error('Error shipping order:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#6C63FF',
        padding: 16,
        paddingTop: 48,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 4
      }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 4 }}>Orders</Text>
        <Text style={{ color: '#FFFFFF99', fontSize: 16, fontWeight: '500' }}>Manage your orders</Text>
      </View>

      {/* Order Stats */}
      <View style={{ 
        backgroundColor: 'white',
        paddingVertical: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 2
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {orderStats.map((stat) => (
            <TouchableOpacity
              key={stat.label}
              onPress={() => setSelectedStatus(stat.label)}
              style={{
                backgroundColor: selectedStatus === stat.label ? stat.color : '#F8F9FA',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: stat.color,
              }}
            >
              <Text style={{ 
                color: selectedStatus === stat.label ? 'white' : stat.color,
                fontWeight: '600',
                fontSize: 14
              }}>
                {stat.label} ({stat.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={{ flex: 1, padding: 16 }}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {filteredOrders.map((order) => {
          const statusColor = getStatusColor(order.orderStatus as OrderStatusType);
          return (
            <TouchableOpacity
              key={order._id}
              onPress={() => handleViewDetails(order)}
            style={{
              backgroundColor: 'white',
                borderRadius: 12,
              padding: 16,
                marginBottom: 16,
              elevation: 2,
              shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Order #{formatOrderId(order._id)}</Text>
                <View style={{
                  backgroundColor: statusColor.bg,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: statusColor.text, fontSize: 12, fontWeight: '600' }}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: '#666', fontSize: 14 }}>{order.deliveryAddress.fullName}</Text>
                <Text style={{ color: '#666', fontSize: 14 }}>{order.deliveryAddress.phoneNumber}</Text>
            </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 14 }}>{formatDate(order.orderDate)}</Text>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>₹{order.totalAmount.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetails(false)}
      >
        {selectedOrder && (
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{ 
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
              maxHeight: '80%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '700' }}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

              <ScrollView>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Order #{formatOrderId(selectedOrder._id)}</Text>
                  <View style={{
                    backgroundColor: getStatusColor(selectedOrder.orderStatus as OrderStatusType).bg,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    alignSelf: 'flex-start',
                    marginBottom: 8
                  }}>
                    <Text style={{ color: getStatusColor(selectedOrder.orderStatus as OrderStatusType).text, fontSize: 12, fontWeight: '600' }}>
                      {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                    </Text>
                </View>
                  <Text style={{ color: '#666', fontSize: 14 }}>{formatDate(selectedOrder.orderDate)}</Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Customer Details</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.deliveryAddress.fullName}</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.deliveryAddress.phoneNumber}</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.deliveryAddress.addressLine1}</Text>
                  {selectedOrder.deliveryAddress.addressLine2 && (
                    <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.deliveryAddress.addressLine2}</Text>
                  )}
                  {selectedOrder.deliveryAddress.landmark && (
                    <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.deliveryAddress.landmark}</Text>
                  )}
                  <Text style={{ color: '#666', fontSize: 14 }}>
                    {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Order Items</Text>
                  {selectedOrder.items.map((item: OrderItem) => (
                    <View key={item.product._id} style={{ flexDirection: 'row', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600' }}>{item.product.name}</Text>
                        <Text style={{ color: '#666', fontSize: 14 }}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '600' }}>₹{item.price.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Subtotal</Text>
                    <Text style={{ fontSize: 14 }}>₹{(selectedOrder.totalAmount - selectedOrder.deliveryFee).toFixed(2)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Delivery Fee</Text>
                    <Text style={{ fontSize: 14 }}>₹{selectedOrder.deliveryFee.toFixed(2)}</Text>
                  </View>
                  {selectedOrder.totalSavings > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#4CAF50', fontSize: 14 }}>Total Savings</Text>
                      <Text style={{ color: '#4CAF50', fontSize: 14 }}>₹{selectedOrder.totalSavings.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>Total Amount</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>₹{selectedOrder.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Payment Details</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>
                    Method: {selectedOrder.paymentMethod.toUpperCase()}
                  </Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>
                    Status: {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </Text>
                </View>

                {/* Order Actions */}
                {selectedOrder.orderStatus === 'placed' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                    <TouchableOpacity
                      onPress={() => handleAcceptOrder(selectedOrder._id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#4CAF50',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600' }}>Accept Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRejectOrder(selectedOrder._id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#FF5252',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600' }}>Reject Order</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedOrder.orderStatus === 'confirmed' && (
                  <View style={{ marginTop: 16 }}>
                    <TouchableOpacity
                      onPress={() => handleShipOrder(selectedOrder._id)}
                      style={{
                        backgroundColor: '#2196F3',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600' }}>Confirm To Ship</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
} 