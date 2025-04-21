import axios from 'axios';
import { API_URL } from '../config/config';

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
    const response = await axios.get(`${API_URL}/orders`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: Order['orderStatus']): Promise<Order> => {
  try {
    const response = await axios.patch(`${API_URL}/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (id: string, paymentStatus: Order['paymentStatus']): Promise<Order> => {
  try {
    const response = await axios.patch(`${API_URL}/orders/${id}/payment`, { paymentStatus });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const cancelOrder = async (id: string): Promise<Order> => {
  try {
    const response = await axios.put(`${API_URL}/orders/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}; 