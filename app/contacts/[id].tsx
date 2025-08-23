import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ErrorState } from '@/components/EmptyState';

const fetchContact = async (contactId: string) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: contact, isLoading, error, refetch } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => fetchContact(id),
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      router.back();
    },
  });

  const handleDeleteContact = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteContactMutation.mutate(id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  if (!contact) {
    return (
      <View style={styles.centered}>
        <Text>Contact not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{contact.name}'s Details</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleDeleteContact}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{contact.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{contact.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{contact.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Company</Text>
          <Text style={styles.infoValue}>{contact.company}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Job Title</Text>
          <Text style={styles.infoValue}>{contact.job_title}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginTop: 24,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    minWidth: 120,
  },
});