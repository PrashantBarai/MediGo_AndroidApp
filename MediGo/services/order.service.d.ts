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

export declare function getOrders(): Promise<Order[]>;
export declare function getOrderById(id: string): Promise<Order>;
export declare function updateOrderStatus(id: string, status: Order['orderStatus']): Promise<Order>;
export declare function updatePaymentStatus(id: string, paymentStatus: Order['paymentStatus']): Promise<Order>;
export declare function cancelOrder(id: string): Promise<Order>; 