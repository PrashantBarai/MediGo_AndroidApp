import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { firebaseService } from '../services/firebase';
import { StackNavigationProp } from '@react-navigation/stack';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'email-otp';

type AuthScreenProps = {
  navigation: StackNavigationProp<any>;
};

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<'customer' | 'pharmacy'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const dispatch = useDispatch();

  // Validate form fields
  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return false;
      }
      
      if (!password.trim()) {
        Alert.alert('Error', 'Please enter a password');
        return false;
      }
      
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return false;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
    }
    
    if (authMode === 'login' && !password.trim() && !otpSent) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    
    return true;
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const user = await firebaseService.register(email, password, { name, role });
      
      if (user) {
        // Send email verification
        await firebaseService.sendEmailVerification();
        
        // Set user in Redux
        dispatch(setUser({
          userId: user.uid,
          email: user.email || email,
          role,
          name: name,
        }));
        
        Alert.alert(
          'Account Created',
          'Your account has been created successfully. Please verify your email.',
          [{ text: 'OK', onPress: () => navigation.navigate('CustomerDashboard') }]
        );
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle login with email/password
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const user = await firebaseService.login(email, password);
      
      if (user) {
        // Set user in Redux
        dispatch(setUser({
          userId: user.uid,
          email: user.email || email,
          role, // This would be fetched from a database in a real app
          name: user.displayName || 'User',
        }));
        
        // Navigate to appropriate dashboard
        if (role === 'customer') {
          navigation.navigate('CustomerDashboard');
        } else {
          navigation.navigate('PharmacyDashboard');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending OTP to email
  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      await firebaseService.sendOTPToEmail(email);
      setOtpSent(true);
      Alert.alert(
        'Email Sent',
        'A login link has been sent to your email. Please check your inbox.'
      );
    } catch (error: any) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      await firebaseService.resetPassword(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        [{ text: 'OK', onPress: () => setAuthMode('login') }]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission based on current auth mode
  const handleSubmit = () => {
    switch (authMode) {
      case 'signup':
        handleSignup();
        break;
      case 'login':
        if (otpSent) {
          Alert.alert('OTP Login', 'Please check your email and click the login link sent to you.');
        } else {
          handleLogin();
        }
        break;
      case 'forgot-password':
        handleResetPassword();
        break;
      case 'email-otp':
        handleSendOTP();
        break;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MediGo</Text>
      
      {/* Role Selection - Only show in signup mode */}
      {authMode === 'signup' && (
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'customer' && styles.activeRole]}
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.roleText, role === 'customer' && styles.activeRoleText]}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'pharmacy' && styles.activeRole]}
            onPress={() => setRole('pharmacy')}
          >
            <Text style={[styles.roleText, role === 'pharmacy' && styles.activeRoleText]}>Pharmacy</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Auth Mode Description */}
      <Text style={styles.authModeDescription}>
        {authMode === 'login' ? 'Login to your account' : 
         authMode === 'signup' ? 'Create a new account' : 
         authMode === 'forgot-password' ? 'Reset your password' : 
         'Login with email link'}
      </Text>
      
      {/* Form Fields */}
      {authMode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {(authMode === 'login' && !otpSent) || authMode === 'signup' ? (
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      ) : null}
      
      {authMode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}
      
      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {authMode === 'login' ? (otpSent ? 'Check your email' : 'Login') : 
             authMode === 'signup' ? 'Sign Up' : 
             authMode === 'forgot-password' ? 'Reset Password' : 
             'Send Login Link'}
          </Text>
        )}
      </TouchableOpacity>
      
      {/* Auth Mode Toggle Links */}
      <View style={styles.linksContainer}>
        {authMode === 'login' && !otpSent && (
          <>
            <TouchableOpacity onPress={() => setAuthMode('email-otp')}>
              <Text style={styles.toggleText}>Login with email link (OTP)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAuthMode('forgot-password')}>
              <Text style={styles.toggleText}>Forgot password?</Text>
            </TouchableOpacity>
          </>
        )}
        
        {authMode === 'email-otp' && (
          <TouchableOpacity onPress={() => setAuthMode('login')}>
            <Text style={styles.toggleText}>Login with password</Text>
          </TouchableOpacity>
        )}
        
        {authMode === 'forgot-password' && (
          <TouchableOpacity onPress={() => setAuthMode('login')}>
            <Text style={styles.toggleText}>Back to login</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={() => {
            setAuthMode(authMode === 'signup' ? 'login' : 'signup');
            setOtpSent(false);
          }}
        >
          <Text style={styles.toggleText}>
            {authMode === 'signup' ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2196F3',
  },
  authModeDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  roleToggle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeRole: {
    backgroundColor: '#2196F3',
  },
  roleText: {
    color: '#333',
  },
  activeRoleText: {
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    marginVertical: 5,
    color: '#2196F3',
  },
});

export default AuthScreen;
