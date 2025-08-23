import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import colors from '@/constants/colors';

import { Alert } from 'react-native';

const updateProfile = async (profile: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', profile.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { profiles, setProfiles } = useProfileStore();
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const profile = profiles.find((p) => p.user_id === user.id);
      setCurrentProfile(profile);
    }
  }, [user, profiles]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      const updatedProfile = data?.[0];
      if (updatedProfile) {
        const newProfiles = profiles.map((p) =>
          p.id === updatedProfile.id ? updatedProfile : p
        );
        setProfiles(newProfiles);
      }
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      router.back();
    },
    onError: (error) => {
      Alert.alert('Error', (error as Error).message);
    },
  });

  const handleUpdateProfile = () => {
    if (!currentProfile) {
      return;
    }
    updateProfileMutation.mutate(currentProfile);
  };

  if (!currentProfile) {
    return <Text>Loading profile...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={currentProfile.name}
          onChangeText={(text) => setCurrentProfile({ ...currentProfile, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Bio"
          value={currentProfile.bio}
          onChangeText={(text) => setCurrentProfile({ ...currentProfile, bio: text })}
          multiline
        />
      </View>

      <Button
        title="Save Changes"
        onPress={handleUpdateProfile}
        variant="primary"
        loading={updateProfileMutation.isLoading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  form: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
});
