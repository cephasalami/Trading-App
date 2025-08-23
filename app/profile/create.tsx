import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import ColorPicker from '@/components/ColorPicker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function CreateProfileScreen() {
  const router = useRouter();
  const { addProfile } = useProfileStore();
  
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const [cardColor, setCardColor] = useState(colors.cardColors[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [socialLinks, setSocialLinks] = useState<Array<{ id: string; platform: string; url: string }>>([]);
  
  const handleAddSocialLink = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSocialLinks([
      ...socialLinks,
      { id: Date.now().toString(), platform: 'linkedin', url: '' }
    ]);
  };
  
  const handleRemoveSocialLink = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };
  
  const handleUpdateSocialLink = (id: string, field: 'platform' | 'url', value: string) => {
    setSocialLinks(socialLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };
  
  const pickImage = async (type: 'avatar' | 'cover') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (type === 'avatar') {
        setAvatar(result.assets[0].uri);
      } else {
        setCoverImage(result.assets[0].uri);
      }
    }
  };
  
  const handleSave = async () => {
    if (!name.trim()) {
      // Show error - name is required
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      await addProfile({
        name,
        headline,
        bio,
        avatar,
        coverImage,
        cardColor,
        contactInfo: {
          email,
          phone,
          company,
          position,
        },
        socialLinks: socialLinks.map(link => ({
          ...link,
          platform: link.platform as any,
        })),
      });
      
      router.replace('/(tabs)/cards');
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', error.message || 'Failed to create profile');
    }
  };
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.title}>Create Your Digital Card</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Image</Text>
        <View style={styles.imageSelectors}>
          <TouchableOpacity 
            style={styles.avatarSelector}
            onPress={() => pickImage('avatar')}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="camera-outline" size={24} color={colors.primary} />
              </View>
            )}
            <Text style={styles.imageLabel}>Profile Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.coverSelector}
            onPress={() => pickImage('cover')}
          >
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <MaterialCommunityIcons name="camera-outline" size={24} color={colors.primary} />
              </View>
            )}
            <Text style={styles.imageLabel}>Cover Image</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Color</Text>
        <ColorPicker 
          selectedColor={cardColor}
          onSelectColor={setCardColor}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={colors.mediumGray}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Headline</Text>
          <TextInput
            style={styles.input}
            value={headline}
            onChangeText={setHeadline}
            placeholder="Product Manager | Tech Enthusiast"
            placeholderTextColor={colors.mediumGray}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself..."
            placeholderTextColor={colors.mediumGray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit={true}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            placeholderTextColor={colors.mediumGray}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            blurOnSubmit={false}
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
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company</Text>
          <TextInput
            style={styles.input}
            value={company}
            onChangeText={setCompany}
            placeholder="Acme Inc."
            placeholderTextColor={colors.mediumGray}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Position</Text>
          <TextInput
            style={styles.input}
            value={position}
            onChangeText={setPosition}
            placeholder="Product Manager"
            placeholderTextColor={colors.mediumGray}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          <TouchableOpacity onPress={handleAddSocialLink}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {socialLinks.map((link, index) => (
          <View key={link.id} style={styles.socialLinkContainer}>
            <View style={styles.socialLinkInputs}>
              <TextInput
                style={[styles.input, styles.platformInput]}
                value={link.platform}
                onChangeText={(value) => handleUpdateSocialLink(link.id, 'platform', value)}
                placeholder="Platform"
                placeholderTextColor={colors.mediumGray}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              
              <TextInput
                style={[styles.input, styles.urlInput]}
                value={link.url}
                onChangeText={(value) => handleUpdateSocialLink(link.id, 'url', value)}
                placeholder="URL"
                placeholderTextColor={colors.mediumGray}
                autoCapitalize="none"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveSocialLink(link.id)}
            >
              <MaterialCommunityIcons name="close" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        
        {socialLinks.length === 0 && (
          <TouchableOpacity 
            style={styles.addSocialButton}
            onPress={handleAddSocialLink}
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
            <Text style={styles.addSocialText}>Add Social Link</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Button
        title="Create Digital Card"
        onPress={handleSave}
        variant="gradient"
        style={styles.saveButton}
      />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  imageSelectors: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarSelector: {
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  coverSelector: {
    alignItems: 'center',
  },
  coverPlaceholder: {
    width: 160,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  coverImage: {
    width: 160,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 14,
    color: colors.textSecondary,
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
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  socialLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialLinkInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  platformInput: {
    flex: 1,
  },
  urlInput: {
    flex: 2,
  },
  removeButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSocialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  addSocialText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 16,
  },
});