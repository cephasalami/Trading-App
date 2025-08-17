import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { 
  UserPlus, 
  Zap, 
  HelpCircle, 
  Crown, 
  User, 
  Mail, 
  EyeOff, 
  Smartphone, 
  Link, 
  Edit, 
  Shield, 
  LogOut 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { profiles } = useProfileStore();
  const { signOut } = useAuthStore();
  const { 
    settings, 
    isLoading, 
    error, 
    isInitialized,
    updateSetting, 
    loadSettings, 
    clearError 
  } = useSettingsStore();
  
  // Load settings on mount
  useEffect(() => {
    if (!isInitialized) {
      loadSettings();
    }
  }, [isInitialized, loadSettings]);
  
  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        clearError();
      }
    };
  }, [error, clearError]);
  
  const handleInvite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Invite Friends', 'Share Tapping with your network and earn rewards!');
  };
  
  const handleActivateDevice = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert('Activate Tapping Device', 'Tap the button below to begin activation.');
  };
  
  const handleHelpSupport = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Help & Support', 'Access FAQ, contact support, or provide feedback.');
  };
  
  const handleGoPremium = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert('Go Premium', 'Unlock advanced features with Tapping Premium!');
  };
  
  const handleCompleteProfile = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/profile/create');
  };
  
  const handleEditAccount = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Edit Account', 'Manage your account settings and preferences.');
  };
  
  const handleSecurity = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Security', 'Manage your password and security settings.');
  };
  
  const handleSignOut = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/onboarding');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const handlePremiumFeature = (featureName: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Premium Feature', `${featureName} is available with Tapping Premium.`);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleInvite}
          >
            <View style={styles.settingIcon}>
              <UserPlus size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Invite</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleActivateDevice}
          >
            <View style={styles.settingIcon}>
              <Zap size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Activate a Tapping Device</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleHelpSupport}
          >
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleCompleteProfile}
          >
            <View style={styles.settingIcon}>
              <User size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Complete Your Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            <Crown size={20} color="#FFD700" />
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.premiumItem]}
            onPress={handleGoPremium}
          >
            <View style={styles.settingIcon}>
              <Crown size={20} color="#FFD700" />
            </View>
            <Text style={[styles.settingText, styles.premiumText]}>Go Premium</Text>
            <Text style={styles.premiumPrice}>€4.99/month</Text>
          </TouchableOpacity>
          
          <View style={[styles.settingItem, styles.premiumItem]}>
            <View style={styles.settingIcon}>
              <Mail size={20} color="#FFD700" />
            </View>
            <Text style={[styles.settingText, styles.premiumText]}>Follow Up Email</Text>
            <Switch
              value={settings.follow_up_email}
              onValueChange={(value) => {
                if (value) {
                  handlePremiumFeature('Follow Up Email');
                } else {
                  updateSetting('follow_up_email', value);
                }
              }}
              trackColor={{ false: '#2C2C2C', true: '#FFD700' }}
              thumbColor={settings.follow_up_email ? '#FFFFFF' : '#CCCCCC'}
              disabled={isLoading}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.premiumItem]}
            onPress={() => handlePremiumFeature('Remove Branding')}
          >
            <View style={styles.settingIcon}>
              <EyeOff size={20} color="#FFD700" />
            </View>
            <Text style={[styles.settingText, styles.premiumText]}>Remove Branding</Text>
            <Crown size={16} color="#FFD700" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.premiumItem]}
            onPress={() => handlePremiumFeature('Direct Link')}
          >
            <View style={styles.settingIcon}>
              <Link size={20} color="#FFD700" />
            </View>
            <Text style={[styles.settingText, styles.premiumText]}>Direct Link</Text>
            <Crown size={16} color="#FFD700" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Widget Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Smartphone size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Lockscreen Widget</Text>
            <Switch
              value={settings.lockscreen_widget}
              onValueChange={(value) => updateSetting('lockscreen_widget', value)}
              trackColor={{ false: '#2C2C2C', true: colors.primary }}
              thumbColor={settings.lockscreen_widget ? '#FFFFFF' : '#CCCCCC'}
              disabled={isLoading}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleEditAccount}
          >
            <View style={styles.settingIcon}>
              <Edit size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Edit Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleSecurity}
          >
            <View style={styles.settingIcon}>
              <Shield size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Security</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.signOutItem]}
            onPress={handleSignOut}
          >
            <View style={styles.settingIcon}>
              <LogOut size={20} color={colors.error} />
            </View>
            <Text style={[styles.settingText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  premiumItem: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  signOutItem: {
    borderColor: colors.error,
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(44, 44, 44, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  premiumText: {
    color: '#FFD700',
  },
  signOutText: {
    color: colors.error,
  },
  premiumPrice: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600' as const,
  },
});