import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { firebaseConfig } from '../config/firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Firebase if it hasn't been initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const firebaseService = {
  // Register a new user
  register: async (email: string, password: string, userData: any) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user profile
      await user.updateProfile({
        displayName: userData.name,
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },
  
  // Send email verification
  sendEmailVerification: async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        await user.sendEmailVerification();
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  },
  
  // Send OTP to email for passwordless sign-in
  sendOTPToEmail: async (email: string) => {
    try {
      // This sends an email with a link that can be used to sign in
      const actionCodeSettings = {
        url: 'https://medigo.com/login?email=' + email,
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.medigo.app'
        },
        android: {
          packageName: 'com.medigo.app',
          installApp: true,
        },
        dynamicLinkDomain: 'medigo.page.link'
      };
      
      await auth().sendSignInLinkToEmail(email, actionCodeSettings);
      // Save the email locally to remember that we sent a link
      await AsyncStorage.setItem('emailForSignIn', email);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Sign in with the email link (OTP alternative)
  signInWithEmailLink: async (email: string, link: string) => {
    try {
      if (auth().isSignInWithEmailLink(link)) {
        // Get the email if not provided
        if (!email) {
          email = await AsyncStorage.getItem('emailForSignIn') || '';
        }
        
        const userCredential = await auth().signInWithEmailLink(email, link);
        // Clear email from storage
        await AsyncStorage.removeItem('emailForSignIn');
        return userCredential.user;
      } else {
        throw new Error('Invalid sign-in link');
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Logout current user
  logout: async () => {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Verify password reset code and set new password
  confirmPasswordReset: async (code: string, newPassword: string) => {
    try {
      await auth().confirmPasswordReset(code, newPassword);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Change password (when user is logged in)
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const user = auth().currentUser;
      if (!user || !user.email) {
        throw new Error('User not logged in');
      }
      
      // Re-authenticate user before changing password
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      
      // Change password
      await user.updatePassword(newPassword);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    return auth().currentUser;
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    return !!auth().currentUser;
  },
  
  // Update user profile
  updateProfile: async (updates: any) => {
    try {
      const user = auth().currentUser;
      if (user) {
        await user.updateProfile(updates);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  },
};

export default firebaseService;
