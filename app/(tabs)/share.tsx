import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Image } from 'react-native';
import { useProfileStore } from '@/store/profileStore';
import colors from '@/constants/colors';
import EmptyState from '@/components/EmptyState';
import { useRouter } from 'expo-router';
import { 
  Share as ShareIcon, 
  Wallet, 
  QrCode, 
  Home, 
  Lock, 
  Download,
  Crown,
  UserPlus,
  X,
  Copy,
  MessageSquare,
  Mail,
  ChevronDown
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCustomizationModal from '@/components/QRCustomizationModal';
import {
  shareProfile,
  shareViaText,
  shareViaEmail,
  shareViaSocial,
  saveQRCodeToPhotos,
  copyCardLink,
  addToWallet,
  addToHomeScreen,
  addToLockScreen,
  generateQRCodeUrl
} from '@/lib/sharing';

export default function ShareScreen() {
  const router = useRouter();
  const { profiles, activeProfileId } = useProfileStore();
  
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const [shareOffline, setShareOffline] = useState(false);
  
  const handleCreateProfile = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/profile/create');
  };
  
  const handleCopyLink = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeProfile) {
      await copyCardLink(activeProfile.id);
    }
  };
  
  const handleShareViaText = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeProfile) {
      await shareViaText({
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        qrCodeUrl: generateQRCodeUrl(activeProfile.id)
      });
    }
  };
  
  const handleShareViaEmail = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeProfile) {
      await shareViaEmail({
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        qrCodeUrl: generateQRCodeUrl(activeProfile.id)
      });
    }
  };
  
  const handleShareViaSocial = async (platform: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeProfile) {
      await shareViaSocial(platform, {
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        qrCodeUrl: generateQRCodeUrl(activeProfile.id)
      });
    }
  };
  
  const handleAddToWallet = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (activeProfile) {
      await addToWallet({
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        qrCodeUrl: generateQRCodeUrl(activeProfile.id)
      });
    }
  };
  
  const handleCustomizeQR = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Premium Feature', 'Customize QR code design with Tapping Premium.');
  };
  
  const handleAddToHomeScreen = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeProfile) {
      await addToHomeScreen({
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        qrCodeUrl: generateQRCodeUrl(activeProfile.id)
      });
    }
  };
  
  const handleAddToLockScreen = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeProfile) {
      await addToLockScreen({
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        qrCodeUrl: generateQRCodeUrl(activeProfile.id)
      });
    }
  };
  
  const handleSaveToPhotos = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (activeProfile) {
      await saveQRCodeToPhotos(
        generateQRCodeUrl(activeProfile.id, 600), // Higher resolution for saving
        activeProfile.name
      );
    }
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
  
  // Generate QR code URL
  const qrCodeUrl = generateQRCodeUrl(activeProfile.id, 300);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.push('/(tabs)/cards')}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.profileSelector}>
          <Text style={styles.profileSelectorText}>Sharing Personal</Text>
          <ChevronDown size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.qrSection}>
          <View style={styles.qrContainer}>
            <Image 
              source={{ uri: qrCodeUrl }}
              style={styles.qrCode}
              resizeMode="contain"
            />
            <View style={styles.qrBranding}>
              <Text style={styles.brandingText}>Tapping</Text>
            </View>
          </View>
          
          <Text style={styles.instructionText}>
            Have someone point their camera at the QR code to receive your contact information
          </Text>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareProfile}
          >
            <ShareIcon size={20} color="#000000" />
            <Text style={styles.shareButtonText}>Share Your Card</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.optionsSection}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleCopyLink}
          >
            <Copy size={20} color="#FFFFFF" />
            <Text style={styles.optionText}>Copy Card Link</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleShareViaText}
          >
            <MessageSquare size={20} color="#FFFFFF" />
            <Text style={styles.optionText}>Share Card via Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleShareViaEmail}
          >
            <Mail size={20} color="#FFFFFF" />
            <Text style={styles.optionText}>Share Card via Email</Text>
          </TouchableOpacity>
          
          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: '#333' }]}>
                <Text style={styles.offlineIcon}>📱</Text>
              </View>
              <Text style={styles.optionText}>Share Card offline</Text>
            </View>
            <Switch
              value={shareOffline}
              onValueChange={setShareOffline}
              trackColor={{ false: '#2C2C2C', true: colors.primary }}
              thumbColor={shareOffline ? '#FFFFFF' : '#CCCCCC'}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.disabledOption]}
            disabled
          >
            <View style={[styles.optionIcon, { backgroundColor: '#333' }]}>
              <Text style={styles.nameDropIcon}>🤝</Text>
            </View>
            <Text style={[styles.optionText, styles.disabledText]}>Share Card with NameDrop</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => handleShareViaSocial('LinkedIn')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#0077B5' }]}>
              <Text style={styles.socialIcon}>in</Text>
            </View>
            <Text style={styles.optionText}>Share Card via LinkedIn</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => handleShareViaSocial('Instagram')}
          >
            <LinearGradient
              colors={['#E4405F', '#F77737', '#FCAF45']}
              style={styles.optionIcon}
            >
              <Text style={styles.socialIcon}>📷</Text>
            </LinearGradient>
            <Text style={styles.optionText}>Share Card via Instagram</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => handleShareViaSocial('WhatsApp')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#25D366' }]}>
              <Text style={styles.socialIcon}>💬</Text>
            </View>
            <Text style={styles.optionText}>Share Card via WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => handleShareViaSocial('X')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#000000', borderWidth: 1, borderColor: '#333' }]}>
              <Text style={styles.socialIcon}>𝕏</Text>
            </View>
            <Text style={styles.optionText}>Share Card via X</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.additionalSection}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleAddToWallet}
          >
            <Wallet size={20} color="#FFFFFF" />
            <Text style={styles.optionText}>Add Card to Wallet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.premiumOption]}
            onPress={handleCustomizeQR}
          >
            <QrCode size={20} color="#FFD700" />
            <Text style={[styles.optionText, styles.premiumText]}>Customize QR Code</Text>
            <Crown size={16} color="#FFD700" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleAddToHomeScreen}
          >
            <Home size={20} color="#FFFFFF" />
            <Text style={styles.optionText}>Add QR to Home Screen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleAddToLockScreen}
          >
            <Lock size={20} color="#FFFFFF" />
            <Text style={styles.optionText}>Add QR to Lock Screen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleSaveToPhotos}
          >
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.optionText}>Save QR Code to Photos</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  profileSelectorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  qrBranding: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  brandingText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  instructionText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  shareButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsSection: {
    marginBottom: 24,
  },
  additionalSection: {
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#666666',
  },
  premiumOption: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  premiumText: {
    color: '#FFD700',
  },
  socialIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  offlineIcon: {
    fontSize: 16,
  },
  nameDropIcon: {
    fontSize: 16,
  },
});