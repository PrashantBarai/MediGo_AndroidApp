import { View, Text, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: string;
    image?: string;
  }[];
  total: string;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  time: string;
  paymentMethod: 'COD' | 'Online';
  deliveryInstructions?: string;
}

const ORDERS: Order[] = [
  {
    id: 'ORD001',
    customer: {
      name: 'John Doe',
      phone: '+91 9876543210',
      email: 'john@example.com',
      address: {
        street: '123, Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        landmark: 'Near City Mall'
      }
    },
    items: [
      {
        id: 'PRD001',
        name: 'Paracetamol 500mg',
        quantity: 2,
        price: '₹49.99',
        image: 'https://example.com/paracetamol.jpg'
      },
      {
        id: 'PRD002',
        name: 'Vitamin C 1000mg',
        quantity: 1,
        price: '₹299.99',
        image: 'https://example.com/vitaminc.jpg'
      }
    ],
    total: '₹399.97',
    status: 'Pending',
    time: '10 mins ago',
    paymentMethod: 'COD',
    deliveryInstructions: 'Please deliver after 6 PM'
  },
  {
    id: 'ORD002',
    customer: {
      name: 'Jane Smith',
      phone: '+91 9876543210',
      email: 'jane@example.com',
      address: {
        street: '456, Elm Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      }
    },
    items: [
      {
        id: 'PRD003',
        name: 'Aspirin 100mg',
        quantity: 3,
        price: '₹199.99',
        image: 'https://example.com/aspirin.jpg'
      },
      {
        id: 'PRD004',
        name: 'Vitamin D3 5000IU',
        quantity: 2,
        price: '₹299.99',
        image: 'https://example.com/vitamind3.jpg'
      }
    ],
    total: '₹599.97',
    status: 'Processing',
    time: '25 mins ago',
    paymentMethod: 'Online',
  },
  {
    id: 'ORD003',
    customer: {
      name: 'Mike Johnson',
      phone: '+91 9876543210',
      email: 'mike@example.com',
      address: {
        street: '789, Oak Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        landmark: 'Near Infosys Campus'
      }
    },
    items: [
      {
        id: 'PRD005',
        name: 'Ibuprofen 200mg',
        quantity: 5,
        price: '₹199.99',
        image: 'https://example.com/ibuprofen.jpg'
      },
      {
        id: 'PRD006',
        name: 'Vitamin E 400IU',
        quantity: 1,
        price: '₹199.99',
        image: 'https://example.com/vitamine.jpg'
      }
    ],
    total: '₹999.95',
    status: 'Delivered',
    time: '2 hours ago',
    paymentMethod: 'Online',
  },
  {
    id: 'ORD004',
    customer: {
      name: 'Sarah Wilson',
      phone: '+91 9876543210',
      email: 'sarah@example.com',
      address: {
        street: '321, Maple Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
      }
    },
    items: [
      {
        id: 'PRD007',
        name: 'Amoxicillin 500mg',
        quantity: 1,
        price: '₹199.99',
        image: 'https://example.com/amoxicillin.jpg'
      },
    ],
    total: '₹199.99',
    status: 'Cancelled',
    time: '3 hours ago',
    paymentMethod: 'COD',
  }
];

const ORDER_STATS = [
  { label: 'All', count: 156, color: '#6C63FF' },
  { label: 'Pending', count: 23, color: '#FFC107' },
  { label: 'Processing', count: 45, color: '#2196F3' },
  { label: 'Delivered', count: 78, color: '#4CAF50' },
  { label: 'Cancelled', count: 10, color: '#FF5252' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return { bg: '#FFC10720', text: '#FFC107' };
    case 'Processing':
      return { bg: '#2196F320', text: '#2196F3' };
    case 'Delivered':
      return { bg: '#4CAF5020', text: '#4CAF50' };
    case 'Cancelled':
      return { bg: '#FF525220', text: '#FF5252' };
    default:
      return { bg: '#66666620', text: '#666666' };
  }
};

export default function Orders() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredOrders = ORDERS.filter(order => 
    selectedStatus === 'All' || order.status === selectedStatus
  );

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleAcceptOrder = (orderId: string) => {
    // Implement accept order logic
    console.log('Accepting order:', orderId);
  };

  const handleRejectOrder = (orderId: string) => {
    // Implement reject order logic
    console.log('Rejecting order:', orderId);
  };

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
          {ORDER_STATS.map((stat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedStatus(stat.label)}
              style={{
                backgroundColor: selectedStatus === stat.label ? stat.color : 'white',
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                marginBottom: 2
              }}
            >
              <Text style={{ 
                color: selectedStatus === stat.label ? 'white' : stat.color,
                fontSize: 16,
                fontWeight: '600',
                marginRight: 6
              }}>
                {stat.count}
              </Text>
              <Text style={{ 
                color: selectedStatus === stat.label ? 'white' : '#666',
                fontSize: 12,
                fontWeight: '500'
              }}>
                {stat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {filteredOrders.map((order) => (
          <View
            key={order.id}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            {/* Order Header */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: 12
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="package" size={24} color="#6C63FF" />
                <Text style={{ fontSize: 16, fontWeight: '600' }}>{order.id}</Text>
              </View>
              <Text style={{ color: '#666', fontSize: 14 }}>{order.time}</Text>
            </View>

            {/* Customer Info */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 4 }}>
                {order.customer.name}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text style={{ fontSize: 14, color: '#666' }} numberOfLines={1}>
                    {order.customer.phone}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666' }} numberOfLines={1}>
                    {order.customer.email}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: getStatusColor(order.status).bg,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}>
                  <Text style={{
                    color: getStatusColor(order.status).text,
                    fontSize: 12,
                    fontWeight: '500'
                  }}>
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={() => handleViewDetails(order)}
              style={{
                backgroundColor: '#6C63FF20',
                padding: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <MaterialCommunityIcons name="eye" size={20} color="#6C63FF" />
              <Text style={{ color: '#6C63FF', fontSize: 14, fontWeight: '500' }}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetails(false)}
      >
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
            maxHeight: '90%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '600' }}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order Info */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Order ID</Text>
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>{selectedOrder.id}</Text>
                  <Text style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{selectedOrder.time}</Text>
                </View>

                {/* Customer Info */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Customer Details</Text>
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>{selectedOrder.customer.name}</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.customer.phone}</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.customer.email}</Text>
                </View>

                {/* Delivery Address */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Delivery Address</Text>
                  <Text style={{ fontSize: 14 }}>{selectedOrder.customer.address.street}</Text>
                  <Text style={{ fontSize: 14 }}>{selectedOrder.customer.address.city}, {selectedOrder.customer.address.state} - {selectedOrder.customer.address.pincode}</Text>
                  {selectedOrder.customer.address.landmark && (
                    <Text style={{ fontSize: 14 }}>Landmark: {selectedOrder.customer.address.landmark}</Text>
                  )}
                </View>

                {/* Order Items */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Order Items</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', marginTop: 8 }}>
                      {item.image && (
                        <Image 
                          source={{ uri: item.image }} 
                          style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }}
                        />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500' }}>{item.name}</Text>
                        <Text style={{ color: '#666', fontSize: 14 }}>
                          Qty: {item.quantity} • {item.price}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Payment & Delivery */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Payment Method</Text>
                  <Text style={{ fontSize: 14 }}>{selectedOrder.paymentMethod}</Text>
                  {selectedOrder.deliveryInstructions && (
                    <View>
                      <Text style={{ color: '#666', fontSize: 14, marginTop: 8 }}>Delivery Instructions</Text>
                      <Text style={{ fontSize: 14 }}>{selectedOrder.deliveryInstructions}</Text>
                    </View>
                  )}
                </View>

                {/* Order Total */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Order Total</Text>
                  <Text style={{ fontSize: 20, fontWeight: '600' }}>{selectedOrder.total}</Text>
                </View>

                {/* Order Status */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Status</Text>
                  <View style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: 
                      selectedOrder.status === 'Pending' ? '#FFC10720' :
                      selectedOrder.status === 'Processing' ? '#2196F320' :
                      selectedOrder.status === 'Delivered' ? '#4CAF5020' : '#FF525220',
                    borderRadius: 8,
                    alignSelf: 'flex-start'
                  }}>
                    <Text style={{
                      color:
                        selectedOrder.status === 'Pending' ? '#FFC107' :
                        selectedOrder.status === 'Processing' ? '#2196F3' :
                        selectedOrder.status === 'Delivered' ? '#4CAF50' : '#FF5252',
                      fontSize: 14,
                      fontWeight: '500'
                    }}>
                      {selectedOrder.status}
                    </Text>
                  </View>
                </View>

                {selectedOrder.status === 'Pending' && (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => handleAcceptOrder(selectedOrder.id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#4CAF50',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <MaterialCommunityIcons name="check" size={20} color="white" />
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>Confirm Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRejectOrder(selectedOrder.id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#FF5252',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="white" />
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>Reject Order</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
} 