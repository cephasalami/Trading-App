import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useContactsStore } from '@/store/contactsStore';

export function useSupabaseSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadProfiles = useProfileStore((state) => state.loadProfiles);
  const loadContacts = useContactsStore((state) => state.loadContacts);

  useEffect(() => {
    if (isAuthenticated) {
      // Load data when user is authenticated
      loadProfiles();
      loadContacts();
    }
  }, [isAuthenticated, loadProfiles, loadContacts]);

  return {
    isAuthenticated,
  };
}