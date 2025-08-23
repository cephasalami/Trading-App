import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useNFC } from '@/hooks/useNFC';
import { ProfileData } from '@/types/profile';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function NFCDemo() {
  const colors = useTheme();
  const { status, isReading, isWriting, readTag, writeProfile, writeContact, writeURL } = useNFC();
  const [lastReadData, setLastReadData] = useState<any>(null);
  const [lastWriteResult, setLastWriteResult] = useState<string>('');

  const handleReadTag = async () => {
    try {
      const data = await readTag();
      if (data) {
        setLastReadData(data);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Success', 'NFC tag read successfully!');
      } else {
        Alert.alert('No Data', 'No readable data found on the NFC tag.');
      }
    } catch (error) {
      console.error('Read error:', error);
      Alert.alert('Error', 'Failed to read NFC tag. Please try again.');
    }
  };

  const handleWriteProfile = async () => {
    const mockProfile: ProfileData = {
      id: 'demo-profile',
      name: 'John Doe',
      headline: 'Software Engineer',
      bio: 'Passionate developer with 5+ years of experience',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      coverImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=500',
      cardColor: '#4A6FFF',
      contactInfo: {
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        company: 'Tech Corp',
        position: 'Senior Developer',
        address: 'San Francisco, CA'
      },
      socialLinks: [
        {
          id: '1',
          platform: 'linkedin',
          url: 'https://linkedin.com/in/johndoe',
          username: 'johndoe'
        },
        {
          id: '2',
          platform: 'github',
          url: 'https://github.com/johndoe',
          username: 'johndoe'
        }
      ],
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const success = await writeProfile(mockProfile);
      if (success) {
        setLastWriteResult('Profile written successfully!');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Success', 'Profile written to NFC tag!');
      } else {
        setLastWriteResult('Failed to write profile');
        Alert.alert('Error', 'Failed to write profile to NFC tag.');
      }
    } catch (error) {
      console.error('Write error:', error);
      setLastWriteResult('Error writing profile');
      Alert.alert('Error', 'Failed to write profile to NFC tag. Please try again.');
    }
  };

  const handleWriteURL = async () => {
    try {
      const success = await writeURL('https://digitalcard.app/demo');
      if (success) {
        setLastWriteResult('URL written successfully!');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Success', 'URL written to NFC tag!');
      } else {
        setLastWriteResult('Failed to write URL');
        Alert.alert('Error', 'Failed to write URL to NFC tag.');
      }
    } catch (error) {
      console.error('Write error:', error);
      setLastWriteResult('Error writing URL');
      Alert.alert('Error', 'Failed to write URL to NFC tag. Please try again.');
    }
  };

  const getStatusIcon = () => {
    if (!status.supported) {
      return <MaterialCommunityIcons name="alert-circle-outline" size={24} color={colors.error} />;
    }
    if (!status.enabled) {
      return <MaterialCommunityIcons name="alert-circle-outline" size={24} color={colors.warning} />;
    }
    return <MaterialCommunityIcons name="check-circle-outline" size={24} color={colors.success} />;
  };

  const getStatusText = () => {
    if (!status.supported) {
      return 'NFC not supported on this device';
    }
    if (!status.enabled) {
      return 'NFC is disabled. Please enable it in settings.';
    }
    return 'NFC is ready to use';
  };

  const getStatusColor = () => {
    if (!status.supported) return colors.error;
    if (!status.enabled) return colors.warning;
    return colors.success;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="nfc-variant" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>NFC Demo</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Test NFC reading and writing capabilities
        </Text>
      </View>

      {/* NFC Status */}
      <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
        <View style={styles.statusHeader}>
          {getStatusIcon()}
          <Text style={[styles.statusTitle, { color: colors.text }]}>NFC Status</Text>
        </View>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        <View style={styles.statusDetails}>
          <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
            Supported: {status.supported ? 'Yes' : 'No'}
          </Text>
          <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
            Enabled: {status.enabled ? 'Yes' : 'No'}
          </Text>
          <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
            Initialized: {status.initialized ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      {/* NFC Actions */}
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>NFC Actions</Text>
        
        {/* Read NFC Tag */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary },
            isReading && { opacity: 0.6 }
          ]}
          onPress={handleReadTag}
          disabled={isReading || !status.enabled}
        >
          <MaterialCommunityIcons name="nfc-variant" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>
            {isReading ? 'Reading...' : 'Read NFC Tag'}
          </Text>
        </TouchableOpacity>

        {/* Write Profile */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.secondary },
            isWriting && { opacity: 0.6 }
          ]}
          onPress={handleWriteProfile}
          disabled={isWriting || !status.enabled}
        >
          <MaterialCommunityIcons name="account-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>
            {isWriting ? 'Writing...' : 'Write Profile to NFC'}
          </Text>
        </TouchableOpacity>

        {/* Write URL */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.info },
            isWriting && { opacity: 0.6 }
          ]}
          onPress={handleWriteURL}
          disabled={isWriting || !status.enabled}
        >
          <MaterialCommunityIcons name="link-variant" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>
            {isWriting ? 'Writing...' : 'Write URL to NFC'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {lastReadData && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Last Read Data</Text>
          <View style={styles.dataPreview}>
            <View style={styles.dataHeader}>
              {lastReadData.type === 'profile' && <MaterialCommunityIcons name="account-outline" size={20} color={colors.primary} />}
              {lastReadData.type === 'contact' && <MaterialCommunityIcons name="cellphone" size={20} color={colors.primary} />}
              {lastReadData.type === 'url' && <MaterialCommunityIcons name="link-variant" size={20} color={colors.primary} />}
              {lastReadData.type === 'text' && <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />}
              <Text style={[styles.dataType, { color: colors.text }]}>
                {lastReadData.type.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.dataContent, { color: colors.textSecondary }]}>
              {typeof lastReadData.content === 'string' 
                ? lastReadData.content 
                : JSON.stringify(lastReadData.content, null, 2)
              }
            </Text>
          </View>
        </View>
      )}

      {lastWriteResult && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Last Write Result</Text>
          <Text style={[styles.writeResult, { color: colors.textSecondary }]}>
            {lastWriteResult}
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.instructionsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.instructionsTitle, { color: colors.text }]}>How to Use</Text>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          • To read: Tap "Read NFC Tag" and hold your phone near an NFC tag{'\n'}
          • To write: Tap a write button and hold your phone near a writable NFC tag{'\n'}
          • Keep your phone close to the tag until the operation completes{'\n'}
          • Make sure NFC is enabled in your device settings
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 12,
  },
  statusDetails: {
    gap: 4,
  },
  statusDetail: {
    fontSize: 14,
  },
  actionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dataPreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dataType: {
    fontSize: 14,
    fontWeight: '600',
  },
  dataContent: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  writeResult: {
    fontSize: 14,
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
