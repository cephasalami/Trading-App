import { User } from '@supabase/supabase-js';

/**
 * Convert Supabase Auth UUID to numeric ID for legacy database compatibility
 */
export function getUserNumericId(user: User): number {
  return Math.abs(user.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  return phone;
}

/**
 * Generate QR code data URL
 */
export function generateQRCodeUrl(data: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get platform icon name for social links
 */
export function getPlatformIcon(platform: string): string {
  const platformIcons: Record<string, string> = {
    linkedin: 'linkedin',
    twitter: 'twitter',
    instagram: 'instagram',
    facebook: 'facebook',
    github: 'github',
    website: 'globe',
    email: 'mail',
    phone: 'phone',
  };
  
  return platformIcons[platform.toLowerCase()] || 'link';
}

/**
 * Parse QR code data to extract contact information
 */
export function parseQRCodeData(data: string): {
  type: 'profile' | 'vcard' | 'url' | 'linkedin' | 'twitter' | 'instagram' | 'unknown';
  profileId?: string;
  contactData?: any;
} {
  // Check if it's a profile URL
  const profileUrlMatch = data.match(/(?:https?:\/\/)?(?:www\.)?(?:digitalcard\.app|tapping\.app|tapni\.com|popl\.co|linq\.team)\/(?:profile|p|u)\/([a-zA-Z0-9-_]+)/i);
  if (profileUrlMatch) {
    return {
      type: 'profile',
      profileId: profileUrlMatch[1]
    };
  }

  // Check for LinkedIn profiles
  const linkedinMatch = data.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i);
  if (linkedinMatch) {
    return {
      type: 'linkedin',
      contactData: {
        platform: 'linkedin',
        username: linkedinMatch[1],
        url: data
      }
    };
  }

  // Check for Twitter profiles
  const twitterMatch = data.match(/(?:https?:\/\/)?(?:www\.)?(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i);
  if (twitterMatch) {
    return {
      type: 'twitter',
      contactData: {
        platform: 'twitter',
        username: twitterMatch[2],
        url: data
      }
    };
  }

  // Check for Instagram profiles
  const instagramMatch = data.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/i);
  if (instagramMatch) {
    return {
      type: 'instagram',
      contactData: {
        platform: 'instagram',
        username: instagramMatch[1],
        url: data
      }
    };
  }

  // Check if it's a vCard format
  if (data.startsWith('BEGIN:VCARD')) {
    return {
      type: 'vcard',
      contactData: parseVCard(data)
    };
  }

  // Check if it's a URL
  if (isValidUrl(data)) {
    return {
      type: 'url',
      contactData: { url: data }
    };
  }

  return { type: 'unknown' };
}

/**
 * Parse vCard data
 */
function parseVCard(vcard: string): any {
  const lines = vcard.split(/\r?\n/);
  const contact: any = {
    name: '',
    contactInfo: {},
    socialLinks: []
  };

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    const keyUpper = key.toUpperCase();

    switch (keyUpper) {
      case 'FN':
      case 'N':
        if (!contact.name) contact.name = value;
        break;
      case 'EMAIL':
        contact.contactInfo.email = value;
        break;
      case 'TEL':
        contact.contactInfo.phone = value;
        break;
      case 'ORG':
        contact.contactInfo.company = value;
        break;
      case 'TITLE':
        contact.contactInfo.position = value;
        break;
      case 'ADR':
        contact.contactInfo.address = value.replace(/;/g, ', ');
        break;
      case 'URL':
        contact.socialLinks.push({
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          platform: 'website' as const,
          url: value
        });
        break;
      case 'NOTE':
        contact.notes = value;
        break;
    }
  }

  return contact;
}

/**
 * Generate a unique contact ID
 */
export function generateContactId(): string {
  return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Process image with AI for OCR text extraction
 */
export async function processImageWithAI(imageUri: string, scanMode: 'paper' | 'badge'): Promise<{
  success: boolean;
  contactData?: any;
  error?: string;
}> {
  try {
    // Convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.readAsDataURL(blob);
    });

    const prompt = scanMode === 'paper' 
      ? `Extract contact information from this business card image. Return a JSON object with the following structure:
{
  "name": "Full Name",
  "contactInfo": {
    "email": "email@example.com",
    "phone": "+1234567890",
    "company": "Company Name",
    "position": "Job Title",
    "address": "Full Address"
  },
  "socialLinks": [
    {
      "platform": "linkedin",
      "url": "https://linkedin.com/in/username",
      "username": "username"
    }
  ]
}
Only include fields that are clearly visible in the image. If a field is not present, omit it from the JSON.`
      : `Extract contact information from this event badge/name tag image. Return a JSON object with the following structure:
{
  "name": "Full Name",
  "contactInfo": {
    "email": "email@example.com",
    "company": "Company Name",
    "position": "Job Title"
  },
  "eventInfo": {
    "eventName": "Event Name",
    "attendeeType": "Speaker/Attendee/Staff",
    "badgeNumber": "Badge ID if visible"
  }
}
Only include fields that are clearly visible in the image. Focus on name, company, and any contact information.`;

    const aiResponse = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image',
                image: base64
              }
            ]
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      throw new Error('AI processing failed');
    }

    const aiResult = await aiResponse.json();
    const extractedText = aiResult.completion;

    // Try to parse JSON from AI response
    let contactData;
    try {
      // Extract JSON from the response (in case AI adds extra text)
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contactData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      // Fallback: try to extract basic info from text
      contactData = extractBasicInfoFromText(extractedText);
    }

    return {
      success: true,
      contactData
    };
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Fallback function to extract basic contact info from text
 */
function extractBasicInfoFromText(text: string): any {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /[\+]?[1-9]?[\-\s\(\)]?\(?[0-9]{3}\)?[\-\s\.]?[0-9]{3}[\-\s\.]?[0-9]{4,6}/g;
  
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  
  // Try to extract name (usually the first capitalized words)
  const lines = text.split('\n').filter(line => line.trim());
  let name = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && /^[A-Z][a-zA-Z\s]+$/.test(trimmed) && trimmed.length < 50) {
      name = trimmed;
      break;
    }
  }
  
  return {
    name: name || 'Unknown Contact',
    contactInfo: {
      email: emails[0] || undefined,
      phone: phones[0] || undefined
    },
    socialLinks: []
  };
}

/**
 * Create contact from social media profile
 */
export function createContactFromSocialProfile(profileData: any): any {
  const { platform, username, url } = profileData;
  
  return {
    name: username ? `@${username}` : 'Social Contact',
    headline: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Profile`,
    contactInfo: {},
    socialLinks: [
      {
        id: generateContactId(),
        platform,
        url,
        username
      }
    ]
  };
}