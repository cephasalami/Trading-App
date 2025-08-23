import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Contact } from '@/types/profile';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ContactListItemProps {
  contact: Contact;
}

export default function ContactListItem({ contact }: ContactListItemProps) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/contacts/${contact.id}`);
  };
  
  const defaultAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop';
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: contact.avatar || defaultAvatar }}
        style={styles.avatar}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{contact.name}</Text>
        {contact.contactInfo.company && (
          <Text style={styles.company}>
            {contact.contactInfo.position ? `${contact.contactInfo.position}, ` : ''}
            {contact.contactInfo.company}
          </Text>
        )}
        {contact.tags && contact.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {contact.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {contact.tags.length > 2 && (
              <Text style={styles.moreTag}>+{contact.tags.length - 2}</Text>
            )}
          </View>
        )}
      </View>
      
      <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(44, 44, 44, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  moreTag: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});