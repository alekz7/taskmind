import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { supabase } from '../lib/supabase';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

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
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError) throw authError;

          if (!authData.user) throw new Error('No user data returned');

          // Get additional user data from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (userError) throw userError;

          set({ 
            isAuthenticated: true, 
            user: {
              id: authData.user.id,
              email: authData.user.email!,
              name: userData.name,
              preferences: {
                workHours: {
                  start: userData.work_hours_start,
                  end: userData.work_hours_end,
                },
                workDays: userData.work_days,
                focusTime: userData.focus_time,
                breakTime: userData.break_time,
                theme: userData.theme,
                notifications: userData.notifications,
              },
              createdAt: userData.created_at,
              updatedAt: userData.updated_at,
            },
            loading: false 
          });
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
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError) throw authError;

          if (!authData.user) throw new Error('No user data returned');

          // Create user profile in our users table
          const { error: userError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                name: credentials.name,
                email: credentials.email,
              }
            ]);

          if (userError) throw userError;

          set({ 
            isAuthenticated: true, 
            user: {
              id: authData.user.id,
              email: authData.user.email!,
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
            },
            loading: false 
          });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Registration failed',
            isAuthenticated: false
          });
          throw error;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ isAuthenticated: false, user: null });
      },

      updateUser: async (userData) => {
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