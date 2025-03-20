/**
 * MongoDB Schema Definitions
 * 
 * This file contains TypeScript interfaces that represent the MongoDB schemas
 * used in the MediGo application. These interfaces help maintain type safety
 * when working with data from the backend.
 */

// User Schema
export interface UserSchema {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'pharmacy';
  profileImage?: string;
  addresses: AddressSchema[];
  createdAt: Date;
  updatedAt: Date;
}

// Address Schema
export interface AddressSchema {
  _id: string;
  label: string; // e.g., "Home", "Work", etc.
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Pharmacy Schema
export interface PharmacySchema {
  _id: string;
  userId: string; // Reference to the User who owns this pharmacy
  name: string;
  licenseNumber: string;
  description?: string;
  logo?: string;
  address: AddressSchema;
  contactPhone: string;
  email: string;
  businessHours: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  reviewCount: number;
}

// Product/Medicine Schema
export interface ProductSchema {
  _id: string;
  pharmacyId: string; // Reference to the Pharmacy selling this product
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  images: string[];
  manufacturer: string;
  requiresPrescription: boolean;
  inStock: boolean;
  quantity: number;
  expiryDate?: Date;
  dosageForm: string; // e.g., "Tablet", "Syrup", "Injection", etc.
  strength?: string; // e.g., "500mg", "10mg/ml", etc.
  packSize?: string; // e.g., "10 tablets", "100ml", etc.
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Order Schema
export interface OrderSchema {
  _id: string;
  userId: string;
  pharmacyId: string;
  items: OrderItemSchema[];
  totalAmount: number;
  deliveryAddress: AddressSchema;
  prescriptionImage?: string;
  requiresPrescription: boolean;
  status: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'cod' | 'razorpay' | 'card';
  paymentDetails?: {
    transactionId: string;
    paymentId: string;
    orderId: string;
    signature?: string;
  };
  deliveryType: 'delivery' | 'pickup';
  deliveryCharge: number;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Item Schema
export interface OrderItemSchema {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  requiresPrescription: boolean;
}

// Cart Schema
export interface CartSchema {
  _id: string;
  userId: string;
  pharmacyId: string; // A cart is associated with a single pharmacy
  items: CartItemSchema[];
  totalAmount: number;
  updatedAt: Date;
}

// Cart Item Schema
export interface CartItemSchema {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  requiresPrescription: boolean;
  image?: string;
}

// Review Schema
export interface ReviewSchema {
  _id: string;
  userId: string;
  pharmacyId: string;
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: Date;
}

// Notification Schema
export interface NotificationSchema {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system';
  relatedId?: string; // e.g., orderId, promotionId, etc.
  isRead: boolean;
  createdAt: Date;
}
