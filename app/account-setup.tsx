import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import Button from '@/components/Button';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { isValidEmail } from '@/lib/utils';
import { createUserRecord } from '@/lib/user';

const steps = [
  { id: 'account', title: 'Create Account' },
  { id: 'name', title: 'Name' },
  { id: 'bio', title: 'Bio' },
  { id: 'photo', title: 'Profile picture' },
  { id: 'details', title: 'Profile/card setup' },
  { id: 'links', title: 'Add first link' },
];

export default function AccountSetupScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { signUp, isLoading, error, clearError, user } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [headline, setHeadline] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [socialLinks, setSocialLinks] = useState<Array<{ id: string; platform: string; url: string }>>([
    { id: Date.now().toString(), platform: 'linkedin', url: '' }
  ]);
  
  const handleUpdateSocialLink = (id: string, field: 'platform' | 'url', value: string) => {
    setSocialLinks(socialLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };
  
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };
  
  const handleNext = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    clearError();
    
    if (currentStep === 0) {
      if (!email.trim() || !password.trim() || !confirmPassword.trim() || !username.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      if (!isValidEmail(email.trim())) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
    } else if (currentStep === 1 && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };
  
  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.replace('/login');
    }
  };
  
  const handleComplete = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    try {
      // First, create the Supabase Auth account
      await signUp(email.trim(), password);
      
      // Wait a moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the current user from the store
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser) {
        const userData = {
          name: name.trim(),
          username: username.trim(),
          bio: bio.trim() || undefined,
          avatar: avatar || undefined,
          headline: headline.trim() || undefined,
          company: company.trim() || undefined,
          position: position.trim() || undefined,
          phone: phone.trim() || undefined,
          socialLinks: socialLinks.filter(link => link.url.trim()),
        };

        // Create the user record in the database
        await createUserRecord(currentUser, userData);
        
        // Navigate to email verification
        router.replace(`/email-verification?email=${encodeURIComponent(email.trim())}`);
      } else {
        throw new Error('User not found after signup');
      }
    } catch (err: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      console.error('Account creation error:', err);
      Alert.alert('Account Creation Failed', err.message || 'An error occurred during account creation');
    }
  };
  
  const renderStepContent = () => {
    const step = steps[currentStep];
    
    const styles = StyleSheet.create({
        stepContent: {
            flex: 1,
        },
        stepTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 16,
        },
        stepDescription: {
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 24,
        },
        input: {
            backgroundColor: colors.lightGray,
            borderRadius: 8,
            padding: 16,
            fontSize: 16,
            color: colors.text,
            marginBottom: 16,
        },
        textArea: {
            minHeight: 120,
        },
        photoSelector: {
            alignItems: 'center',
            marginVertical: 24,
        },
        avatarPlaceholder: {
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: colors.lightGray,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarImage: {
            width: 150,
            height: 150,
            borderRadius: 75,
        },
        photoHelp: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 8,
        },
        inputGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 8,
        },
        socialLinkContainer: {
            marginBottom: 16,
        },
        socialLinkInputs: {
            flexDirection: 'row',
            gap: 12,
        },
        platformInput: {
            flex: 1,
            marginBottom: 0,
        },
        urlInput: {
            flex: 2,
            marginBottom: 0,
        },
    });

    switch (step.id) {
      case 'account':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Create your account</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a unique username"
                placeholderTextColor={colors.mediumGray}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a secure password"
                placeholderTextColor={colors.mediumGray}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor={colors.mediumGray}
                secureTextEntry
              />
            </View>
          </View>
        );
        
      case 'name':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.mediumGray}
              autoFocus
            />
          </View>
        );
        
      case 'bio':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tell us about yourself</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Write a short bio..."
              placeholderTextColor={colors.mediumGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
          </View>
        );
        
      case 'photo':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add a profile picture</Text>
            <TouchableOpacity 
              style={styles.photoSelector}
              onPress={pickImage}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="camera-outline" size={32} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoHelp}>Tap to select an image</Text>
          </View>
        );
        
      case 'details':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Professional details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Headline</Text>
              <TextInput
                style={styles.input}
                value={headline}
                onChangeText={setHeadline}
                placeholder="e.g. Product Manager | Tech Enthusiast"
                placeholderTextColor={colors.mediumGray}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Where do you work?"
                placeholderTextColor={colors.mediumGray}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Position</Text>
              <TextInput
                style={styles.input}
                value={position}
                onChangeText={setPosition}
                placeholder="Your job title"
                placeholderTextColor={colors.mediumGray}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={colors.mediumGray}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        );
        
      case 'links':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add your first link</Text>
            <Text style={styles.stepDescription}>
              Add a social media profile or website to your digital card
            </Text>
            
            {socialLinks.map((link) => (
              <View key={link.id} style={styles.socialLinkContainer}>
                <View style={styles.socialLinkInputs}>
                  <TextInput
                    style={[styles.input, styles.platformInput]}
                    value={link.platform}
                    onChangeText={(value) => handleUpdateSocialLink(link.id, 'platform', value)}
                    placeholder="Platform"
                    placeholderTextColor={colors.mediumGray}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.urlInput]}
                    value={link.url}
                    onChangeText={(value) => handleUpdateSocialLink(link.id, 'url', value)}
                    placeholder="URL or username"
                    placeholderTextColor={colors.mediumGray}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}
          </View>
        );
        
      default:
        return null;
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepIndicator: {
      flexDirection: 'row',
      gap: 8,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.mediumGray,
    },
    activeStepDot: {
      width: 24,
      backgroundColor: colors.primary,
    },
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 24,
      paddingBottom: 100,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      width: '100%',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.stepIndicator}>
          {steps.map((step, index) => (
            <View 
              key={step.id}
              style={[
                styles.stepDot,
                index === currentStep && styles.activeStepDot
              ]}
            />
          ))}
        </View>
        
        <View style={styles.placeholder} />
      </View>
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>
      </TouchableWithoutFeedback>
      
      <View style={styles.footer}>
        <Button
          title={isLoading ? "Creating Account..." : (currentStep < steps.length - 1 ? "Continue" : "Complete Setup")}
          onPress={handleNext}
          variant="primary"
          icon={!isLoading ? <MaterialCommunityIcons name="chevron-right" size={20} color={colors.card} /> : undefined}
          iconPosition="right"
          style={styles.button}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
