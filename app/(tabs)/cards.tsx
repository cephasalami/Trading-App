import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useProfileStore } from '@/store/profileStore';
import { useTheme } from '@/hooks/useTheme';
import ProfileCard from '@/components/ProfileCard';
import EmptyState from '@/components/EmptyState';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { shareProfile, generateQRCodeUrl } from '@/lib/sharing';

import { ErrorState } from '@/components/EmptyState';

export default function CardsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { profiles, activeProfileId, setActiveProfile, isLoading, error, loadProfiles } = useProfileStore();
  
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  
  const handleCreateProfile = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/profile/create');
  };
  
  const handleSwitchProfile = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveProfile(id);
  };
  
  const handleGoPremium = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Navigate to premium page
    console.log('Go Premium');
  };
  
  const handleShareProfile = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeProfile) {
      await shareProfile({
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        qrCodeUrl: generateQRCodeUrl(activeProfile.id)
      });
    }
  };

  if (isLoading) {
    return <Text>Loading profiles...</Text>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProfiles} />;
  }
  
  if (!activeProfile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          title="Create Your Digital Card"
          description="Start by creating your first digital business card to share with your network."
          actionLabel="Create Card"
          onAction={handleCreateProfile}
          icon={<MaterialCommunityIcons name="account-plus" size={40} color={colors.primary} />}
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Card</Text>
          <ProfileCard profile={activeProfile} isPreview onShare={handleShareProfile} />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>All Cards</Text>
          
          <View style={[styles.cardsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {profiles.map(profile => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.cardItem,
                  { borderBottomColor: colors.border },
                  profile.id === activeProfileId && { backgroundColor: colors.lightGray }
                ]}
                onPress={() => handleSwitchProfile(profile.id)}
              >
                <Text 
                  style={[
                    styles.cardName,
                    { color: colors.text },
                    profile.id === activeProfileId && { color: colors.primary }
                  ]}
                  numberOfLines={1}
                >
                  {profile.name}
                </Text>
                {profile.contactInfo.company && (
                  <Text 
                    style={[styles.cardCompany, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {profile.contactInfo.company}
                  </Text>
                )}
                {profile.id === activeProfileId && (
                  <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.activeText, { color: colors.card }]}>Active</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.createCardButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleCreateProfile}
        >
          <View style={[styles.createCardIcon, { backgroundColor: colors.lightGray }]}>
            <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
          </View>
          <View style={styles.createCardContent}>
            <Text style={[styles.createCardTitle, { color: colors.text }]}>Create Another Card</Text>
            <Text style={[styles.createCardSubtitle, { color: colors.textSecondary }]}>Add a new digital business card</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.premiumSection}>
          <TouchableOpacity 
            style={[styles.premiumCard, { backgroundColor: colors.card }]}
            onPress={handleGoPremium}
          >
            <View style={styles.premiumHeader}>
              <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
              <Text style={[styles.premiumTitle, { color: colors.text }]}>Join Tapping Premium</Text>
            </View>
            <Text style={[styles.premiumDescription, { color: colors.textSecondary }]}>
              {`• Create up to 3 business cards
• Advanced customization options
• Analytics and insights
• Remove branding
• Priority support`}
            </Text>
            <View style={styles.premiumPricing}>
              <Text style={styles.premiumPrice}>€4.99/month</Text>
              <Text style={[styles.premiumSave, { color: colors.textSecondary }]}>Save €15 with yearly plan</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  cardsList: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardItem: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '500' as const,
    flex: 1,
  },
  cardCompany: {
    fontSize: 14,
    marginTop: 2,
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  createCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  createCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  createCardContent: {
    flex: 1,
  },
  createCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  createCardSubtitle: {
    fontSize: 14,
  },
  premiumSection: {
    marginTop: 8,
  },
  premiumCard: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 16,
    padding: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 8,
  },
  premiumDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  premiumPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  premiumSave: {
    fontSize: 12,
  },
});
