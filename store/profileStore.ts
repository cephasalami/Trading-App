import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileData, ProfileStats, SocialLink, ContactInfo } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { getUserNumericId } from '@/lib/utils';

interface ProfileState {
  profiles: ProfileData[];
  activeProfileId: string | null;
  profileStats: Record<string, ProfileStats>;
  isFirstLaunch: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadProfiles: () => Promise<void>;
  addProfile: (profile: Omit<ProfileData, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Omit<ProfileData, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (id: string) => Promise<void>;
  incrementProfileViews: (id: string) => Promise<void>;
  incrementProfileSaves: (id: string) => Promise<void>;
  setFirstLaunchComplete: () => void;
  syncWithSupabase: () => Promise<void>;
  getProfileStats: (profileId: string) => Promise<ProfileStats | null>;
  
  // Real-time sync methods
  addProfileFromRealtime: (profile: any) => void;
  updateProfileFromRealtime: (updatedProfile: any) => void;
  removeProfileFromRealtime: (profileId: string) => void;
  updateStatsFromRealtime: (profileId: string, stats: ProfileStats) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      profileStats: {},
      isFirstLaunch: true,
      isLoading: false,
      error: null,
      
      loadProfiles: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ profiles: [], isLoading: false });
            return;
          }

          // Convert UUID to numeric ID
          const userId = getUserNumericId(user);

          // Get user data from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (userError) {
            // If user doesn't exist in users table, this is expected for new users
            if (userError.code === 'PGRST116') {
              set({ profiles: [], isLoading: false });
              return;
            }
            throw userError;
          }

          // Get user's links
          const { data: linksData, error: linksError } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', userData.id)
            .order('id');

          if (linksError) throw linksError;

          // Transform Supabase data to ProfileData format
          const profile: ProfileData = {
            id: userData.id.toString(),
            name: userData.name,
            headline: userData.vcard_job || '',
            bio: userData.bio,
            avatar: userData.avatar !== 'default.jpg' ? userData.avatar : undefined,
            coverImage: undefined, // Not in current schema
            cardColor: userData.background_color,
            contactInfo: {
              email: userData.vcard_email || undefined,
              phone: userData.vcard_personal_number || undefined,
              address: userData.vcard_address || undefined,
              company: userData.vcard_company || undefined,
              position: userData.vcard_job || undefined,
            },
            socialLinks: (linksData || []).map(link => ({
              id: link.id.toString(),
              platform: 'other' as const,
              url: link.link,
              username: link.name,
            })),
            isActive: true,
            createdAt: userData.created_at ? new Date(userData.created_at).getTime() : Date.now(),
            updatedAt: userData.updated_at ? new Date(userData.updated_at).getTime() : Date.now(),
          };

          set({
            profiles: [profile],
            activeProfileId: profile.id,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Error loading profiles:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      addProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          // Convert UUID to numeric ID
          const userId = getUserNumericId(user);

          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

          if (existingUser) {
            throw new Error('Profile already exists for this user');
          }

          // Generate unique username
          let username = profileData.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
          if (!username) username = 'user';
          
          // Check if username exists and make it unique
          const { data: existingUsername } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

          if (existingUsername) {
            username = `${username}${Date.now()}`;
          }

          // Insert user data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: user.email!,
              username,
              name: profileData.name,
              bio: profileData.bio || 'Your Bio goes here.',
              avatar: profileData.avatar || 'default.jpg',
              background_color: profileData.cardColor || '#EBEEF1',
              password: '', // This will be handled by Supabase Auth
              vcard_email: profileData.contactInfo.email || user.email,
              vcard_personal_number: profileData.contactInfo.phone,
              vcard_address: profileData.contactInfo.address,
              vcard_company: profileData.contactInfo.company,
              vcard_job: profileData.contactInfo.position || profileData.headline,
            })
            .select()
            .single();

          if (userError) throw userError;

          // Insert social links
          if (profileData.socialLinks && profileData.socialLinks.length > 0) {
            const linksToInsert = profileData.socialLinks
              .filter(link => link.url && link.url.trim())
              .map(link => ({
                user_id: userData.id,
                name: link.username || link.platform,
                icon: link.platform,
                link: link.url.trim(),
              }));

            if (linksToInsert.length > 0) {
              const { error: linksError } = await supabase
                .from('links')
                .insert(linksToInsert);

              if (linksError) throw linksError;
            }
          }

          // Reload profiles to get the updated data
          await get().loadProfiles();
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Error adding profile:', error);
          set({ error: error.message, isLoading: false });
          throw error; // Re-throw so the UI can handle it
        }
      },
      
      updateProfile: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          // Convert UUID to numeric ID
          const userId = getUserNumericId(user);

          // Verify user owns this profile
          if (id !== userId.toString()) {
            throw new Error('Unauthorized: Cannot update another user\'s profile');
          }

          // Update user data
          const updateData: any = {};
          if (updates.name !== undefined) updateData.name = updates.name;
          if (updates.bio !== undefined) updateData.bio = updates.bio || 'Your Bio goes here.';
          if (updates.avatar !== undefined) updateData.avatar = updates.avatar || 'default.jpg';
          if (updates.cardColor !== undefined) updateData.background_color = updates.cardColor;
          if (updates.headline !== undefined) updateData.vcard_job = updates.headline;
          
          if (updates.contactInfo) {
            if (updates.contactInfo.email !== undefined) updateData.vcard_email = updates.contactInfo.email;
            if (updates.contactInfo.phone !== undefined) updateData.vcard_personal_number = updates.contactInfo.phone;
            if (updates.contactInfo.address !== undefined) updateData.vcard_address = updates.contactInfo.address;
            if (updates.contactInfo.company !== undefined) updateData.vcard_company = updates.contactInfo.company;
            if (updates.contactInfo.position !== undefined) updateData.vcard_job = updates.contactInfo.position;
          }

          // Only update if there are changes
          if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date().toISOString();
            
            const { error: userError } = await supabase
              .from('users')
              .update(updateData)
              .eq('id', userId);

            if (userError) throw userError;
          }

          // Handle social links updates
          if (updates.socialLinks !== undefined) {
            // Delete existing links
            const { error: deleteError } = await supabase
              .from('links')
              .delete()
              .eq('user_id', userId);

            if (deleteError) throw deleteError;

            // Insert new links
            if (updates.socialLinks.length > 0) {
              const linksToInsert = updates.socialLinks
                .filter(link => link.url && link.url.trim())
                .map(link => ({
                  user_id: userId,
                  name: link.username || link.platform,
                  icon: link.platform,
                  link: link.url.trim(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }));

              if (linksToInsert.length > 0) {
                const { error: linksError } = await supabase
                  .from('links')
                  .insert(linksToInsert);

                if (linksError) throw linksError;
              }
            }
          }

          // Reload profiles to get the updated data
          await get().loadProfiles();
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Error updating profile:', error);
          set({ error: error.message, isLoading: false });
          throw error; // Re-throw so the UI can handle it
        }
      },
      
      deleteProfile: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          // Convert UUID to numeric ID
          const userId = getUserNumericId(user);

          // Delete user's links first
          await supabase
            .from('links')
            .delete()
            .eq('user_id', userId);

          // Delete user
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

          if (error) throw error;

          // Update local state
          const { profiles, activeProfileId } = get();
          const newProfiles = profiles.filter(profile => profile.id !== id);
          
          let newActiveProfileId = activeProfileId;
          if (activeProfileId === id && newProfiles.length > 0) {
            newActiveProfileId = newProfiles[0].id;
          } else if (newProfiles.length === 0) {
            newActiveProfileId = null;
          }
          
          set({
            profiles: newProfiles,
            activeProfileId: newActiveProfileId,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Error deleting profile:', error);
          set({ error: error.message, isLoading: false });
        }
      },
      
      setActiveProfile: async (id) => {
        // For now, just update local state since we only support one profile per user
        set((state) => ({
          profiles: state.profiles.map(profile => ({
            ...profile,
            isActive: profile.id === id
          })),
          activeProfileId: id
        }));
      },
      
      incrementProfileViews: async (id) => {
        try {
          // Track view in visits table (using existing schema)
          const numericId = parseInt(id);
          if (!isNaN(numericId)) {
            // Get user's first link to track visit
            const { data: links } = await supabase
              .from('links')
              .select('id')
              .eq('user_id', numericId)
              .limit(1);

            if (links && links.length > 0) {
              // Insert visit record
              await supabase
                .from('visits')
                .insert({
                  link_id: links[0].id,
                  user_agent: 'Mobile App View',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
            }
          }

          // Update local state
          set((state) => ({
            profileStats: {
              ...state.profileStats,
              [id]: {
                ...state.profileStats[id],
                views: (state.profileStats[id]?.views || 0) + 1,
                lastViewed: Date.now()
              }
            }
          }));
        } catch (error) {
          console.error('Error incrementing profile views:', error);
          // Still update local state even if Supabase fails
          set((state) => ({
            profileStats: {
              ...state.profileStats,
              [id]: {
                ...state.profileStats[id],
                views: (state.profileStats[id]?.views || 0) + 1,
                lastViewed: Date.now()
              }
            }
          }));
        }
      },
      
      incrementProfileSaves: async (id) => {
        try {
          // Update stats in Supabase if needed
          // For now, just update local state
          set((state) => ({
            profileStats: {
              ...state.profileStats,
              [id]: {
                ...state.profileStats[id],
                saves: (state.profileStats[id]?.saves || 0) + 1
              }
            }
          }));
        } catch (error) {
          console.error('Error incrementing profile saves:', error);
        }
      },
      
      setFirstLaunchComplete: () => {
        set({ isFirstLaunch: false });
      },

      syncWithSupabase: async () => {
        await get().loadProfiles();
      },

      getProfileStats: async (profileId: string) => {
        try {
          const numericId = parseInt(profileId);
          if (isNaN(numericId)) return null;

          // Get all links for this user
          const { data: links } = await supabase
            .from('links')
            .select('id')
            .eq('user_id', numericId);

          if (!links || links.length === 0) return null;

          const linkIds = links.map(link => link.id);

          // Get visit count
          const { data: visits, error } = await supabase
            .from('visits')
            .select('id, created_at')
            .in('link_id', linkIds);

          if (error) throw error;

          const totalViews = visits?.length || 0;
          const lastViewed = visits && visits.length > 0 
            ? Math.max(...visits.map(v => new Date(v.created_at).getTime()))
            : null;

          return {
            views: totalViews,
            saves: 0, // Not tracked in current schema
            lastViewed: lastViewed !== null ? lastViewed : undefined
          };
        } catch (error) {
          console.error('Error getting profile stats:', error);
          return null;
        }
      },

      // Real-time sync methods
      addProfileFromRealtime: (profile: any) => {
        set((state) => ({
          profiles: [...state.profiles, profile]
        }));
      },

      updateProfileFromRealtime: (updatedProfile: any) => {
        set((state) => ({
          profiles: state.profiles.map(profile => 
            profile.id === updatedProfile.id ? updatedProfile : profile
          )
        }));
      },

      removeProfileFromRealtime: (profileId: string) => {
        set((state) => ({
          profiles: state.profiles.filter(profile => profile.id !== profileId)
        }));
      },

      updateStatsFromRealtime: (profileId: string, stats: ProfileStats) => {
        set((state) => ({
          profileStats: {
            ...state.profileStats,
            [profileId]: stats
          }
        }));
      }
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);