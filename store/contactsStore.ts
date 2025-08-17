import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { getUserNumericId } from '@/lib/utils';

interface ContactsState {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadContacts: () => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addNoteToContact: (id: string, note: string) => Promise<void>;
  addTagToContact: (id: string, tag: string) => Promise<void>;
  removeTagFromContact: (id: string, tag: string) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
  
  // Real-time sync methods
  addContactFromRealtime: (contact: any) => void;
  updateContactFromRealtime: (updatedContact: any) => void;
  removeContactFromRealtime: (contactId: string) => void;
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: [],
      isLoading: false,
      error: null,
      
      loadContacts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ contacts: [], isLoading: false });
            return;
          }

          // Convert UUID to numeric ID
          const userId = getUserNumericId(user);

          // Get contacts from Supabase
          const { data: contactsData, error: contactsError } = await supabase
            .from('contacts')
            .select(`
              *,
              profiles!inner(
                id,
                name,
                headline,
                bio,
                avatar,
                card_color,
                contact_info(
                  email,
                  phone,
                  address,
                  company,
                  position
                ),
                social_links(
                  id,
                  platform,
                  url,
                  username
                )
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (contactsError) {
            // If table doesn't exist or no contacts, return empty array
            if (contactsError.code === 'PGRST116' || contactsError.code === '42P01') {
              set({ contacts: [], isLoading: false });
              return;
            }
            throw contactsError;
          }

          // Transform Supabase data to Contact format
          const contacts: Contact[] = (contactsData || []).map(contact => {
            const profile = contact.profiles;
            return {
              id: contact.id,
              name: profile.name,
              headline: profile.headline || '',
              bio: profile.bio || '',
              avatar: profile.avatar !== 'default.jpg' ? profile.avatar : undefined,
              cardColor: profile.card_color || '#EBEEF1',
              contactInfo: {
                email: profile.contact_info?.[0]?.email,
                phone: profile.contact_info?.[0]?.phone,
                address: profile.contact_info?.[0]?.address,
                company: profile.contact_info?.[0]?.company,
                position: profile.contact_info?.[0]?.position,
              },
              socialLinks: (profile.social_links || []).map((link: any) => ({
                id: link.id,
                platform: link.platform || 'other',
                url: link.url,
                username: link.username,
              })),
              isActive: true, // Contacts are always considered active
              createdAt: new Date(contact.created_at).getTime(),
              updatedAt: contact.updated_at 
                ? new Date(contact.updated_at).getTime() 
                : new Date(contact.created_at).getTime(),
              // Contact-specific fields
              notes: contact.notes || '',
              tags: contact.tags || [],
              meetingContext: contact.meeting_context || '',
              lastInteraction: contact.last_interaction 
                ? new Date(contact.last_interaction).getTime() 
                : new Date(contact.created_at).getTime(),
            };
          });

          set({ contacts, isLoading: false });
        } catch (error: unknown) {
          console.error('Error loading contacts:', error);
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
        }
      },
      
      addContact: async (contact) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          // Convert UUID to numeric ID
          const userId = getUserNumericId(user);

          // Insert contact into Supabase
          const { error: contactError } = await supabase
            .from('contacts')
            .insert({
              user_id: userId,
              profile_id: contact.id, // Use contact ID as profile ID for now
              notes: contact.notes || '',
              tags: contact.tags || [],
              meeting_context: contact.meetingContext || '',
              last_interaction: contact.lastInteraction 
                ? new Date(contact.lastInteraction).toISOString()
                : new Date().toISOString(),
            })
            .select()
            .single();

          if (contactError) throw contactError;

          // Reload contacts to get the updated data with profile info
          await get().loadContacts();
          
          set({ isLoading: false });
        } catch (error: unknown) {
          console.error('Error adding contact:', error);
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
          throw error; // Re-throw so the UI can handle it
        }
      },
      
      updateContact: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          // Convert UUID to numeric ID
          const userId = getUserNumericId(user);

          // Prepare update data
          const updateData: any = {};
          if (updates.notes !== undefined) updateData.notes = updates.notes;
          if (updates.tags !== undefined) updateData.tags = updates.tags;
          if (updates.meetingContext !== undefined) updateData.meeting_context = updates.meetingContext;
          if (updates.lastInteraction !== undefined) {
            updateData.last_interaction = new Date(updates.lastInteraction).toISOString();
          }

          // Only update if there are changes
          if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date().toISOString();
            
            const { error: updateError } = await supabase
              .from('contacts')
              .update(updateData)
              .eq('id', id)
              .eq('user_id', userId); // Ensure user can only update their own contacts

            if (updateError) throw updateError;
          }

          // Update local state
          set((state) => ({
            contacts: state.contacts.map(contact => 
              contact.id === id 
                ? { ...contact, ...updates } 
                : contact
            ),
            isLoading: false
          }));
        } catch (error: unknown) {
          console.error('Error updating contact:', error);
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
          throw error; // Re-throw so the UI can handle it
        }
      },
      
      deleteContact: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          // Convert UUID to numeric ID
          const userId = getUserNumericId(user);

          // Delete contact from Supabase
          const { error: deleteError } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // Ensure user can only delete their own contacts

          if (deleteError) throw deleteError;

          // Update local state
          set((state) => ({
            contacts: state.contacts.filter(contact => contact.id !== id),
            isLoading: false
          }));
        } catch (error: unknown) {
          console.error('Error deleting contact:', error);
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
          throw error; // Re-throw so the UI can handle it
        }
      },
      
      addNoteToContact: async (id, note) => {
        const contact = get().contacts.find(c => c.id === id);
        if (!contact) return;

        const newNotes = contact.notes ? `${contact.notes}\n\n${note}` : note;
        await get().updateContact(id, { 
          notes: newNotes,
          lastInteraction: Date.now()
        });
      },
      
      addTagToContact: async (id, tag) => {
        const contact = get().contacts.find(c => c.id === id);
        if (!contact) return;

        const newTags = [...(contact.tags || []), tag];
        await get().updateContact(id, { tags: newTags });
      },
      
      removeTagFromContact: async (id, tagToRemove) => {
        const contact = get().contacts.find(c => c.id === id);
        if (!contact) return;

        const newTags = (contact.tags || []).filter(tag => tag !== tagToRemove);
        await get().updateContact(id, { tags: newTags });
      },

      syncWithSupabase: async () => {
        await get().loadContacts();
      },

      // Real-time sync methods
      addContactFromRealtime: (contact: any) => {
        set((state) => ({
          contacts: [...state.contacts, contact]
        }));
      },

      updateContactFromRealtime: (updatedContact: any) => {
        set((state) => ({
          contacts: state.contacts.map(contact => 
            contact.id === updatedContact.id ? updatedContact : contact
          )
        }));
      },

      removeContactFromRealtime: (contactId: string) => {
        set((state) => ({
          contacts: state.contacts.filter(contact => contact.id !== contactId)
        }));
      }
    }),
    {
      name: 'contacts-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
