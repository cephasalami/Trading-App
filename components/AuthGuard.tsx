import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import colors from '@/constants/colors';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const { isFirstLaunch, loadProfiles } = useProfileStore();

  // Load profiles when user is authenticated (with timeout)
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadProfilesWithTimeout = async () => {
        try {
          // Add timeout to prevent hanging
          const loadPromise = loadProfiles();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile loading timeout')), 3000)
          );
          
          await Promise.race([loadPromise, timeoutPromise]);
        } catch (error) {
          console.warn('Profile loading failed or timed out:', error);
          // Continue anyway - don't block the app
        }
      };
      
      loadProfilesWithTimeout();
    }
  }, [isAuthenticated, user, loadProfiles]);

  useEffect(() => {
    if (authLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const currentPath = segments.join('/');

    // Add a small delay to prevent rapid navigation changes
    const navigationTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        // User is not authenticated
        if (inTabsGroup) {
          // Redirect to appropriate auth screen
          if (isFirstLaunch) {
            router.replace('/onboarding');
          } else {
            router.replace('/login');
          }
        }
      } else {
        // User is authenticated
        if (!inTabsGroup && !currentPath.includes('profile') && !currentPath.includes('contacts') && !currentPath.includes('scan')) {
          // Redirect to main app
          router.replace('/(tabs)/cards');
        }
      }
    }, 100);

    return () => clearTimeout(navigationTimeout);
  }, [isAuthenticated, authLoading, segments, isFirstLaunch, router]);

  if (authLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}