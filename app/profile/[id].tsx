import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share as RNShare, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import { useContactsStore } from '@/store/contactsStore';
import colors from '@/constants/colors';
import ProfileCard from '@/components/ProfileCard';
import Button from '@/components/Button';
import { Edit, Share, UserPlus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { profiles, incrementProfileViews } = useProfileStore();
  const { contacts, addContact } = useContactsStore();
  
  const profile = profiles.find(p => p.id === id);
  const isInContacts = contacts.some(c => c.id === id);
  
  // Increment view count when profile is viewed
  React.useEffect(() => {
    if (profile) {
      incrementProfileViews(profile.id);
    }
  }, [profile?.id]);
  
  if (!profile) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Profile not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
          style={styles.backButton}
        />
      </View>
    );
  }
  
  const handleEditProfile = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/profile/edit/${profile.id}`);
  };
  
  const handleShareProfile = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const result = await RNShare.share({
        message: `Check out my digital business card: https://digitalcard.app/profile/${profile.id}`,
        title: `${profile.name}'s Digital Card`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };
  
  const handleAddToContacts = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    addContact(profile);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{profile.name}'s Card</Text>
        
        <View style={styles.headerActions}>
          {/* Only show edit button for user's own profiles */}
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleEditProfile}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleShareProfile}
          >
            <Share size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ProfileCard profile={profile} isPreview />
      
      {!isInContacts && (
        <Button
          title="Add to Contacts"
          onPress={handleAddToContacts}
          variant="primary"
          icon={<UserPlus size={20} color="white" />}
          style={styles.addButton}
        />
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.bioText}>
          {profile.bio || "No bio provided."}
        </Text>
      </View>
      
      {profile.socialLinks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect</Text>
          <View style={styles.socialLinks}>
            {profile.socialLinks.map(link => (
              <TouchableOpacity key={link.id} style={styles.socialLink}>
                <Text style={styles.socialPlatform}>{link.platform}</Text>
                <Text style={styles.socialUrl} numberOfLines={1}>{link.url}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    marginTop: 16,
  },
  section: {
    marginTop: 24,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  socialLinks: {
    gap: 12,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  socialPlatform: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    width: 100,
  },
  socialUrl: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    minWidth: 120,
  },
});