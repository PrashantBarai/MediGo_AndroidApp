import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type UserType = 'CUSTOMER' | 'PHARMACY';

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>('CUSTOMER');

  const handleRegister = () => {
    // TODO: Implement registration logic
    if (userType === 'CUSTOMER') {
      router.push('/login');
    } else {
      router.push('/pharmacy/login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/react-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>MediGo</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Register</Text>
          <Text style={styles.description}>Please Register before Login</Text>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity 
              style={[
                styles.userTypeButton,
                userType === 'CUSTOMER' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('CUSTOMER')}
            >
              <Ionicons 
                name="person-outline" 
                size={24} 
                color={userType === 'CUSTOMER' ? '#FFFFFF' : '#6C63FF'} 
              />
              <Text style={[
                styles.userTypeText,
                userType === 'CUSTOMER' && styles.userTypeTextActive
              ]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.userTypeButton,
                userType === 'PHARMACY' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('PHARMACY')}
            >
              <Ionicons 
                name="medical-outline" 
                size={24} 
                color={userType === 'PHARMACY' ? '#FFFFFF' : '#6C63FF'} 
              />
              <Text style={[
                styles.userTypeText,
                userType === 'PHARMACY' && styles.userTypeTextActive
              ]}>Pharmacy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#6C63FF" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Repeat Password"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry={!showRepeatPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowRepeatPassword(!showRepeatPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showRepeatPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#6C63FF" 
              />
            </TouchableOpacity>
          </View>

          {userType === 'PHARMACY' && (
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Pharmacy Name"
                autoCapitalize="words"
              />
            </View>
          )}

          {userType === 'PHARMACY' && (
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Pharmacy Address"
                multiline
                numberOfLines={2}
              />
            </View>
          )}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Login Here</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
  },
  userTypeButtonActive: {
    backgroundColor: '#6C63FF',
  },
  userTypeText: {
    fontSize: 16,
    color: '#6C63FF',
    marginLeft: 8,
  },
  userTypeTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  registerButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
}); 