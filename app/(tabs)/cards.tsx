import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useProfileStore } from '@/store/profileStore';
import colors from '@/constants/colors';
import ProfileCard from '@/components/ProfileCard';
import EmptyState from '@/components/EmptyState';
import { useRouter } from 'expo-router';
import { Plus, Crown, UserPlus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { shareProfile, generateQRCodeUrl } from '@/lib/sharing';

export default function CardsScreen() {
  const router = useRouter();
  const { profiles, activeProfileId, setActiveProfile } = useProfileStore();
  
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
  
  if (!activeProfile) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Create Your Digital Card"
          description="Start by creating your first digital business card to share with your network."
          actionLabel="Create Card"
          onAction={handleCreateProfile}
          icon={<UserPlus size={40} color={colors.primary} />}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Card</Text>
          <ProfileCard profile={activeProfile} isPreview onShare={handleShareProfile} />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Cards</Text>
          
          <View style={styles.cardsList}>
            {profiles.map(profile => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.cardItem,
                  profile.id === activeProfileId && styles.activeCardItem
                ]}
                onPress={() => handleSwitchProfile(profile.id)}
              >
                <Text 
                  style={[
                    styles.cardName,
                    profile.id === activeProfileId && styles.activeCardName
                  ]}
                  numberOfLines={1}
                >
                  {profile.name}
                </Text>
                {profile.contactInfo.company && (
                  <Text 
                    style={styles.cardCompany}
                    numberOfLines={1}
                  >
                    {profile.contactInfo.company}
                  </Text>
                )}
                {profile.id === activeProfileId && (
                  <View style={styles.activeIndicator}>
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.createCardButton}
          onPress={handleCreateProfile}
        >
          <View style={styles.createCardIcon}>
            <Plus size={24} color={colors.primary} />
          </View>
          <View style={styles.createCardContent}>
            <Text style={styles.createCardTitle}>Create Another Card</Text>
            <Text style={styles.createCardSubtitle}>Add a new digital business card</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.premiumSection}>
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={handleGoPremium}
          >
            <View style={styles.premiumHeader}>
              <Crown size={24} color="#FFD700" />
              <Text style={styles.premiumTitle}>Join Tapping Premium</Text>
            </View>
            <Text style={styles.premiumDescription}>
              • Create up to 3 business cards{'\n'}
              • Advanced customization options{'\n'}
              • Analytics and insights{'\n'}
              • Remove branding{'\n'}
              • Priority support
            </Text>
            <View style={styles.premiumPricing}>
              <Text style={styles.premiumPrice}>€4.99/month</Text>
              <Text style={styles.premiumSave}>Save €15 with yearly plan</Text>
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
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cardsList: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeCardItem: {
    backgroundColor: 'rgba(44, 44, 44, 0.8)',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    flex: 1,
  },
  activeCardName: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  cardCompany: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 2,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  createCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  createCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(44, 44, 44, 0.8)',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  createCardSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  premiumSection: {
    marginTop: 8,
  },
  premiumCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
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
    color: '#FFFFFF',
    marginLeft: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#CCCCCC',
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
    color: '#CCCCCC',
  },
});