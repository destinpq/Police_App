/**
 * Firebase configuration
 * 
 * This is the real Firebase implementation. Replace firebase-config.ts with this file
 * once Firebase package is installed.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 