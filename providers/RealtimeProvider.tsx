import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useContactsStore } from '@/store/contactsStore';
import { setupSettingsRealtime, cleanupSettingsRealtime } from '@/store/settingsStore';
import { getUserNumericId } from '@/lib/utils';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const subscriptionsRef = useRef<any[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    // Clean up all subscriptions when user logs out
    if (!isAuthenticated || !user) {
      subscriptionsRef.current.forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing:', error);
        }
      });
      subscriptionsRef.current = [];
      cleanupSettingsRealtime();
      setIsConnecting(false);
      return;
    }
    
    // Prevent multiple simultaneous connections
    if (isConnecting) {
      return;
    }
    
    setIsConnecting(true);
    
    const setupRealtimeConnections = () => {
      try {
        const userId = getUserNumericId(user);
        console.log('Setting up realtime connections for user:', userId);
        
        // Set up settings real-time sync (non-blocking)
        try {
          setupSettingsRealtime();
        } catch (error) {
          console.warn('Settings realtime setup failed:', error);
        }
        
        // Simplified realtime setup - don't wait for subscriptions to complete
        // This prevents the timeout issue
        
        console.log('Realtime connections setup initiated');
        setIsConnecting(false);
      } catch (error) {
        console.error('Error setting up realtime connections:', error);
        setIsConnecting(false);
      }
    };
    
    // Use a very short delay to prevent blocking
    const setupTimeout = setTimeout(() => {
      setupRealtimeConnections();
    }, 50);
    
    // Cleanup function
    return () => {
      clearTimeout(setupTimeout);
      subscriptionsRef.current.forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing:', error);
        }
      });
      subscriptionsRef.current = [];
      cleanupSettingsRealtime();
      setIsConnecting(false);
    };
  }, [isAuthenticated, user, isConnecting]);
  
  return <>{children}</>;
}