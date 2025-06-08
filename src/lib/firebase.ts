/**
 * Firebase Configuration and Initialization
 * 
 * This file sets up Firebase services for the TaskMind application.
 * It initializes Firebase Authentication and Firestore database.
 * 
 * Services used:
 * - Firebase Auth: For user authentication (login, register, logout)
 * - Firestore: For storing user data, tasks, and categories
 * 
 * Environment Variables Required:
 * - VITE_FIREBASE_API_KEY: Firebase project API key
 * - VITE_FIREBASE_AUTH_DOMAIN: Firebase auth domain
 * - VITE_FIREBASE_PROJECT_ID: Firebase project ID
 * - VITE_FIREBASE_STORAGE_BUCKET: Firebase storage bucket
 * - VITE_FIREBASE_MESSAGING_SENDER_ID: Firebase messaging sender ID
 * - VITE_FIREBASE_APP_ID: Firebase app ID
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration object
// These values come from your Firebase project settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required Firebase environment variables: ${missingEnvVars.join(', ')}`);
}

// Log configuration status (without exposing sensitive data)
console.log('🔥 Firebase Config Status:');
console.log('📋 Project ID:', firebaseConfig.projectId);
console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
console.log('✅ All required environment variables are present');

// Initialize Firebase app with the configuration
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
// This service handles user registration, login, logout, and auth state
export const auth = getAuth(app);

// Initialize Firestore Database
// This is our NoSQL document database for storing application data
export const db = getFirestore(app);

// Note: Emulator connections have been removed to prevent network-request-failed errors
// If you need to use Firebase emulators for development, start them manually with:
// firebase emulators:start
// And uncomment the emulator connection code below

/*
// Connect to Firebase emulators in development mode
// This allows testing without affecting production data
if (import.meta.env.DEV) {
  console.log('🔧 Development mode detected - connecting to Firebase emulators');
  
  try {
    // Connect to Auth emulator (runs on localhost:9099 by default)
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('🔐 Connected to Auth emulator');
  } catch (error) {
    console.log('⚠️ Auth emulator not available, using production auth');
  }
  
  try {
    // Connect to Firestore emulator (runs on localhost:8080 by default)
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('📊 Connected to Firestore emulator');
  } catch (error) {
    console.log('⚠️ Firestore emulator not available, using production database');
  }
}
*/

console.log('🚀 Firebase initialized successfully - using production services');

// Export the initialized Firebase app for use in other parts of the application
export default app;