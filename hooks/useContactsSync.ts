import { useEffect } from 'react';
import { useContactsStore } from '@/store/contactsStore';
import { useAuthStore } from '@/store/authStore';

export function useContactsSync() {
  const { user } = useAuthStore();
  const { loadContacts, syncWithSupabase } = useContactsStore();

  useEffect(() => {
    if (user) {
      // Load contacts when user is authenticated
      loadContacts();
    }
  }, [user, loadContacts]);

  const syncContacts = async () => {
    if (user) {
      await syncWithSupabase();
    }
  };

  return {
    syncContacts
  };
}
