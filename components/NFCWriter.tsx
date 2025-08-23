import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ProfileData } from '@/types/profile';
import { 
  initNFC, 
  isNFCSupported, 
  isNFCEnabled, 
  writeProfileToNFC, 
  writeContactToNFC, 
  writeURLToNFC,
  cleanupNFC 
} from '@/lib/nfc';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

interface NFCWriterProps {
  isVisible: boolean;
  onClose: () => void;
  profile?: ProfileData;
  contact?: ProfileData;
  url?: string;
}

type WriteMode = 'profile' | 'contact' | 'url';

export default function NFCWriter({ isVisible, onClose, profile, contact, url }: NFCWriterProps) {
  const colors = useTheme();
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [writeMode, setWriteMode] = useState<WriteMode>('profile');
  const [writeSuccess, setWriteSuccess] = useState(false);

  useEffect(() => {
    if (isVisible) {
      checkNFCStatus();
    }
  }, [isVisible]);

  useEffect(() => {
    // Set default write mode based on available data
    if (profile) {
      setWriteMode('profile');
    } else if (contact) {
      setWriteMode('contact');
    } else if (url) {
      setWriteMode('url');
    }
  }, [profile, contact, url]);

  const checkNFCStatus = async () => {
    const supported = isNFCSupported();
    setNfcSupported(supported);
    
    if (supported) {
      const enabled = await isNFCEnabled();
      setNfcEnabled(enabled);
      
      if (enabled) {
        await initNFC();
      }
    }
  };

  const handleWrite = async () => {
    if (!nfcSupported || !nfcEnabled) {
      Alert.alert('NFC Not Available', 'Please enable NFC on your device to write tags.');
      return;
    }

    setIsWriting(true);
    setWriteSuccess(false);

    try {
      let success = false;

      switch (writeMode) {
        case 'profile':
          if (profile) {
            success = await writeProfileToNFC(profile);
          }
          break;
        case 'contact':
          if (contact) {
            success = await writeContactToNFC(contact);
          }
          break;
        case 'url':
          if (url) {
            success = await writeURLToNFC(url);
          }
          break;
      }

      if (success) {
        setWriteSuccess(true);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        Alert.alert('Write Failed', 'Failed to write to NFC tag. Please try again.');
      }
    } catch (error) {
      console.error('NFC write error:', error);
      Alert.alert('Write Error', 'An error occurred while writing to the NFC tag.');
    } finally {
      setIsWriting(false);
    }
  };

  const getWriteModeData = () => {
    switch (writeMode) {
      case 'profile':
        return profile ? { title: 'Write Profile', data: profile.name } : null;
      case 'contact':
        return contact ? { title: 'Write Contact', data: contact.name } : null;
      case 'url':
        return url ? { title: 'Write URL', data: url } : null;
      default:
        return null;
    }
  };

  const getAvailableModes = () => {
    const modes: { mode: WriteMode; label: string; icon: React.ReactNode; available: boolean }[] = [
      {
        mode: 'profile',
        label: 'Profile',
        icon: <MaterialCommunityIcons name="account-outline" size={20} color={colors.text} />,
        available: !!profile
      },
      {
        mode: 'contact',
        label: 'Contact',
        icon: <MaterialCommunityIcons name="cellphone" size={20} color={colors.text} />,
        available: !!contact
      },
      {
        mode: 'url',
        label: 'URL',
        icon: <MaterialCommunityIcons name="link-variant" size={20} color={colors.text} />,
        available: !!url
      }
    ];

    return modes.filter(mode => mode.available);
  };

  if (!isVisible) return null;

  const modeData = getWriteModeData();
  const availableModes = getAvailableModes();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Write NFC Tag</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!nfcSupported ? (
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name="nfc-variant" size={48} color={colors.error} />
            <Text style={[styles.statusText, { color: colors.text }]}>
              NFC is not supported on this device
            </Text>
          </View>
        ) : !nfcEnabled ? (
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name="nfc-variant" size={48} color={colors.warning} />
            <Text style={[styles.statusText, { color: colors.text }]}>
              Please enable NFC on your device
            </Text>
            <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
              Go to Settings → Connected devices → Connection preferences → NFC
            </Text>
          </View>
        ) : (
          <>
            {availableModes.length > 1 && (
              <View style={styles.modeSelector}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Data Type</Text>
                <View style={styles.modeButtons}>
                  {availableModes.map((mode) => (
                    <TouchableOpacity
                      key={mode.mode}
                      style={[
                        styles.modeButton,
                        writeMode === mode.mode && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => setWriteMode(mode.mode)}
                    >
                      {mode.icon}
                      <Text style={[
                        styles.modeButtonText,
                        { color: writeMode === mode.mode ? '#FFFFFF' : colors.text }
                      ]}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {modeData && (
              <View style={styles.dataPreview}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {modeData.title}
                </Text>
                <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.previewText, { color: colors.text }]} numberOfLines={2}>
                    {modeData.data}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.instructions}>
              <Text style={[styles.instructionTitle, { color: colors.text }]}>
                How to write NFC tag:
              </Text>
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                1. Tap the "Write NFC Tag" button below{'\n'}
                2. Hold your phone near an NFC tag{'\n'}
                3. Keep it there until you see "Success"{'\n'}
                4. The tag is now ready to use
              </Text>
            </View>

            {writeSuccess ? (
              <View style={styles.successContainer}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={colors.success} />
                <Text style={[styles.successText, { color: colors.text }]}>
                  NFC Tag Written Successfully!
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.writeButton,
                  { backgroundColor: colors.primary },
                  isWriting && { opacity: 0.6 }
                ]}
                onPress={handleWrite}
                disabled={isWriting}
              >
                <MaterialCommunityIcons name="nfc-variant" size={20} color="#FFFFFF" />
                <Text style={styles.writeButtonText}>
                  {isWriting ? 'Writing...' : 'Write NFC Tag'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    width: '100%',
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
  },
  statusSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  modeSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dataPreview: {
    marginBottom: 24,
  },
  previewCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
  },
  instructions: {
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
});
