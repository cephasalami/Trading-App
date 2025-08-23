import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import {v4 as uuidv4} from 'uuid';

const addContact = async (contact: any) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([contact])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const addContactMutation = useMutation({
    mutationFn: addContact,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      const newContact = data?.[0];
      if (newContact) {
        router.push(`/contacts/${newContact.id}`);
      }
    },
    onError: (error: any) => {
        Alert.alert('Error', `Failed to add contact: ${error.message}`);
    }
  });

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    try {
      const parsedData = JSON.parse(data);
      Alert.alert(
        'Contact Scanned',
        `Name: ${parsedData.name}\nEmail: ${parsedData.email}`,
        [
          {
            text: 'Cancel',
            onPress: () => setScanned(false),
            style: 'cancel',
          },
          {
            text: 'Add Contact',
            onPress: () => {
              addContactMutation.mutate({
                id: uuidv4(),
                user_id: user?.id,
                ...parsedData,
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code data.');
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});