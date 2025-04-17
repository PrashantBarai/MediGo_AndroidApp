import { Stack } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#6C63FF', '#8B85FF']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Register',
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            title: 'Forgot Password',
          }}
        />
      </Stack>
    </View>
  );
} 