import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { ProfileData } from '@/types/profile';
import { useRouter } from 'expo-router';
import { Share, Mail, Phone, MapPin, ExternalLink } from 'lucide-react-native';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileCardProps {
  profile: ProfileData;
  onShare?: () => void;
  isPreview?: boolean;
}

export default function ProfileCard({ profile, onShare, isPreview = false }: ProfileCardProps) {
  const router = useRouter();
  
  const handlePress = () => {
    if (!isPreview) {
      router.push(`/profile/${profile.id}`);
    }
  };
  
  const defaultAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop';
  const defaultCover = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=500&auto=format&fit=crop';
  
  // Get card color from profile or use default
  const cardColor = profile.cardColor || colors.primary;
  const gradientColors = [cardColor, '#121212'];
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={isPreview ? 1 : 0.9}
    >
      <ImageBackground 
        source={{ uri: profile.coverImage || defaultCover }}
        style={styles.coverImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        {onShare && (
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Share size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </ImageBackground>
      
      <View style={styles.profileContent}>
        <Image 
          source={{ uri: profile.avatar || defaultAvatar }}
          style={styles.avatar}
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.headline && (
            <Text style={styles.headline}>{profile.headline}</Text>
          )}
          {profile.contactInfo.company && (
            <Text style={styles.company}>{profile.contactInfo.company}</Text>
          )}
          
          <View style={styles.contactDetails}>
            {profile.contactInfo.email && (
              <View style={styles.contactItem}>
                <Mail size={16} color={colors.textSecondary} />
                <Text style={styles.contactText}>{profile.contactInfo.email}</Text>
              </View>
            )}
            
            {profile.contactInfo.phone && (
              <View style={styles.contactItem}>
                <Phone size={16} color={colors.textSecondary} />
                <Text style={styles.contactText}>{profile.contactInfo.phone}</Text>
              </View>
            )}
            
            {profile.contactInfo.address && (
              <View style={styles.contactItem}>
                <MapPin size={16} color={colors.textSecondary} />
                <Text style={styles.contactText}>{profile.contactInfo.address}</Text>
              </View>
            )}
          </View>
          
          {profile.socialLinks.length > 0 && (
            <View style={styles.socialLinks}>
              <Text style={styles.socialTitle}>Connect</Text>
              <View style={styles.socialIcons}>
                {profile.socialLinks.slice(0, 4).map((link) => (
                  <TouchableOpacity key={link.id} style={[styles.socialIcon, { backgroundColor: cardColor + '30' }]}>
                    <ExternalLink size={18} color={cardColor} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  coverImage: {
    height: 160,
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  profileContent: {
    padding: 16,
    paddingTop: 0,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.card,
    marginTop: -40,
  },
  infoContainer: {
    marginTop: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  contactDetails: {
    marginTop: 8,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  socialLinks: {
    marginTop: 16,
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});