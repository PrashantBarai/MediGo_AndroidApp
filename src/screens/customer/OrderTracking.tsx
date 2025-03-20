import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the types for navigation and route
type RootStackParamList = {
  OrderTracking: { orderId: string };
  Dashboard: undefined;
};

type OrderTrackingRouteProp = RouteProp<RootStackParamList, 'OrderTracking'>;
type OrderTrackingNavigationProp = StackNavigationProp<RootStackParamList, 'OrderTracking'>;

type Props = {
  route: OrderTrackingRouteProp;
  navigation: OrderTrackingNavigationProp;
};

const OrderTracking: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const order = useSelector((state: any) => 
    state.order.orders.find((o: any) => o.id === orderId)
  );

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStepStatus = (step: string) => {
    const statuses = {
      'pending': 1,
      'processing': 2,
      'dispatched': 3,
      'delivered': 4
    };
    
    const currentStatus = statuses[order.status as keyof typeof statuses];
    const stepStatus = statuses[step as keyof typeof statuses];
    
    if (stepStatus < currentStatus) {
      return 'completed';
    } else if (stepStatus === currentStatus) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{orderId.split('-')[1]}</Text>
        <Text style={styles.date}>Placed on: {formatDate(order.createdAt)}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Order Status</Text>
        <Text style={[styles.statusBadge, styles[`${order.status}Badge`]]}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Text>
      </View>

      <View style={styles.trackingContainer}>
        <View style={styles.trackingLine} />
        
        <View style={styles.step}>
          <View style={[
            styles.stepIcon,
            styles[`${getStepStatus('pending')}StepIcon`]
          ]}>
            <Text style={styles.stepIconText}>1</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Order Received</Text>
            <Text style={styles.stepDesc}>Your order has been received and is being prepared.</Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={[
            styles.stepIcon,
            styles[`${getStepStatus('processing')}StepIcon`]
          ]}>
            <Text style={styles.stepIconText}>2</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Order Processing</Text>
            <Text style={styles.stepDesc}>Pharmacy is preparing your medications.</Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={[
            styles.stepIcon,
            styles[`${getStepStatus('dispatched')}StepIcon`]
          ]}>
            <Text style={styles.stepIconText}>3</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Out for Delivery</Text>
            <Text style={styles.stepDesc}>Your order is on its way to you.</Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={[
            styles.stepIcon,
            styles[`${getStepStatus('delivered')}StepIcon`]
          ]}>
            <Text style={styles.stepIconText}>4</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Order Delivered</Text>
            <Text style={styles.stepDesc}>Your order has been delivered successfully.</Text>
          </View>
        </View>
      </View>

      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        {order.items.map((item: any) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backToDashboardButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.backToDashboardButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  orderId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#757575',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  pendingBadge: {
    backgroundColor: '#FFF9C4',
    color: '#F57F17',
  },
  processingBadge: {
    backgroundColor: '#E1F5FE',
    color: '#0288D1',
  },
  dispatchedBadge: {
    backgroundColor: '#E8F5E9',
    color: '#388E3C',
  },
  deliveredBadge: {
    backgroundColor: '#E0F2F1',
    color: '#00796B',
  },
  trackingContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  trackingLine: {
    position: 'absolute',
    left: 16,
    top: 24,
    bottom: 24,
    width: 2,
    backgroundColor: '#E0E0E0',
    zIndex: 1,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
    zIndex: 2,
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  completedStepIcon: {
    backgroundColor: '#4CAF50',
  },
  currentStepIcon: {
    backgroundColor: '#2196F3',
  },
  upcomingStepIcon: {
    backgroundColor: '#BDBDBD',
  },
  stepIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: '#757575',
  },
  orderSummary: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#757575',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  backToDashboardButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  backToDashboardButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default OrderTracking;
