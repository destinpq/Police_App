/**
 * Authentication API using Firebase
 * 
 * This is the real Firebase auth implementation. Replace api-auth.ts with this file
 * once Firebase package is installed.
 */

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase-config';
import { fetchApi } from './api-core';

// Local event for auth state change
export const dispatchAuthStateChange = (user: FirebaseUser | null) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth-state-change', { 
      detail: { user } 
    });
    window.dispatchEvent(event);
  }
};

// Auth listener setup
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
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
 * Authentication related API calls using Firebase Auth
 */
export const authApi = {
  register: async (userData: { name: string; email: string; password: string }): Promise<{ user: UserData }> => {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      // Create a profile in our backend
      const response = await fetchApi<{ id: string; name: string; email: string }>('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          // Use Firebase UID for linking
          firebaseId: userCredential.user.uid
        }),
      });
      
      return { 
        user: {
          id: userCredential.user.uid,
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      // Get user profile from our API
      const userProfile = await fetchApi<UserData>('/auth/profile');
      
      return { 
        user: {
          id: userCredential.user.uid,
          name: userProfile.name || userCredential.user.displayName || 'User',
          email: userCredential.user.email || '',
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
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  getProfile: async (): Promise<UserData> => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
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
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  
  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser;
  }
}; 