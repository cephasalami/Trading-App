import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ProfileData } from '@/types/profile';
import colors from '@/constants/colors';
import Button from './Button';
import { Share, QrCode } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateQRCodeUrl } from '@/lib/sharing';

interface QRCodeCardProps {
  profile: ProfileData;
  onShare: () => void;
}

export default function QRCodeCard({ profile, onShare }: QRCodeCardProps) {
  // Generate QR code URL using the sharing utility
  const qrCodeUrl = generateQRCodeUrl(profile.id, 200);
  
  // Get card color from profile or use default
  const cardColor = profile.cardColor || colors.primary;
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[cardColor + '20', colors.card]}
        style={styles.gradient}
      >
        <View style={styles.qrContainer}>
          <QrCode size={32} color={colors.text} style={styles.qrIcon} />
          <Image 
            source={{ uri: qrCodeUrl }}
            style={styles.qrCode}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Your Digital Card</Text>
          <Text style={styles.subtitle}>{profile.name}</Text>
          <Text style={styles.description}>
            Scan this QR code to instantly share your digital business card
          </Text>
          
          <Button
            title="Share Card"
            onPress={onShare}
            variant="gradient"
            icon={<Share size={18} color="white" />}
            style={styles.shareButton}
          />
        </View>
      </LinearGradient>
    </View>
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
  },
  gradient: {
    padding: 20,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    position: 'relative',
  },
  qrIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.7,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  infoContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  shareButton: {
    width: '100%',
    marginTop: 8,
  },
});