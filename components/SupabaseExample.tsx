import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useContactsStore } from '@/store/contactsStore';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';

export function SupabaseExample() {
  const { isAuthenticated } = useSupabaseSync();
  
  // Auth store
  const { user, signIn, signOut, signUp, error: authError, isLoading: authLoading } = useAuthStore();
  
  // Profile store
  const { 
    profiles, 
    addProfile, 
    updateProfile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useProfileStore();
  
  // Contacts store
  const { 
    contacts, 
    addContact, 
    isLoading: contactsLoading, 
    error: contactsError 
  } = useContactsStore();

  const handleSignUp = async () => {
    try {
      await signUp('test@example.com', 'password123', {
        name: 'Test User',
        username: 'testuser'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up');
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn('test@example.com', 'password123');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in');
    }
  };

  const handleAddProfile = async () => {
    if (!isAuthenticated) return;
    
    try {
      await addProfile({
        name: 'John Doe',
        bio: 'Software Developer',
        contactInfo: {
          email: 'john@example.com',
          phone: '+1234567890',
        },
        socialLinks: [
          {
            id: '1',
            platform: 'linkedin',
            url: 'https://linkedin.com/in/johndoe',
            username: 'johndoe'
          }
        ],
        cardColor: '#4A6FFF'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add profile');
    }
  };

  if (authLoading || profileLoading || contactsLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Integration Example</Text>
      
      {authError && <Text style={styles.error}>Auth Error: {authError}</Text>}
      {profileError && <Text style={styles.error}>Profile Error: {profileError}</Text>}
      {contactsError && <Text style={styles.error}>Contacts Error: {contactsError}</Text>}
      
      {!isAuthenticated ? (
        <View style={styles.authSection}>
          <Text style={styles.text}>Not authenticated</Text>
          <Button title="Sign Up" onPress={handleSignUp} />
          <Button title="Sign In" onPress={handleSignIn} />
        </View>
      ) : (
        <View style={styles.dataSection}>
          <Text style={styles.text}>Welcome, {user?.email}!</Text>
          <Text style={styles.text}>Profiles: {profiles.length}</Text>
          <Text style={styles.text}>Contacts: {contacts.length}</Text>
          
          <Button title="Add Profile" onPress={handleAddProfile} />
          <Button title="Sign Out" onPress={signOut} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: '#ff4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  authSection: {
    gap: 10,
  },
  dataSection: {
    gap: 10,
  },
});