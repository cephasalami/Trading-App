import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { 
  initNFC, 
  isNFCSupported, 
  isNFCEnabled, 
  readNFCTag,
  parseNFCData,
  cleanupNFC 
} from '@/lib/nfc';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

interface NFCScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onDataScanned: (data: any, type: string) => void;
}

export default function NFCScanner({ isVisible, onClose, onDataScanned }: NFCScannerProps) {
  const colors = useTheme();
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  useEffect(() => {
    if (isVisible) {
      checkNFCStatus();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      cleanupNFC();
    };
  }, []);

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

  const startScanning = async () => {
    if (!nfcSupported || !nfcEnabled) {
      Alert.alert('NFC Not Available', 'Please enable NFC on your device to scan tags.');
      return;
    }

    setIsScanning(true);
    setScannedData(null);
    setScanSuccess(false);

    try {
      const data = await readNFCTag();
      
      if (data) {
        const parsed = parseNFCData(data);
        setScannedData(parsed);
        setScanSuccess(true);
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Auto-close after success
        setTimeout(() => {
          if (parsed) {
            onDataScanned(parsed.content, parsed.type);
          }
          onClose();
        }, 2000);
      } else {
        Alert.alert('No Data Found', 'The NFC tag doesn\'t contain readable data.');
      }
    } catch (error) {
      console.error('NFC scan error:', error);
      Alert.alert('Scan Error', 'An error occurred while scanning the NFC tag.');
    } finally {
      setIsScanning(false);
    }
  };

  const getDataIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return <MaterialCommunityIcons name="account-outline" size={24} color={colors.primary} />;
      case 'contact':
        return <MaterialCommunityIcons name="cellphone" size={24} color={colors.primary} />;
      case 'url':
        return <MaterialCommunityIcons name="link-variant" size={24} color={colors.primary} />;
      default:
        return <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.primary} />;
    }
  };

  const getDataTypeLabel = (type: string) => {
    switch (type) {
      case 'profile':
        return 'Profile Data';
      case 'contact':
        return 'Contact Information';
      case 'url':
        return 'URL Link';
      case 'text':
        return 'Text Data';
      default:
        return 'Unknown Data';
    }
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Scan NFC Tag</Text>
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
            {!scanSuccess ? (
              <>
                <View style={styles.scanInstructions}>
                  <MaterialCommunityIcons name="nfc-variant" size={64} color={colors.primary} />
                  <Text style={[styles.instructionTitle, { color: colors.text }]}>
                    Ready to Scan NFC Tag
                  </Text>
                  <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                    Tap the "Start Scanning" button below, then hold your phone near an NFC tag
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.scanButton,
                    { backgroundColor: colors.primary },
                    isScanning && { opacity: 0.6 }
                  ]}
                  onPress={startScanning}
                  disabled={isScanning}
                >
                  <MaterialCommunityIcons name="nfc-variant" size={20} color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'Scanning...' : 'Start Scanning'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.successContainer}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={colors.success} />
                <Text style={[styles.successText, { color: colors.text }]}>
                  NFC Tag Scanned Successfully!
                </Text>
                
                {scannedData && (
                  <View style={[styles.dataPreview, { backgroundColor: colors.surface }]}>
                    <View style={styles.dataHeader}>
                      {getDataIcon(scannedData.type)}
                      <Text style={[styles.dataTypeLabel, { color: colors.text }]}>
                        {getDataTypeLabel(scannedData.type)}
                      </Text>
                    </View>
                    <View style={styles.dataContent}>
                      <Text style={[styles.dataContentText, { color: colors.textSecondary }]}>
                        {typeof scannedData.content === 'string' 
                          ? scannedData.content 
                          : JSON.stringify(scannedData.content, null, 2)
                        }
                      </Text>
                    </View>
                  </View>
                )}
              </View>
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
    justifyContent: 'center',
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
  scanInstructions: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  dataPreview: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dataTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dataContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 6,
  },
  dataContentText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
