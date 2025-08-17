import { Platform, Alert, Linking } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';

export interface ShareOptions {
  profileId: string;
  profileName: string;
  qrCodeUrl: string;
}

export const shareProfile = async (options: ShareOptions) => {
  const { profileId, profileName } = options;
  const cardLink = `https://tapping.app/card/${profileId}`;
  
  if (Platform.OS === 'web') {
    // Web sharing using Web Share API or fallback
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName}'s Digital Card`,
          text: `Check out ${profileName}'s digital business card`,
          url: cardLink,
        });
      } catch (error) {
        // User cancelled or error occurred, fallback to clipboard
        await Clipboard.setStringAsync(cardLink);
        Alert.alert('Link Copied', 'Card link has been copied to clipboard');
      }
    } else {
      // Fallback for browsers without Web Share API
      await Clipboard.setStringAsync(cardLink);
      Alert.alert('Link Copied', 'Card link has been copied to clipboard');
    }
  } else {
    // Native sharing
    try {
      await Sharing.shareAsync(cardLink, {
        dialogTitle: `Share ${profileName}'s Digital Card`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share card');
    }
  }
};

export const shareViaText = async (options: ShareOptions) => {
  const { profileId, profileName } = options;
  const cardLink = `https://tapping.app/card/${profileId}`;
  const message = `Check out ${profileName}'s digital business card: ${cardLink}`;
  
  if (Platform.OS === 'web') {
    // Web fallback - copy to clipboard
    await Clipboard.setStringAsync(message);
    Alert.alert('Message Copied', 'Message has been copied to clipboard. You can paste it in your messaging app.');
  } else {
    // Native SMS
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        throw new Error('SMS not available');
      }
    } catch (error) {
      // Fallback to copying
      await Clipboard.setStringAsync(message);
      Alert.alert('Message Copied', 'Message has been copied to clipboard');
    }
  }
};

export const shareViaEmail = async (options: ShareOptions) => {
  const { profileId, profileName } = options;
  const cardLink = `https://tapping.app/card/${profileId}`;
  const subject = `${profileName}'s Digital Business Card`;
  const body = `Hi,\n\nI'd like to share my digital business card with you. You can view it here: ${cardLink}\n\nBest regards,\n${profileName}`;
  
  if (Platform.OS === 'web') {
    // Web email
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      window.open(emailUrl);
    } catch (error) {
      await Clipboard.setStringAsync(body);
      Alert.alert('Email Content Copied', 'Email content has been copied to clipboard');
    }
  } else {
    // Native email
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        throw new Error('Email not available');
      }
    } catch (error) {
      await Clipboard.setStringAsync(body);
      Alert.alert('Email Content Copied', 'Email content has been copied to clipboard');
    }
  }
};

export const shareViaSocial = async (platform: string, options: ShareOptions) => {
  const { profileId, profileName } = options;
  const cardLink = `https://tapping.app/card/${profileId}`;
  
  let url = '';
  let message = `Check out ${profileName}'s digital business card: ${cardLink}`;
  
  switch (platform.toLowerCase()) {
    case 'linkedin':
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardLink)}`;
      break;
    case 'x':
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      break;
    case 'whatsapp':
      url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      break;
    case 'instagram':
      // Instagram doesn't support direct URL sharing, so we copy to clipboard
      await Clipboard.setStringAsync(message);
      Alert.alert('Message Copied', 'Message copied to clipboard. You can paste it in Instagram.');
      return;
    default:
      Alert.alert('Platform Not Supported', `${platform} sharing is not yet implemented`);
      return;
  }
  
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to copying
        await Clipboard.setStringAsync(message);
        Alert.alert('Message Copied', `${platform} app not found. Message copied to clipboard.`);
      }
    } catch (error) {
      await Clipboard.setStringAsync(message);
      Alert.alert('Message Copied', 'Message copied to clipboard');
    }
  }
};

export const saveQRCodeToPhotos = async (qrCodeUrl: string, profileName: string) => {
  if (Platform.OS === 'web') {
    // Web: Download the image
    try {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${profileName}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Alert.alert('Download Started', 'QR code download has started');
    } catch (error) {
      Alert.alert('Error', 'Failed to download QR code');
    }
  } else {
    // Native: Save to photo library
    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save photos');
        return;
      }
      
      // Download the image to local file system
      const fileUri = FileSystem.documentDirectory + `${profileName}-qr-code.png`;
      const downloadResult = await FileSystem.downloadAsync(qrCodeUrl, fileUri);
      
      if (downloadResult.status === 200) {
        // Save to photo library
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        Alert.alert('Success', 'QR code saved to Photos');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code to Photos');
    }
  }
};

export const copyCardLink = async (profileId: string) => {
  const cardLink = `https://tapping.app/card/${profileId}`;
  await Clipboard.setStringAsync(cardLink);
  Alert.alert('Link Copied', 'Card link has been copied to clipboard');
};

export const addToWallet = async (options: ShareOptions) => {
  // This would require implementing Apple Wallet (.pkpass) or Google Pay integration
  // For now, we'll show a placeholder
  Alert.alert(
    'Add to Wallet',
    'This feature will add your digital card to Apple Wallet or Google Pay. Implementation requires backend integration for pass generation.',
    [
      { text: 'Learn More', onPress: () => Linking.openURL('https://developer.apple.com/wallet/') },
      { text: 'OK' }
    ]
  );
};

export const addToHomeScreen = async (options: ShareOptions) => {
  const { profileName } = options;
  
  if (Platform.OS === 'ios') {
    Alert.alert(
      'Add to Home Screen',
      `To add ${profileName}'s QR code to your home screen:\n\n1. Open Safari and go to your card link\n2. Tap the Share button\n3. Select "Add to Home Screen"\n4. Customize the name and tap "Add"`,
      [{ text: 'OK' }]
    );
  } else if (Platform.OS === 'android') {
    Alert.alert(
      'Add to Home Screen',
      `To add ${profileName}'s QR code to your home screen:\n\n1. Long press on your home screen\n2. Select "Widgets"\n3. Find and add a QR code widget\n4. Configure it with your card link`,
      [{ text: 'OK' }]
    );
  } else {
    Alert.alert(
      'Add to Home Screen',
      'This feature is available on mobile devices. You can bookmark this page in your browser for quick access.',
      [{ text: 'OK' }]
    );
  }
};

export const addToLockScreen = async (options: ShareOptions) => {
  const { profileName } = options;
  
  if (Platform.OS === 'ios') {
    Alert.alert(
      'Add to Lock Screen',
      `To add ${profileName}'s QR code to your lock screen:\n\n1. Go to Settings > Wallpaper\n2. Choose "Add New Wallpaper"\n3. Select "Photos" and choose your saved QR code\n4. Set as Lock Screen wallpaper\n\nNote: Save the QR code to Photos first using the "Save QR Code to Photos" option.`,
      [{ text: 'OK' }]
    );
  } else if (Platform.OS === 'android') {
    Alert.alert(
      'Add to Lock Screen',
      `To add ${profileName}'s QR code to your lock screen:\n\n1. Long press on your lock screen\n2. Select "Widgets" or "Customize"\n3. Add a QR code widget\n4. Configure it with your card link\n\nNote: Widget availability depends on your Android version and launcher.`,
      [{ text: 'OK' }]
    );
  } else {
    Alert.alert(
      'Add to Lock Screen',
      'This feature is available on mobile devices with widget support.',
      [{ text: 'OK' }]
    );
  }
};

export const generateQRCodeUrl = (profileId: string, size: number = 300): string => {
  const cardLink = `https://tapping.app/card/${profileId}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(cardLink)}&color=000000&bgcolor=FFFFFF&margin=10`;
};

export const generateCustomQRCodeUrl = (
  profileId: string, 
  options: {
    size?: number;
    color?: string;
    backgroundColor?: string;
    margin?: number;
  } = {}
): string => {
  const {
    size = 300,
    color = '000000',
    backgroundColor = 'FFFFFF',
    margin = 10
  } = options;
  
  const cardLink = `https://tapping.app/card/${profileId}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(cardLink)}&color=${color}&bgcolor=${backgroundColor}&margin=${margin}`;
};