import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface ProfileData {
  name: string;
  role: string;
  pharmacyName: string;
  address: string;
  phone: string;
  email: string;
  profileImage?: string;
  license: string;
  gstin: string;
  timings: {
    open: string;
    close: string;
    days: string[];
  };
}

interface RecentOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
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

export default function Dashboard() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Dr. Rajesh Kumar',
    role: 'Owner',
    pharmacyName: 'MedPlus Pharmacy',
    address: '123, Healthcare Street, Medical Hub, Mumbai - 400001',
    phone: '+91 9876543210',
    email: 'rajesh.kumar@medplus.com',
    license: 'PH123456789',
    gstin: 'GSTIN123456789',
    timings: {
      open: '09:00 AM',
      close: '09:00 PM',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  });

  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([
    {
      id: 'ORD123',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@gmail.com',
      customerPhone: '+91 9876543210',
      customerAddress: {
        street: '123, Healthcare Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        landmark: 'Near Hospital'
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
      total: '₹599',
      status: 'Pending',
      time: '10 mins ago',
      paymentMethod: 'COD',
      deliveryInstructions: 'Please ring the doorbell'
    },
    {
      id: 'ORD122',
      customerName: 'Priya Patel',
      customerEmail: 'priya.patel@gmail.com',
      customerPhone: '+91 9876543211',
      customerAddress: {
        street: '456, Medical Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        landmark: 'Near Clinic'
      },
      items: [
        {
          id: 'PRD003',
          name: 'Amoxicillin 500mg',
          quantity: 1,
          price: '₹99.99',
          image: 'https://example.com/amoxicillin.jpg'
        },
        {
          id: 'PRD004',
          name: 'Ibuprofen 200mg',
          quantity: 2,
          price: '₹19.99',
          image: 'https://example.com/ibuprofen.jpg'
        }
      ],
      total: '₹299',
      status: 'Processing',
      time: '30 mins ago',
      paymentMethod: 'Online',
      deliveryInstructions: 'Leave at the doorstep'
    },
    {
      id: 'ORD121',
      customerName: 'Amit Kumar',
      customerEmail: 'amit.kumar@gmail.com',
      customerPhone: '+91 9876543212',
      customerAddress: {
        street: '789, Pharma Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400003',
        landmark: 'Near Pharmacy'
      },
      items: [
        {
          id: 'PRD005',
          name: 'Metformin 500mg',
          quantity: 3,
          price: '₹149.99',
          image: 'https://example.com/metformin.jpg'
        },
        {
          id: 'PRD006',
          name: 'Simvastatin 20mg',
          quantity: 1,
          price: '₹199.99',
          image: 'https://example.com/simvastatin.jpg'
        }
      ],
      total: '₹999',
      status: 'Delivered',
      time: '2 hours ago',
      paymentMethod: 'COD',
      deliveryInstructions: 'Signed for'
    }
  ]);

  useEffect(() => {
    // Load profile data from storage when component mounts
    const loadProfileData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('profileData');
        if (storedData) {
          setProfileData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();

    // Listen for profile data updates
    const interval = setInterval(loadProfileData, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: '#FFC10720', text: '#FFC107' };
      case 'Processing':
        return { bg: '#6C63FF20', text: '#6C63FF' };
      case 'Delivered':
        return { bg: '#4CAF5020', text: '#4CAF50' };
      case 'Cancelled':
        return { bg: '#FF525220', text: '#FF5252' };
      default:
        return { bg: '#66666620', text: '#666666' };
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#6C63FF',
        padding: 24,
        paddingTop: 48,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24
      }}>
        <Text style={{ color: 'white', fontSize: 32, fontWeight: '700' }}>MediGo</Text>
        <Text style={{ color: '#FFFFFF99', fontSize: 18, marginTop: 4 }}>Pharmacy Dashboard</Text>

        {/* Profile Card */}
        <View style={{ 
          backgroundColor: '#FFFFFF20',
          borderRadius: 16,
          padding: 16,
          marginTop: 16,
          marginBottom: 8
        }}>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {profileData.profileImage ? (
                <Image 
                  source={{ uri: profileData.profileImage }} 
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <MaterialCommunityIcons name="account" size={32} color="#6C63FF" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>{profileData.name}</Text>
              <Text style={{ color: '#FFFFFF99', fontSize: 14 }}>{profileData.role}</Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="store" size={16} color="#FFFFFF99" />
              <Text style={{ color: '#FFFFFF99', fontSize: 14, marginLeft: 8 }}>{profileData.pharmacyName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#FFFFFF99" style={{ marginTop: 2 }} />
              <Text style={{ 
                color: '#FFFFFF99', 
                fontSize: 14, 
                marginLeft: 8, 
                flex: 1,
                lineHeight: 20
              }}>
                {profileData.address}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="clock" size={16} color="#FFFFFF99" />
              <Text style={{ color: '#FFFFFF99', fontSize: 14, marginLeft: 8 }}>
                {profileData.timings.open} - {profileData.timings.close}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Dashboard Stats */}
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {/* Total Orders */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#6C63FF20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <MaterialCommunityIcons name="clipboard-list" size={24} color="#6C63FF" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>156</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Total Orders</Text>
          </View>

          {/* Pending Orders */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FFC10720',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <MaterialCommunityIcons name="clock" size={24} color="#FFC107" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>23</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Pending Orders</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          {/* Total Products */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#4CAF5020',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <MaterialCommunityIcons name="pill" size={24} color="#4CAF50" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>482</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Total Products</Text>
          </View>

          {/* Low Stock */}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FF525220',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <MaterialCommunityIcons name="alert" size={24} color="#FF5252" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>12</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Low Stock</Text>
          </View>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={{ padding: 16 }}>
        <View style={{ 
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          gap: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Recent Orders</Text>
            <TouchableOpacity 
              onPress={() => router.push('/orders')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text style={{ color: '#6C63FF', fontSize: 14 }}>View All</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          {recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => {
                setSelectedOrder(order);
                setShowDetails(true);
              }}
              style={{
                backgroundColor: '#F8F9FA',
                borderRadius: 12,
                padding: 16,
                gap: 12
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons 
                    name="shopping" 
                    size={20} 
                    color={getStatusColor(order.status).text} 
                  />
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>Order {order.id}</Text>
                </View>
                <Text style={{ color: '#666', fontSize: 12 }}>{order.time}</Text>
              </View>

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="account" size={16} color="#666" />
                  <Text style={{ color: '#666', fontSize: 14 }}>{order.customerName}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="email" size={16} color="#666" />
                  <Text style={{ color: '#666', fontSize: 14 }}>{order.customerEmail}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="phone" size={16} color="#666" />
                  <Text style={{ color: '#666', fontSize: 14 }}>{order.customerPhone}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="cart" size={16} color="#666" />
                  <Text style={{ color: '#666', fontSize: 14 }}>{order.items.length} items • {order.total}</Text>
                </View>
                <View style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  backgroundColor: getStatusColor(order.status).bg,
                  borderRadius: 8
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
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>{selectedOrder.customerName}</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.customerPhone}</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>{selectedOrder.customerEmail}</Text>
                </View>

                {/* Delivery Address */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Delivery Address</Text>
                  <Text style={{ fontSize: 14 }}>{selectedOrder.customerAddress.street}</Text>
                  <Text style={{ fontSize: 14 }}>
                    {selectedOrder.customerAddress.city}, {selectedOrder.customerAddress.state} - {selectedOrder.customerAddress.pincode}
                  </Text>
                  {selectedOrder.customerAddress.landmark && (
                    <Text style={{ fontSize: 14 }}>Landmark: {selectedOrder.customerAddress.landmark}</Text>
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
                    backgroundColor: getStatusColor(selectedOrder.status).bg,
                    borderRadius: 8,
                    alignSelf: 'flex-start'
                  }}>
                    <Text style={{
                      color: getStatusColor(selectedOrder.status).text,
                      fontSize: 14,
                      fontWeight: '500'
                    }}>
                      {selectedOrder.status}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {selectedOrder.status === 'Pending' && (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: '#4CAF50',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <MaterialCommunityIcons name="check" size={20} color="white" />
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Confirm Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: '#FF525220',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#FF5252" />
                      <Text style={{ color: '#FF5252', fontSize: 16, fontWeight: '500' }}>Reject Order</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
} 