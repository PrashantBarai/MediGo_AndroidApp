import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_API_URL } from '../config';

export interface OrderItem {
  product: {
    _id: string;
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

export interface DeliveryAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  totalSavings: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cod' | 'card' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: {
    product: string;
    quantity: number;
    price: number;
    originalPrice: number;
    discount?: {
      percentage: number;
      validUntil: string;
    };
  }[];
  totalAmount: number;
  deliveryFee: number;
  totalSavings: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cod' | 'card' | 'upi';
}

export const getOrders = async (): Promise<Order[]> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${BACKEND_API_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${BACKEND_API_URL}/api/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch order');
  }
};

export const updateOrderStatus = async (id: string, status: Order['orderStatus']): Promise<Order> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.patch(`${BACKEND_API_URL}/api/orders/${id}/status`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating order status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

export const updatePaymentStatus = async (id: string, paymentStatus: Order['paymentStatus']): Promise<Order> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.patch(`${BACKEND_API_URL}/api/orders/${id}/payment`, { paymentStatus }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update payment status');
  }
};

export const cancelOrder = async (id: string): Promise<Order> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.put(`${BACKEND_API_URL}/api/orders/${id}/cancel`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel order');
  }
};

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`${BACKEND_API_URL}/api/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
}; 