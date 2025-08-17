import { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { ProfileData, ProfileStats } from '@/types/profile';

export function useProfileWithStats(profileId: string | null) {
  const { profiles, getProfileStats } = useProfileStore();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const profile = profiles.find(p => p.id === profileId) || null;

  useEffect(() => {
    if (!profileId) {
      setStats(null);
      return;
    }

    const loadStats = async () => {
      setIsLoadingStats(true);
      try {
        const profileStats = await getProfileStats(profileId);
        setStats(profileStats);
      } catch (error) {
        console.error('Error loading profile stats:', error);
        setStats(null);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [profileId, getProfileStats]);

  return {
    profile,
    stats,
    isLoadingStats,
    refreshStats: async () => {
      if (profileId) {
        setIsLoadingStats(true);
        try {
          const profileStats = await getProfileStats(profileId);
          setStats(profileStats);
        } catch (error) {
          console.error('Error refreshing profile stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    }
  };
}

export function useActiveProfile() {
  const { profiles, activeProfileId } = useProfileStore();
  return useProfileWithStats(activeProfileId);
}
