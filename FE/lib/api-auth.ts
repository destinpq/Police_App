/**
 * Authentication API using Firebase
 * 
 * NOTE: This module provides mock authentication until Firebase is properly installed.
 * Run: npm install firebase
 */

import { auth } from './firebase-config';
import { fetchApi } from './api-core';

// Define user type to match Firebase user structure
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Local event for auth state change
export const dispatchAuthStateChange = (user: any | null) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth-state-change', { 
      detail: { user } 
    });
    window.dispatchEvent(event);
  }
};

// Auth listener setup
if (typeof window !== 'undefined') {
  auth.onAuthStateChanged((user) => {
    dispatchAuthStateChange(user);
  });
}

// User data interface
export interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string | { id: string; name: string };
  roleId?: string;
  departmentId?: string;
  avatar?: string | null;
  bio?: string | null;
}

/**
 * Authentication related API calls
 */
export const authApi = {
  register: async (userData: { name: string; email: string; password: string }): Promise<{ user: UserData }> => {
    try {
      // Create user in Firebase
      const userCredential = await auth.createUserWithEmailAndPassword(
        userData.email, 
        userData.password
      );
      
      const firebaseUser = userCredential.user as unknown as FirebaseUser;
      
      // Create a profile in our backend
      await fetchApi<{ id: string; name: string; email: string }>('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          firebaseId: firebaseUser.uid
        }),
      });
      
      return { 
        user: {
          id: firebaseUser.uid,
          name: userData.name,
          email: userData.email
        } 
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (credentials: { email: string; password: string }): Promise<{ user: UserData }> => {
    try {
      // Sign in with Firebase
      const userCredential = await auth.signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      
      const firebaseUser = userCredential.user as unknown as FirebaseUser;
      
      // Get user profile from our API
      const userProfile = await fetchApi<UserData>('/auth/profile');
      
      return { 
        user: {
          id: firebaseUser.uid,
          name: userProfile.name || firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: userProfile.role,
          roleId: userProfile.roleId,
          departmentId: userProfile.departmentId,
          avatar: userProfile.avatar,
          bio: userProfile.bio
        } 
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async (): Promise<void> => {
    try {
      await auth.signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  getProfile: async (): Promise<UserData | null> => {
    try {
      const currentUser = auth.currentUser as unknown as FirebaseUser | null;
      
      if (!currentUser) {
        console.log('No authenticated user, returning null profile');
        return null;
      }
      
      try {
        // Get user profile from our API
        const userProfile = await fetchApi<UserData>('/auth/profile');
        
        return {
          id: currentUser.uid,
          name: userProfile.name || currentUser.displayName || 'User',
          email: currentUser.email || '',
          role: userProfile.role,
          roleId: userProfile.roleId,
          departmentId: userProfile.departmentId,
          avatar: userProfile.avatar,
          bio: userProfile.bio
        };
      } catch (error) {
        // If the API call fails, return basic profile from Firebase
        console.error('Error fetching user profile from API, using basic profile', error);
        return {
          id: currentUser.uid,
          name: currentUser.displayName || 'User',
          email: currentUser.email || '',
        };
      }
    } catch (error: any) {
      console.error('Get profile error:', error);
      return null;
    }
  },
  
  resetPassword: async (email: string): Promise<void> => {
    try {
      // Implementation would use auth.sendPasswordResetEmail(email) with real Firebase
      console.log(`Password reset initiated for ${email}`);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  
  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser as unknown as FirebaseUser | null;
  }
}; 