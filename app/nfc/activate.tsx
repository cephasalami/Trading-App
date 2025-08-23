import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { writeProfileToNFC } from '@/lib/nfc';
import { useProfileStore } from '@/store/profileStore';
import { useRouter } from 'expo-router';
import {v4 as uuidv4} from 'uuid';

export default function ActivateNFCScreen() {
  const [isActivating, setIsActivating] = useState(false);
  const { profiles } = useProfileStore();
  const router = useRouter();

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      // For now, we'll just use the first profile.
      // In a real app, you would let the user choose a profile.
      const profile = profiles[0];
      if (!profile) {
        Alert.alert('Error', 'You must have at least one profile to activate an NFC tag.');
        return;
      }

      const success = await writeProfileToNFC(profile);

      if (success) {
        Alert.alert('Success', 'NFC tag activated successfully.');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to activate NFC tag.');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activate New NFC Tag</Text>
      <Text style={styles.instructions}>
        Tap the button below and then hold your phone near the NFC tag to activate it.
      </Text>
      <Button
        title={isActivating ? 'Activating...' : 'Start Activation'}
        onPress={handleActivate}
        disabled={isActivating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
});
