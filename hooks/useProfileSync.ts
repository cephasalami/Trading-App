import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

/**
 * Hook to sync profile data with Supabase when authentication state changes
 */
export function useProfileSync() {
  const { isAuthenticated, user } = useAuthStore();
  const { loadProfiles, syncWithSupabase } = useProfileStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load profiles when user is authenticated
      loadProfiles();
    }
  }, [isAuthenticated, user, loadProfiles]);

  // Return sync function for manual syncing
  return {
    syncProfiles: syncWithSupabase,
  };
}
