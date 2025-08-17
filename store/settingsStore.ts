import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { getUserNumericId } from '@/lib/utils';
import { useAuthStore } from './authStore';

export interface AppSettings {
  id?: string;
  user_id?: number;
  follow_up_email: boolean;
  lockscreen_widget: boolean;
  direct_link: boolean;
  share_offline: boolean;
  remove_branding: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  loadSettings: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
  resetSettings: () => Promise<void>;
  clearError: () => void;
}

const defaultSettings: AppSettings = {
  follow_up_email: false,
  lockscreen_widget: false,
  direct_link: false,
  share_offline: false,
  remove_branding: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,
      isInitialized: false,
      
      updateSetting: async (key, value) => {
        const { settings } = get();
        const newSettings = { ...settings, [key]: value };
        
        set({ 
          settings: newSettings,
          isLoading: true,
          error: null 
        });
        
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          const userId = getUserNumericId(user);
          
          // Update in Supabase
          const { error } = await supabase
            .from('app_settings')
            .upsert({
              user_id: userId,
              [key]: value,
            }, {
              onConflict: 'user_id'
            });
          
          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Error updating setting:', error);
          // Revert local change on error
          set({ 
            settings,
            error: error.message,
            isLoading: false 
          });
        }
      },
      
      loadSettings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            set({ 
              settings: defaultSettings,
              isLoading: false,
              isInitialized: true 
            });
            return;
          }
          
          const userId = getUserNumericId(user);
          
          const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
          }
          
          const settings = data ? {
            ...data,
            // Ensure all required fields are present
            follow_up_email: data.follow_up_email ?? false,
            lockscreen_widget: data.lockscreen_widget ?? false,
            direct_link: data.direct_link ?? false,
            share_offline: data.share_offline ?? false,
            remove_branding: data.remove_branding ?? false,
          } : defaultSettings;
          
          set({ 
            settings,
            isLoading: false,
            isInitialized: true 
          });
        } catch (error: any) {
          console.error('Error loading settings:', error);
          set({ 
            error: error.message,
            isLoading: false,
            isInitialized: true 
          });
        }
      },
      
      syncWithSupabase: async () => {
        const { settings } = get();
        
        try {
          const { user } = useAuthStore.getState();
          if (!user) return;
          
          const userId = getUserNumericId(user);
          
          const { error } = await supabase
            .from('app_settings')
            .upsert({
              user_id: userId,
              follow_up_email: settings.follow_up_email,
              lockscreen_widget: settings.lockscreen_widget,
              direct_link: settings.direct_link,
              share_offline: settings.share_offline,
              remove_branding: settings.remove_branding,
            }, {
              onConflict: 'user_id'
            });
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error syncing settings:', error);
          set({ error: error.message });
        }
      },
      
      resetSettings: async () => {
        set({ 
          settings: defaultSettings,
          isLoading: true,
          error: null 
        });
        
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          const userId = getUserNumericId(user);
          
          const { error } = await supabase
            .from('app_settings')
            .upsert({
              user_id: userId,
              ...defaultSettings,
            }, {
              onConflict: 'user_id'
            });
          
          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Error resetting settings:', error);
          set({ 
            error: error.message,
            isLoading: false 
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// Real-time subscription setup
let settingsSubscription: any = null;

export const setupSettingsRealtime = () => {
  const { user } = useAuthStore.getState();
  if (!user) return;
  
  const userId = getUserNumericId(user);
  
  // Clean up existing subscription
  if (settingsSubscription) {
    settingsSubscription.unsubscribe();
  }
  
  // Set up real-time subscription
  settingsSubscription = supabase
    .channel('app_settings_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_settings',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Settings change received:', payload);
        
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const newSettings = payload.new as AppSettings;
          useSettingsStore.setState({
            settings: {
              ...newSettings,
              follow_up_email: newSettings.follow_up_email ?? false,
              lockscreen_widget: newSettings.lockscreen_widget ?? false,
              direct_link: newSettings.direct_link ?? false,
              share_offline: newSettings.share_offline ?? false,
              remove_branding: newSettings.remove_branding ?? false,
            }
          });
        }
      }
    )
    .subscribe();
};

export const cleanupSettingsRealtime = () => {
  if (settingsSubscription) {
    settingsSubscription.unsubscribe();
    settingsSubscription = null;
  }
};