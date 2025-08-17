import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Animated } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { Camera, RotateCcw, Upload, Zap, Image as ImageIcon, X, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type ScanMode = 'paper' | 'badge' | 'qr';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('paper');
  const [flashEnabled, setFlashEnabled] = useState(false);
  
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    router.push({
      pathname: '/scan/result',
      params: { 
        data,
        scanMode 
      }
    });
  };
  
  const toggleFlash = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFlashEnabled(!flashEnabled);
  };
  
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      router.push({
        pathname: '/scan/result',
        params: { 
          data: imageUri,
          scanMode 
        }
      });
    }
  };
  
  const handleCapture = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    setScanned(true);
    setTimeout(() => {
      let mockData: string;
      
      if (scanMode === 'paper') {
        // Simulate business card image capture
        mockData = 'mock_business_card_image.jpg';
      } else if (scanMode === 'badge') {
        // Simulate event badge image capture
        mockData = 'mock_event_badge_image.jpg';
      } else {
        // For QR mode, use test QR codes
        mockData = getTestQRCodes();
      }
        
      router.push({
        pathname: '/scan/result',
        params: { 
          data: mockData,
          scanMode 
        }
      });
    }, 500);
  };
  
  const getInstructionText = () => {
    switch (scanMode) {
      case 'paper':
        return 'Point camera at business card and tap Capture';
      case 'badge':
        return 'Frame the entire badge and tap Capture';
      case 'qr':
        return 'Point camera at QR code to scan automatically';
      default:
        return '';
    }
  };
  
  const getTestQRCodes = () => {
    const testCodes = [
      'https://digitalcard.app/profile/john-doe',
      'https://linkedin.com/in/johndoe',
      'https://twitter.com/johndoe',
      'BEGIN:VCARD\nVERSION:3.0\nFN:John Smith\nORG:Tech Corp\nTITLE:Software Engineer\nEMAIL:john.smith@techcorp.com\nTEL:+1-555-123-4567\nURL:https://linkedin.com/in/johnsmith\nEND:VCARD',
      'https://github.com/johndoe',
      'https://instagram.com/johndoe'
    ];
    return testCodes[Math.floor(Math.random() * testCodes.length)];
  };
  
  const renderMatrixEffect = () => {
    if (scanMode !== 'paper') return null;
    
    return (
      <View style={styles.matrixContainer}>
        {Array.from({ length: 25 }).map((_, i) => (
          <View key={i} style={[styles.matrixColumn, { left: `${i * 4}%` }]}>
            {Array.from({ length: 40 }).map((_, j) => (
              <Text 
                key={j} 
                style={[
                  styles.matrixChar,
                  { 
                    opacity: Math.random() * 0.8 + 0.2,
                    fontSize: Math.random() * 8 + 10,
                    color: Math.random() > 0.7 ? '#00FF41' : '#008F11'
                  }
                ]}
              >
                {Math.random() > 0.5 ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : Math.floor(Math.random() * 10)}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  };
  
  const renderScanOverlay = () => {
    switch (scanMode) {
      case 'paper':
        return (
          <View style={styles.paperOverlay}>
            <View style={styles.paperFrame} />
          </View>
        );
      case 'badge':
        return (
          <View style={styles.badgeOverlay}>
            <View style={styles.badgeFrame}>
              <View style={styles.badgeHeader}>
                <View style={styles.badgePhoto} />
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>Full Name</Text>
                  <Text style={styles.badgeCompany}>Company Name</Text>
                </View>
              </View>
              <View style={styles.badgeDetails}>
                <Text style={styles.badgeDetailText}>Name/Title: Name and a company</Text>
                <Text style={styles.badgeDetailText}>Company: Company</Text>
                <Text style={styles.badgeDetailText}>ATTENDEE</Text>
              </View>
            </View>
          </View>
        );
      case 'qr':
        return (
          <View style={styles.qrOverlay}>
            <View style={styles.qrFrame}>
              <View style={[styles.qrCorner, styles.qrTopLeft]} />
              <View style={[styles.qrCorner, styles.qrTopRight]} />
              <View style={[styles.qrCorner, styles.qrBottomLeft]} />
              <View style={[styles.qrCorner, styles.qrBottomRight]} />
              <View style={styles.qrCode}>
                <View style={styles.qrPattern} />
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };
  
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={64} color={colors.primary} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan QR codes and business cards.
        </Text>
        <Button 
          title="Grant Permission" 
          onPress={requestPermission} 
          variant="gradient"
          style={styles.permissionButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanMode === 'qr' && !scanned ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/(tabs)')}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>{getInstructionText()}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.findAIButton}
              onPress={() => {
                // Quick test with different scan types
                const testData = scanMode === 'qr' ? getTestQRCodes() : `mock_${scanMode}_image.jpg`;
                router.push({
                  pathname: '/scan/result',
                  params: { data: testData, scanMode }
                });
              }}
            >
              <Sparkles size={20} color="#4A90E2" />
              <Text style={styles.findAIText}>
                {scanMode === 'paper' ? 'AI OCR' : scanMode === 'badge' ? 'AI Extract' : 'Test Scan'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Matrix Effect for Paper Card Mode */}
          {renderMatrixEffect()}
          
          {/* Scan Overlay */}
          {renderScanOverlay()}
          
          {/* Bottom Controls */}
          <View style={styles.bottomContainer}>
            {/* Mode Tabs */}
            <View style={styles.modeTabsContainer}>
              <TouchableOpacity
                style={[styles.modeTab, scanMode === 'paper' && styles.activeModeTab]}
                onPress={() => setScanMode('paper')}
              >
                <View style={styles.modeTabIcon}>
                  <View style={styles.cardIcon} />
                </View>
                <Text style={[styles.modeTabText, scanMode === 'paper' && styles.activeModeTabText]}>
                  Paper Card
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modeTab, scanMode === 'badge' && styles.activeModeTab]}
                onPress={() => setScanMode('badge')}
              >
                <View style={styles.modeTabIcon}>
                  <View style={styles.badgeIcon} />
                </View>
                <Text style={[styles.modeTabText, scanMode === 'badge' && styles.activeModeTabText]}>
                  Event Badge
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modeTab, scanMode === 'qr' && styles.activeModeTab]}
                onPress={() => setScanMode('qr')}
              >
                <View style={styles.modeTabIcon}>
                  <View style={styles.qrIcon} />
                </View>
                <Text style={[styles.modeTabText, scanMode === 'qr' && styles.activeModeTabText]}>
                  QR Code
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Control Buttons */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={pickImage}
              >
                <ImageIcon size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={handleCapture}
              >
                <View style={styles.captureButtonInner}>
                  <Camera size={28} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={toggleFlash}
              >
                <Zap size={24} color={flashEnabled ? '#FFD700' : '#FFFFFF'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
      
      {scanned && (
        <Button
          title="Tap to Scan Again"
          onPress={() => setScanned(false)}
          variant="gradient"
          style={styles.scanAgainButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  findAIButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  findAIText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '500',
  },
  matrixContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 200,
    overflow: 'hidden',
  },
  matrixColumn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 20,
  },
  matrixChar: {
    color: '#00FF41',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 14,
  },
  paperOverlay: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  badgeOverlay: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    right: '15%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgePhoto: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  badgeCompany: {
    fontSize: 14,
    color: '#666',
  },
  badgeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeDetailText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  qrOverlay: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    right: '20%',
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00FF41',
    borderWidth: 3,
  },
  qrTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  qrTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  qrBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  qrBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  qrCode: {
    width: '70%',
    height: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPattern: {
    width: '80%',
    height: '80%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
  },
  modeTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  modeTab: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    minWidth: 80,
  },
  activeModeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeTabIcon: {
    marginBottom: 4,
  },
  cardIcon: {
    width: 20,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  badgeIcon: {
    width: 20,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  qrIcon: {
    width: 18,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  modeTabText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeModeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  captureButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    minWidth: 200,
  },
});