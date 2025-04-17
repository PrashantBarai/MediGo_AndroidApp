import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  type: 'order' | 'product' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
  orderStatus?: string;
  productId?: string;
  productName?: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD123 has been placed by John Doe',
      time: '2 minutes ago',
      read: false,
      orderId: 'ORD123',
      orderStatus: 'Pending'
    },
    {
      id: '2',
      type: 'product',
      title: 'Low Stock Alert',
      message: 'Paracetamol 500mg is running low on stock',
      time: '1 hour ago',
      read: false,
      productId: 'PRD456',
      productName: 'Paracetamol 500mg'
    },
    {
      id: '3',
      type: 'order',
      title: 'Order Status Updated',
      message: 'Order #ORD120 has been delivered successfully',
      time: '3 hours ago',
      read: true,
      orderId: 'ORD120',
      orderStatus: 'Delivered'
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      message: 'New features have been added to your dashboard',
      time: '1 day ago',
      read: true
    }
  ]);

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      title: 'Order Notifications',
      description: 'Get notified about new orders and status updates',
      enabled: true
    },
    {
      id: '2',
      title: 'Product Alerts',
      description: 'Receive alerts for low stock and expiring products',
      enabled: true
    },
    {
      id: '3',
      title: 'System Updates',
      description: 'Stay informed about system updates and maintenance',
      enabled: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'clipboard-text';
      case 'product':
        return 'pill';
      case 'system':
        return 'cog';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#6C63FF';
      case 'product':
        return '#FFC107';
      case 'system':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const toggleSetting = (id: string) => {
    setSettings(settings.map(setting =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#6C63FF',
        padding: 24,
        paddingTop: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '600' }}>Notifications</Text>
      </View>

      <View style={{ padding: 16, gap: 16 }}>
        {/* Recent Notifications */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', padding: 16 }}>Recent Notifications</Text>
          
          {notifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => markAsRead(notification.id)}
              style={{
                padding: 16,
                borderTopWidth: index === 0 ? 1 : 0,
                borderBottomWidth: 1,
                borderColor: '#F0F0F0',
                backgroundColor: notification.read ? 'white' : '#F8F9FA',
                opacity: notification.read ? 0.8 : 1
              }}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${getNotificationColor(notification.type)}20`,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <MaterialCommunityIcons 
                    name={getNotificationIcon(notification.type)} 
                    size={24} 
                    color={getNotificationColor(notification.type)} 
                  />
                </View>
                
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>{notification.title}</Text>
                  <Text style={{ color: '#666', fontSize: 14 }}>{notification.message}</Text>
                  
                  {notification.type === 'order' && (
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      marginTop: 8,
                      backgroundColor: '#F8F9FA',
                      padding: 8,
                      borderRadius: 8,
                      gap: 8
                    }}>
                      <MaterialCommunityIcons name="package" size={16} color="#666" />
                      <Text style={{ color: '#666', fontSize: 14 }}>Order {notification.orderId}</Text>
                      <View style={{
                        backgroundColor: notification.orderStatus === 'Delivered' ? '#4CAF5020' : '#FFC10720',
                        paddingVertical: 2,
                        paddingHorizontal: 8,
                        borderRadius: 4
                      }}>
                        <Text style={{
                          color: notification.orderStatus === 'Delivered' ? '#4CAF50' : '#FFC107',
                          fontSize: 12
                        }}>
                          {notification.orderStatus}
                        </Text>
                      </View>
                    </View>
                  )}

                  {notification.type === 'product' && (
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      marginTop: 8,
                      backgroundColor: '#F8F9FA',
                      padding: 8,
                      borderRadius: 8,
                      gap: 8
                    }}>
                      <MaterialCommunityIcons name="pill" size={16} color="#666" />
                      <Text style={{ color: '#666', fontSize: 14 }}>{notification.productName}</Text>
                    </View>
                  )}

                  <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>{notification.time}</Text>
                </View>

                {!notification.read && (
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#6C63FF'
                  }} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notification Settings */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', padding: 16 }}>Notification Settings</Text>
          
          {settings.map((setting, index) => (
            <View
              key={setting.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderTopWidth: index === 0 ? 1 : 0,
                borderBottomWidth: 1,
                borderColor: '#F0F0F0',
                gap: 12
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{setting.title}</Text>
                <Text style={{ color: '#666', fontSize: 14 }}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: '#E0E0E0', true: '#6C63FF50' }}
                thumbColor={setting.enabled ? '#6C63FF' : '#999'}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
} 