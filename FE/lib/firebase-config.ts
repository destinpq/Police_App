/**
 * Firebase configuration
 * 
 * This module provides Firebase authentication and Firestore functionality
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBomHOhnhZHjBDV-GbJV70mmj1LEYJAKho",
  authDomain: "police-app-aff23.firebaseapp.com",
  projectId: "police-app-aff23",
  storageBucket: "police-app-aff23.firebasestorage.app",
  messagingSenderId: "840748327431",
  appId: "1:840748327431:web:50f5ed86ce9a411c3f40a2",
  measurementId: "G-C1WH0GPYFV"
};

// User authentication interface
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Return unsubscribe function
    return () => {};
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // In a real implementation, this would call Firebase auth
    console.log(`Signing in with email: ${email}`);
    
    // Return a promise that resolves to a user object
    return {
      user: {
        uid: 'user-123456',
        email: email,
        displayName: email.split('@')[0]
      }
    };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // In a real implementation, this would call Firebase auth
    console.log(`Creating user with email: ${email}`);
    
    // Return a promise that resolves to a user object
    return {
      user: {
        uid: 'user-123456',
        email: email,
        displayName: email.split('@')[0]
      }
    };
  },
  signOut: async () => {
    // In a real implementation, this would call Firebase auth signOut
    console.log('Signing out');
    return Promise.resolve();
  }
};

// Firestore database interface
export const db = {
  collection: (collectionName: string) => ({
    doc: (id: string) => ({
      get: async () => ({
        exists: true,
        data: () => ({}),
        id: id
      }),
      set: async (data: any) => {
        console.log(`Setting document in ${collectionName}/${id}:`, data);
        return Promise.resolve();
      },
      update: async (data: any) => {
        console.log(`Updating document in ${collectionName}/${id}:`, data);
        return Promise.resolve();
      },
      delete: async () => {
        console.log(`Deleting document in ${collectionName}/${id}`);
        return Promise.resolve();
      }
    }),
    add: async (data: any) => {
      const id = `${collectionName}-${Date.now()}`;
      console.log(`Adding document to ${collectionName}:`, data);
      return { id };
    },
    where: (field: string, operator: string, value: any) => ({
      get: async () => ({
        docs: [],
        empty: true
      })
    })
  })
};

const firebaseApp = { name: 'default-app', options: firebaseConfig };
export default firebaseApp; 