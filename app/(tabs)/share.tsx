import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Image } from 'react-native';
import { useProfileStore } from '@/store/profileStore';
import { useTheme } from '@/hooks/useTheme';
import EmptyState from '@/components/EmptyState';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NFCWriter from '@/components/NFCWriter';
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
  const colors = useTheme();
  const { profiles, activeProfileId } = useProfileStore();
  
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const [shareOffline, setShareOffline] = useState(false);
  const [showNFCWriter, setShowNFCWriter] = useState(false);
  
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

  const handleWriteToNFC = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowNFCWriter(true);
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          title="Create Your Digital Card"
          description="Start by creating your first digital business card to share with your network."
          actionLabel="Create Card"
          onAction={handleCreateProfile}
          icon={<MaterialCommunityIcons name="account-plus-outline" size={40} color={colors.primary} />}
        />
      </View>
    );
  }
  
  const qrCodeUrl = generateQRCodeUrl(activeProfile.id, 300);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.push('/(tabs)/cards')}
        >
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.profileSelector, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
          <Text style={[styles.profileSelectorText, { color: colors.text }]}>Sharing Personal</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.qrSection}>
          <View style={[styles.qrContainer, { backgroundColor: colors.card }]}>
            <Image 
              source={{ uri: qrCodeUrl }}
              style={styles.qrCode}
              resizeMode="contain"
            />
            <View style={styles.qrBranding}>
              <Text style={[styles.brandingText, { color: colors.text }]}>Tapping</Text>
            </View>
          </View>
          
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Have someone point their camera at the QR code to receive your contact information
          </Text>
          
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: colors.primary }]}
            onPress={handleShareProfile}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color={colors.card} />
            <Text style={[styles.shareButtonText, { color: colors.card }]}>Share Your Card</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.optionsSection}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleCopyLink}
          >
            <MaterialCommunityIcons name="content-copy" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Copy Card Link</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleShareViaText}
          >
            <MaterialCommunityIcons name="message-text-outline" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Share Card via Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleShareViaEmail}
          >
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Share Card via Email</Text>
          </TouchableOpacity>
          
          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.lightGray }]}>
                <Text style={styles.offlineIcon}>📱</Text>
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>Share Card offline</Text>
            </View>
            <Switch
              value={shareOffline}
              onValueChange={setShareOffline}
              trackColor={{ false: colors.mediumGray, true: colors.primary }}
              thumbColor={shareOffline ? colors.card : colors.lightGray}
            />
          </View>
        </View>
        
        <View style={styles.additionalSection}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleAddToWallet}
          >
            <MaterialCommunityIcons name="wallet-outline" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Add Card to Wallet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.premiumOption]}
            onPress={handleCustomizeQR}
          >
            <MaterialCommunityIcons name="qrcode" size={20} color="#FFD700" />
            <Text style={[styles.optionText, styles.premiumText]}>Customize QR Code</Text>
            <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleAddToHomeScreen}
          >
            <MaterialCommunityIcons name="home-outline" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Add QR to Home Screen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleAddToLockScreen}
          >
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Add QR to Lock Screen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleSaveToPhotos}
          >
            <MaterialCommunityIcons name="download-outline" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Save QR Code to Photos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleWriteToNFC}
          >
            <MaterialCommunityIcons name="nfc-variant" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Write Profile to NFC Tag</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NFCWriter
        isVisible={showNFCWriter}
        onClose={() => setShowNFCWriter(false)}
        profile={activeProfile}
        url={generateQRCodeUrl(activeProfile.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  profileSelectorText: {
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
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  shareButtonText: {
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
