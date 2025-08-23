import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import colors from '@/constants/colors';

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

export default function AddContactScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const addContactMutation = useMutation({
    mutationFn: addContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      router.back();
    },
  });

  const handleAddContact = () => {
    if (!name) {
      alert('Name is required');
      return;
    }

    addContactMutation.mutate({
      user_id: user?.id,
      name,
      email,
      phone,
      company,
      job_title: jobTitle,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Contact</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Company"
          value={company}
          onChangeText={setCompany}
        />
        <TextInput
          style={styles.input}
          placeholder="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
        />
      </View>

      <Button
        title="Add Contact"
        onPress={handleAddContact}
        variant="primary"
        loading={addContactMutation.isLoading}
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
