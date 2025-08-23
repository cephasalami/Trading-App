import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleNFCDemo = () => {
    router.push('/(tabs)/scan');
  };

  const handleNFCManager = () => {
    router.push('/nfc/manager');
  };

  const handleNFCStats = () => {
    router.push('/nfc/analytics');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="cog-outline" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customize your app experience
        </Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={() => router.push('/profile/settings')}>
          <MaterialCommunityIcons name="account-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Profile Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="shield-outline" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Privacy & Security</Text>
        </TouchableOpacity>
      </View>

      {/* NFC Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>NFC</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleNFCManager}
        >
          <MaterialCommunityIcons name="nfc-variant" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>NFC Manager</Text>
          <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
            Manage your NFC tags and view analytics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleNFCStats}
        >
          <MaterialCommunityIcons name="chart-bar" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>NFC Analytics</Text>
          <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
            View detailed NFC usage statistics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleNFCDemo}
        >
          <MaterialCommunityIcons name="cellphone" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>NFC Demo & Testing</Text>
          <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
            Test NFC reading and writing capabilities
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App</Text>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="bell-outline" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="palette-outline" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Appearance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={() => router.push('/legal/privacy')}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={() => router.push('/legal/terms')}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="help-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <TouchableOpacity 
        style={[styles.signOutButton, { backgroundColor: colors.error + '20' }]}
        onPress={handleSignOut}
      >
        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
        <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  settingSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
