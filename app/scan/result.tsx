import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { CheckCircle, XCircle, User, Globe, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { parseQRCodeData, generateContactId, processImageWithAI, createContactFromSocialProfile } from '@/lib/utils';
import { useContactsStore } from '@/store/contactsStore';
import { Contact } from '@/types/profile';

export default function ScanResultScreen() {
  const { data, scanMode } = useLocalSearchParams<{ data: string; scanMode?: string }>();
  const router = useRouter();
  const { addContact } = useContactsStore();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [contactData, setContactData] = useState<Contact | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('Analyzing scan...');
  
  useEffect(() => {
    processQRCode();
  }, [data]);

  const processQRCode = async () => {
    if (!data) {
      setError('No scan data received');
      setLoading(false);
      return;
    }

    try {
      // Handle different scan modes
      if (scanMode === 'paper' || scanMode === 'badge') {
        await processImageScan();
      } else {
        await processQRCodeScan();
      }
    } catch (err) {
      console.error('Error processing scan:', err);
      setError('Failed to process scan');
      setLoading(false);
    }
  };

  const processImageScan = async () => {
    setProcessingStep('Processing image with AI...');
    
    // For demo purposes, we'll simulate AI processing with mock data
    // In a real app, you would process the actual image
    const mockResult = await simulateAIProcessing();
    
    if (mockResult.success && mockResult.contactData) {
      await createContactFromAIData(mockResult.contactData);
    } else {
      setError(mockResult.error || 'Failed to extract contact information');
      setLoading(false);
    }
  };

  const processQRCodeScan = async () => {
    setProcessingStep('Parsing QR code...');
    
    const parsed = parseQRCodeData(data);
    setParsedData(parsed);

    switch (parsed.type) {
      case 'profile':
        await fetchProfileData(parsed.profileId!);
        break;
      case 'vcard':
        await createContactFromVCard(parsed.contactData);
        break;
      case 'linkedin':
      case 'twitter':
      case 'instagram':
        await createContactFromSocial(parsed.contactData);
        break;
      case 'url':
        await handleUrlData(parsed.contactData.url);
        break;
      default:
        setError('Unsupported QR code format');
        setLoading(false);
    }
  };

  const simulateAIProcessing = async (): Promise<{ success: boolean; contactData?: any; error?: string }> => {
    // Simulate processing delay with progress updates
    setProcessingStep('Analyzing image...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setProcessingStep('Extracting text with OCR...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProcessingStep('Processing contact information...');
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Simulate occasional failures for realism
    const shouldFail = Math.random() < 0.1; // 10% failure rate
    
    if (shouldFail) {
      return {
        success: false,
        error: scanMode === 'paper' 
          ? 'Could not clearly read the business card. Please ensure good lighting and try again.'
          : 'Could not extract information from the badge. Please ensure the text is clearly visible.'
      };
    }
    
    // Mock AI extraction results based on scan mode
    if (scanMode === 'paper') {
      const businessCards = [
        {
          name: 'Sarah Johnson',
          contactInfo: {
            email: 'sarah.johnson@techcorp.com',
            phone: '+1 (555) 987-6543',
            company: 'TechCorp Solutions',
            position: 'Senior Product Manager',
            address: '123 Innovation Drive, San Francisco, CA 94105'
          },
          socialLinks: [
            {
              id: generateContactId(),
              platform: 'linkedin' as const,
              url: 'https://linkedin.com/in/sarahjohnson',
              username: 'sarahjohnson'
            }
          ]
        },
        {
          name: 'David Kim',
          contactInfo: {
            email: 'david.kim@designstudio.com',
            phone: '+1 (555) 234-5678',
            company: 'Creative Design Studio',
            position: 'UX Designer',
            address: '456 Creative Ave, New York, NY 10001'
          },
          socialLinks: [
            {
              id: generateContactId(),
              platform: 'website' as const,
              url: 'https://davidkim.design'
            }
          ]
        },
        {
          name: 'Maria Rodriguez',
          contactInfo: {
            email: 'maria@marketingpro.com',
            phone: '+1 (555) 345-6789',
            company: 'Marketing Pro Agency',
            position: 'Marketing Director'
          },
          socialLinks: [
            {
              id: generateContactId(),
              platform: 'twitter' as const,
              url: 'https://twitter.com/mariarodriguez',
              username: 'mariarodriguez'
            }
          ]
        }
      ];
      
      return {
        success: true,
        contactData: businessCards[Math.floor(Math.random() * businessCards.length)]
      };
    } else if (scanMode === 'badge') {
      const eventBadges = [
        {
          name: 'Michael Chen',
          contactInfo: {
            email: 'michael.chen@startup.io',
            company: 'StartupIO',
            position: 'CTO'
          },
          eventInfo: {
            eventName: 'Tech Conference 2024',
            attendeeType: 'Speaker',
            badgeNumber: 'SPK-001'
          }
        },
        {
          name: 'Emily Watson',
          contactInfo: {
            email: 'emily.watson@venture.com',
            company: 'Venture Capital Partners',
            position: 'Investment Partner'
          },
          eventInfo: {
            eventName: 'Startup Summit 2024',
            attendeeType: 'Investor',
            badgeNumber: 'INV-042'
          }
        },
        {
          name: 'Alex Thompson',
          contactInfo: {
            email: 'alex@techstartup.com',
            company: 'Tech Startup Inc',
            position: 'Founder & CEO'
          },
          eventInfo: {
            eventName: 'Innovation Expo',
            attendeeType: 'Exhibitor',
            badgeNumber: 'EXH-123'
          }
        }
      ];
      
      return {
        success: true,
        contactData: eventBadges[Math.floor(Math.random() * eventBadges.length)]
      };
    }
    
    return {
      success: false,
      error: 'Could not extract contact information'
    };
  };

  const createContactFromAIData = async (aiData: any) => {
    try {
      const contact: Contact = {
        id: generateContactId(),
        name: aiData.name || 'Unknown Contact',
        headline: aiData.contactInfo?.position || '',
        bio: aiData.eventInfo ? `Met at ${aiData.eventInfo.eventName}` : '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${aiData.name}`,
        cardColor: '#4A90E2',
        contactInfo: aiData.contactInfo || {},
        socialLinks: aiData.socialLinks || [],
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notes: aiData.eventInfo ? `Badge: ${aiData.eventInfo.badgeNumber || 'N/A'}\nType: ${aiData.eventInfo.attendeeType || 'Attendee'}` : '',
        tags: aiData.eventInfo ? [aiData.eventInfo.eventName, aiData.eventInfo.attendeeType] : [],
        meetingContext: scanMode === 'paper' ? 'Scanned from business card' : scanMode === 'badge' ? `Scanned from event badge${aiData.eventInfo ? ` at ${aiData.eventInfo.eventName}` : ''}` : 'Scanned',
        lastInteraction: Date.now()
      };

      setContactData(contact);
      await addContact(contact);
      setSuccess(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Error creating contact from AI data:', err);
      setError('Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const createContactFromSocial = async (socialData: any) => {
    try {
      const contactData = createContactFromSocialProfile(socialData);
      const contact: Contact = {
        id: generateContactId(),
        name: contactData.name,
        headline: contactData.headline,
        bio: '',
        cardColor: '#EBEEF1',
        contactInfo: contactData.contactInfo,
        socialLinks: contactData.socialLinks,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notes: '',
        tags: [socialData.platform],
        meetingContext: `Connected via ${socialData.platform}`,
        lastInteraction: Date.now()
      };

      setContactData(contact);
      await addContact(contact);
      setSuccess(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Error creating social contact:', err);
      setError('Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async (profileId: string) => {
    try {
      setProcessingStep('Fetching profile data...');
      
      // In a real app, you would fetch from your API or Supabase
      // For now, create a mock contact based on the profile ID
      const mockProfiles: Record<string, Partial<Contact>> = {
        'john-doe': {
          name: 'John Doe',
          headline: 'Senior Software Engineer',
          bio: 'Full-stack developer with 8+ years of experience building scalable web applications.',
          contactInfo: {
            email: 'john.doe@techcorp.com',
            phone: '+1 (555) 123-4567',
            company: 'TechCorp Solutions',
            position: 'Senior Software Engineer'
          },
          socialLinks: [
            {
              id: '1',
              platform: 'linkedin' as const,
              url: 'https://linkedin.com/in/johndoe',
              username: 'johndoe'
            },
            {
              id: '2',
              platform: 'github' as const,
              url: 'https://github.com/johndoe',
              username: 'johndoe'
            }
          ]
        },
        'sample': {
          name: 'Alex Rivera',
          headline: 'Product Designer',
          bio: 'Passionate about creating user-centered designs that solve real problems.',
          contactInfo: {
            email: 'alex.rivera@designstudio.com',
            phone: '+1 (555) 987-6543',
            company: 'Design Studio',
            position: 'Senior Product Designer'
          },
          socialLinks: [
            {
              id: '1',
              platform: 'linkedin' as const,
              url: 'https://linkedin.com/in/alexrivera',
              username: 'alexrivera'
            },
            {
              id: '2',
              platform: 'website' as const,
              url: 'https://alexrivera.design'
            }
          ]
        }
      };

      const profileData = mockProfiles[profileId] || mockProfiles['sample'];
      
      const mockContact: Contact = {
        id: profileId,
        name: profileData.name || 'Unknown Profile',
        headline: profileData.headline || '',
        bio: profileData.bio || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileId}`,
        cardColor: '#4A90E2',
        contactInfo: profileData.contactInfo || {},
        socialLinks: profileData.socialLinks || [],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notes: '',
        tags: ['digital-profile'],
        meetingContext: scanMode === 'paper' ? 'Scanned from business card' : scanMode === 'badge' ? 'Scanned from event badge' : 'Scanned from QR code',
        lastInteraction: Date.now()
      };

      setContactData(mockContact);
      await addContact(mockContact);
      setSuccess(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const createContactFromVCard = async (vCardData: any) => {
    try {
      setProcessingStep('Creating contact from vCard...');
      
      const contact: Contact = {
        id: generateContactId(),
        name: vCardData.name || 'Unknown Contact',
        headline: vCardData.contactInfo?.position || '',
        bio: vCardData.notes || '',
        avatar: vCardData.name ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${vCardData.name}` : undefined,
        cardColor: '#EBEEF1',
        contactInfo: vCardData.contactInfo || {},
        socialLinks: vCardData.socialLinks || [],
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notes: vCardData.notes || '',
        tags: vCardData.contactInfo?.company ? [vCardData.contactInfo.company] : [],
        meetingContext: scanMode === 'paper' ? 'Scanned from business card' : scanMode === 'badge' ? 'Scanned from event badge' : 'Imported from vCard',
        lastInteraction: Date.now()
      };

      setContactData(contact);
      await addContact(contact);
      setSuccess(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Error creating contact from vCard:', err);
      setError('Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlData = async (url: string) => {
    try {
      setProcessingStep('Processing URL...');
      
      // Try to extract meaningful info from the URL
      const domain = new URL(url).hostname.replace('www.', '');
      let name = 'Web Contact';
      let headline = '';
      let platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'youtube' | 'tiktok' | 'website' | 'other' = 'website';
      
      // Check for common social media domains
      if (domain.includes('linkedin.com')) {
        platform = 'linkedin';
        name = 'LinkedIn Profile';
        headline = 'Professional Network';
      } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
        platform = 'twitter';
        name = 'Twitter Profile';
        headline = 'Social Media';
      } else if (domain.includes('instagram.com')) {
        platform = 'instagram';
        name = 'Instagram Profile';
        headline = 'Social Media';
      } else if (domain.includes('github.com')) {
        platform = 'github';
        name = 'GitHub Profile';
        headline = 'Developer Portfolio';
      } else {
        name = domain.charAt(0).toUpperCase() + domain.slice(1);
        headline = 'Website';
      }
      
      const contact: Contact = {
        id: generateContactId(),
        name,
        headline,
        bio: '',
        cardColor: '#EBEEF1',
        contactInfo: {},
        socialLinks: [
          {
            id: generateContactId(),
            platform: platform,
            url: url
          }
        ],
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notes: '',
        tags: [platform],
        meetingContext: 'Scanned from URL QR code',
        lastInteraction: Date.now()
      };

      setContactData(contact);
      await addContact(contact);
      setSuccess(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Error handling URL:', err);
      setError('Failed to process URL');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewContact = () => {
    if (contactData) {
      router.push(`/contacts/${contactData.id}`);
    } else {
      router.push('/contacts');
    }
  };
  
  const handleScanAgain = () => {
    router.push('/scan');
  };
  
  const getIcon = () => {
    if (parsedData?.type === 'profile') return <User size={64} color={colors.primary} />;
    if (parsedData?.type === 'vcard') return <FileText size={64} color={colors.primary} />;
    if (parsedData?.type === 'linkedin' || parsedData?.type === 'twitter' || parsedData?.type === 'instagram') return <User size={64} color={colors.primary} />;
    if (parsedData?.type === 'url') return <Globe size={64} color={colors.primary} />;
    if (scanMode === 'paper' || scanMode === 'badge') return <FileText size={64} color={colors.primary} />;
    return <CheckCircle size={64} color={colors.success} />;
  };

  const getTitle = () => {
    if (parsedData?.type === 'profile') return 'Profile Found!';
    if (parsedData?.type === 'vcard') {
      if (scanMode === 'paper') return 'Business Card Scanned!';
      if (scanMode === 'badge') return 'Event Badge Scanned!';
      return 'Business Card Imported!';
    }
    if (parsedData?.type === 'linkedin') return 'LinkedIn Profile Added!';
    if (parsedData?.type === 'twitter') return 'Twitter Profile Added!';
    if (parsedData?.type === 'instagram') return 'Instagram Profile Added!';
    if (parsedData?.type === 'url') return 'Link Saved!';
    if (scanMode === 'paper') return 'Business Card Processed!';
    if (scanMode === 'badge') return 'Event Badge Processed!';
    return 'Contact Added!';
  };

  const getDescription = () => {
    if (contactData) {
      const context = contactData.meetingContext;
      if (context?.includes('business card')) {
        return `${contactData.name}'s business card has been processed and added to your contacts.`;
      } else if (context?.includes('event badge')) {
        return `${contactData.name}'s event badge has been processed and added to your contacts.`;
      } else if (context?.includes('LinkedIn') || context?.includes('Twitter') || context?.includes('Instagram')) {
        return `${contactData.name}'s social profile has been added to your contacts.`;
      }
      return `${contactData.name} has been added to your contacts.`;
    }
    return 'The contact has been successfully added to your network.';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {scanMode === 'paper' ? 'Processing Business Card' : scanMode === 'badge' ? 'Processing Event Badge' : 'Processing Scan'}
        </Text>
        <Text style={styles.loadingSubtext}>
          {processingStep}
        </Text>
        {(scanMode === 'paper' || scanMode === 'badge') && (
          <Text style={styles.aiNote}>
            Using AI to extract contact information
          </Text>
        )}
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.iconContainer}>
          <XCircle size={64} color={colors.error} />
        </View>
        <Text style={styles.errorTitle}>Scan Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        
        <Button
          title="Try Again"
          onPress={handleScanAgain}
          variant="primary"
          style={styles.button}
        />
      </View>
    );
  }
  
  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <Text style={styles.successTitle}>{getTitle()}</Text>
        <Text style={styles.successText}>{getDescription()}</Text>
        
        {contactData && (
          <View style={styles.contactPreview}>
            <Text style={styles.contactName}>{contactData.name}</Text>
            {contactData.headline && (
              <Text style={styles.contactHeadline}>{contactData.headline}</Text>
            )}
            {contactData.contactInfo.company && (
              <Text style={styles.contactCompany}>{contactData.contactInfo.company}</Text>
            )}
            {contactData.contactInfo.email && (
              <Text style={styles.contactEmail}>{contactData.contactInfo.email}</Text>
            )}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            title="View Contact"
            onPress={handleViewContact}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="Scan Another"
            onPress={handleScanAgain}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  iconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
  contactPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  contactHeadline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contactEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aiNote: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});