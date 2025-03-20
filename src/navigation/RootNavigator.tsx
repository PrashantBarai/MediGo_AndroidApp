import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import PharmacyDashboard from '../screens/pharmacy/Dashboard';
import Profile from '../screens/common/Profile';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
// Import customer screens from the barrel file
import { 
  Dashboard as CustomerDashboard, 
  ProductDetails, 
  Cart, 
  OrderTracking 
} from '../screens/customer';

// Define the RootStackParamList for type safety
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  CustomerDashboard: undefined;
  PharmacyDashboard: undefined;
  ProductDetails: { product: any };
  Cart: undefined;
  OrderTracking: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Special type handling for React Navigation v7
interface StackNavigatorProps {
  children: React.ReactNode;
  id?: undefined; // Make id optional and of type undefined
  initialRouteName: string;
  screenOptions: {
    headerShown: boolean;
  };
}

const RootNavigator = () => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  // Cast the props to any to bypass TypeScript checking
  const navigatorProps = {
    initialRouteName: "Splash",
    screenOptions: {
      headerShown: false,
    }
  } as any;

  return (
    <Stack.Navigator {...navigatorProps}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      ) : (
        <>
          {role === 'customer' ? (
            <>
              <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
              <Stack.Screen name="ProductDetails" component={ProductDetails} />
              <Stack.Screen name="Cart" component={Cart} />
              <Stack.Screen name="OrderTracking" component={OrderTracking} />
            </>
          ) : (
            <Stack.Screen name="PharmacyDashboard" component={PharmacyDashboard} />
          )}
          <Stack.Screen name="Profile" component={Profile} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
