/**
 * Authentication Store using Zustand
 * 
 * This store manages the authentication state for the TaskMind application.
 * It handles user login, registration, logout, and auth state persistence.
 * 
 * Features:
 * - Firebase Authentication integration
 * - Persistent auth state across browser sessions
 * - Real-time auth state monitoring
 * - User profile management
 * - Error handling and loading states
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getUser, createUser } from '../lib/firestore';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';

/**
 * Extended AuthStore interface
 * Includes all auth state and actions for managing authentication
 */
interface AuthStore extends AuthState {
  // Auth state flags
  isAuthInitialized: boolean;
  
  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

/**
 * Create the authentication store with Zustand
 * Uses persist middleware to maintain auth state across browser sessions
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isAuthInitialized: false,
      user: null,
      loading: false,
      error: null,

      /**
       * Initialize Authentication
       * Sets up Firebase auth state listener and restores user session
       * Called once when the app starts
       */
      initializeAuth: async () => {
        console.log('🔄 Initializing Firebase authentication...');
        set({ loading: true });
        
        try {
          // Set up Firebase auth state listener
          // This will trigger whenever the user's auth state changes
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            console.log('🔄 Auth state changed:', firebaseUser?.email || 'No user');
            
            if (firebaseUser) {
              console.log('✅ User is authenticated:', firebaseUser.email);
              
              try {
                // Fetch additional user data from Firestore
                const userData = await getUser(firebaseUser.uid);
                
                if (userData) {
                  // User profile exists in Firestore
                  set({ 
                    isAuthenticated: true,
                    isAuthInitialized: true,
                    user: userData,
                    loading: false,
                    error: null
                  });
                  console.log('✅ User profile loaded from Firestore');
                } else {
                  // User exists in Firebase Auth but not in Firestore
                  // This shouldn't happen in normal flow, but we handle it gracefully
                  console.log('⚠️ User authenticated but no profile found in Firestore');
                  set({ 
                    isAuthenticated: false,
                    isAuthInitialized: true,
                    user: null,
                    loading: false,
                    error: 'User profile not found. Please contact support.'
                  });
                }
              } catch (error) {
                console.error('❌ Error fetching user profile:', error);
                set({ 
                  isAuthenticated: false,
                  isAuthInitialized: true,
                  user: null,
                  loading: false,
                  error: 'Failed to load user profile'
                });
              }
            } else {
              // No authenticated user
              console.log('❌ No authenticated user found');
              set({ 
                isAuthenticated: false, 
                isAuthInitialized: true,
                user: null, 
                loading: false,
                error: null
              });
            }
          });

          // Store the unsubscribe function for cleanup if needed
          // In a real app, you might want to call this when the app unmounts
          console.log('✅ Auth state listener initialized');
          
        } catch (error) {
          console.error('❌ Auth initialization failed:', error);
          set({ 
            isAuthenticated: false, 
            isAuthInitialized: true,
            user: null, 
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication initialization failed'
          });
        }
      },

      /**
       * User Login
       * Authenticates user with email and password using Firebase Auth
       * 
       * @param credentials - User email and password
       */
      login: async (credentials) => {
        console.log('🔐 Attempting to log in user:', credentials.email);
        set({ loading: true, error: null });
        
        try {
          // Authenticate with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            credentials.email, 
            credentials.password
          );

          console.log('✅ Firebase authentication successful');

          // Fetch user profile from Firestore
          const userData = await getUser(userCredential.user.uid);
          
          if (!userData) {
            throw new Error('User profile not found');
          }

          // Update store with authenticated user data
          set({ 
            isAuthenticated: true,
            isAuthInitialized: true,
            user: userData,
            loading: false,
            error: null
          });

          console.log('✅ User logged in successfully');
        } catch (error) {
          console.error('❌ Login failed:', error);
          
          // Handle specific Firebase Auth errors
          let errorMessage = 'Login failed';
          if (error instanceof Error) {
            switch (error.message) {
              case 'auth/user-not-found':
                errorMessage = 'No account found with this email address';
                break;
              case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
              case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
              case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later';
                break;
              default:
                errorMessage = error.message;
            }
          }
          
          set({ 
            loading: false, 
            error: errorMessage,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      /**
       * User Registration
       * Creates new user account with Firebase Auth and user profile in Firestore
       * 
       * @param credentials - User name, email, and password
       */
      register: async (credentials) => {
        console.log('📝 Attempting to register user:', credentials.email);
        set({ loading: true, error: null });
        
        try {
          // Create user account with Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          console.log('✅ Firebase user account created');

          // Create user profile document in Firestore
          const userProfileData = {
            name: credentials.name,
            email: credentials.email,
          };

          // Create user document using the Firebase Auth UID as the document ID
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            ...userProfileData,
            preferences: {
              workHours: { start: '09:00', end: '17:00' },
              workDays: [1, 2, 3, 4, 5], // Monday to Friday
              focusTime: 45,
              breakTime: 15,
              theme: 'system',
              notifications: true,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log('✅ User profile created in Firestore');

          // Create User object for the store
          const newUser: User = {
            id: userCredential.user.uid,
            email: credentials.email,
            name: credentials.name,
            preferences: {
              workHours: { start: '09:00', end: '17:00' },
              workDays: [1, 2, 3, 4, 5],
              focusTime: 45,
              breakTime: 15,
              theme: 'system',
              notifications: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Update store with new user data
          set({ 
            isAuthenticated: true,
            isAuthInitialized: true,
            user: newUser,
            loading: false,
            error: null
          });

          console.log('✅ User registered successfully');
        } catch (error) {
          console.error('❌ Registration failed:', error);
          
          // Handle specific Firebase Auth errors
          let errorMessage = 'Registration failed';
          if (error instanceof Error) {
            switch (error.message) {
              case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists';
                break;
              case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
              case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please choose a stronger password';
                break;
              default:
                errorMessage = error.message;
            }
          }
          
          set({ 
            loading: false, 
            error: errorMessage,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      /**
       * User Logout
       * Signs out user from Firebase Auth and clears local state
       */
      logout: async () => {
        console.log('🚪 Logging out user...');
        
        try {
          // Sign out from Firebase Auth
          await signOut(auth);
          
          // Clear local state
          set({ 
            isAuthenticated: false, 
            isAuthInitialized: true,
            user: null,
            error: null
          });
          
          console.log('✅ User logged out successfully');
        } catch (error) {
          console.error('❌ Logout failed:', error);
          // Even if logout fails, clear local state
          set({ 
            isAuthenticated: false, 
            isAuthInitialized: true,
            user: null,
            error: 'Logout failed, but local session cleared'
          });
        }
      },

      /**
       * Update User Profile
       * Updates user data in local state (Firestore update should be done separately)
       * 
       * @param userData - Partial user data to update
       */
      updateUser: (userData) => {
        console.log('👤 Updating user profile in store');
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      /**
       * Clear Error State
       * Clears any authentication errors from the store
       */
      clearError: () => {
        console.log('🧹 Clearing auth error');
        set({ error: null });
      },
    }),
    {
      // Persist configuration
      name: 'auth-storage',
      // Only persist essential auth state, not loading/error states
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);