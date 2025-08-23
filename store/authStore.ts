import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  updateProfile: (updates: { name?: string; username?: string; bio?: string; avatar?: string }) => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      
      signUp: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          if (data.user && data.session) {
            // Note: User creation in database will happen in account-setup.tsx
            // after the user completes the profile setup
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error: any) {
          console.error('Sign up error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: !!data.session,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Sign in error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Sign out error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Reset password error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          if (!user) throw new Error('No user logged in');

          // Update auth user metadata
          const { data, error: authError } = await supabase.auth.updateUser({
            data: updates
          });

          if (authError) throw authError;

          // Update user record in profiles table
          const profileUpdates: any = {};
          if (updates.name) profileUpdates.name = updates.name;
          if (updates.bio) profileUpdates.bio = updates.bio;
          if (updates.avatar) profileUpdates.avatar = updates.avatar;

          if (Object.keys(profileUpdates).length > 0) {
            const { error: dbError } = await supabase
              .from('profiles')
              .update(profileUpdates)
              .eq('user_id', user.id);

            if (dbError) throw dbError;
          }

          set({
            user: data.user,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Update profile error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      initialize: async () => {
        set({ isLoading: true });
        try {
          // Add timeout to prevent hanging
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session fetch timeout')), 4000)
          );
          
          const { data: { session } } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;
          
          set({
            user: session?.user || null,
            session,
            isAuthenticated: !!session,
            isLoading: false
          });

          // Listen for auth changes (non-blocking)
          supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            set({
              user: session?.user || null,
              session,
              isAuthenticated: !!session,
            });
          });
        } catch (error: any) {
          console.error('Initialize auth error:', error);
          // Don't block the app if auth initialization fails
          set({ 
            error: error.message, 
            isLoading: false,
            user: null,
            session: null,
            isAuthenticated: false
          });
        }
      },
      
      verifyOTP: async (email, token) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup'
          });

          if (error) throw error;

          if (data.user && data.session) {
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error: any) {
          console.error('OTP verification error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
            resendOTP: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email
          });
          
          if (error) throw error;
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Resend OTP error:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);