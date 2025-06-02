import { create } from 'zustand';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { persist } from 'zustand/middleware';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

// Mock authentication functions - in a real app, these would call API endpoints
const mockLogin = async (credentials: LoginCredentials): Promise<User> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demo purposes, just check if email contains "test"
  if (!credentials.email.includes('test')) {
    throw new Error('Invalid credentials');
  }
  
  return {
    id: 'user-1',
    email: credentials.email,
    name: 'Test User',
    preferences: {
      workHours: { start: '09:00', end: '17:00' },
      workDays: [1, 2, 3, 4, 5], // Monday to Friday
      focusTime: 45,
      breakTime: 15,
      theme: 'system',
      notifications: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const mockRegister = async (credentials: RegisterCredentials): Promise<User> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, just validate email format
  if (!credentials.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  
  return {
    id: 'user-1',
    email: credentials.email,
    name: credentials.name,
    preferences: {
      workHours: { start: '09:00', end: '17:00' },
      workDays: [1, 2, 3, 4, 5], // Monday to Friday
      focusTime: 45,
      breakTime: 15,
      theme: 'system',
      notifications: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const user = await mockLogin(credentials);
          set({ isAuthenticated: true, user, loading: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Login failed',
            isAuthenticated: false
          });
          throw error;
        }
      },

      register: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const user = await mockRegister(credentials);
          set({ isAuthenticated: true, user, loading: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Registration failed',
            isAuthenticated: false
          });
          throw error;
        }
      },

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);