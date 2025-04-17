import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'promotion' | 'system';
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Order Delivered',
    message: 'Your order #12345 has been delivered successfully',
    time: '2 hours ago',
    read: false,
    type: 'order'
  },
  {
    id: '2',
    title: 'Special Offer',
    message: 'Get 20% off on all medicines this weekend',
    time: '1 day ago',
    read: true,
    type: 'promotion'
  },
  {
    id: '3',
    title: 'System Update',
    message: 'We have updated our app with new features',
    time: '2 days ago',
    read: true,
    type: 'system'
  }
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const handleNotificationPress = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#6C63FF', 
        padding: 16, 
        paddingTop: 48,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFFFFF20',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '600', marginLeft: 16 }}>Notifications</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Settings */}
        <View style={{ 
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Notification Settings</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: '#666' }}>Push Notifications</Text>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E0E0E0', true: '#6C63FF' }}
              thumbColor={pushEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#666' }}>Email Notifications</Text>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#E0E0E0', true: '#6C63FF' }}
              thumbColor={emailEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Notifications List */}
        <View style={{ gap: 12 }}>
          {notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                opacity: notification.read ? 0.7 : 1,
              }}
              onPress={() => handleNotificationPress(notification.id)}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: notification.type === 'order' ? '#6C63FF20' : 
                                notification.type === 'promotion' ? '#FFC10720' : '#4CAF5020',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <MaterialIcons
                  name={notification.type === 'order' ? 'local-shipping' :
                        notification.type === 'promotion' ? 'local-offer' : 'info'}
                  size={20}
                  color={notification.type === 'order' ? '#6C63FF' :
                         notification.type === 'promotion' ? '#FFC107' : '#4CAF50'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{notification.title}</Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>{notification.message}</Text>
                <Text style={{ fontSize: 12, color: '#9E9E9E' }}>{notification.time}</Text>
              </View>
              {!notification.read && (
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#6C63FF',
                }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
} 