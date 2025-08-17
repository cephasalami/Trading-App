import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContactsStore } from '@/store/contactsStore';
import colors from '@/constants/colors';
import ProfileCard from '@/components/ProfileCard';
import Button from '@/components/Button';
import { Edit, Mail, Phone, Plus, Share, Tag, Trash, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { contacts, updateContact, deleteContact, addTagToContact, removeTagFromContact, addNoteToContact } = useContactsStore();
  
  const contact = contacts.find(c => c.id === id);
  
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
  if (!contact) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Contact not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
          style={styles.backButton}
        />
      </View>
    );
  }
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    addTagToContact(id, newTag.trim());
    setNewTag('');
  };
  
  const handleRemoveTag = (tag: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    removeTagFromContact(id, tag);
  };
  
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    addNoteToContact(id, newNote.trim());
    setNewNote('');
    setIsEditingNotes(false);
  };
  
  const handleDeleteContact = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    // In a real app, we would show a confirmation dialog
    deleteContact(id);
    router.replace('/contacts');
  };
  
  const handleCall = () => {
    if (!contact.contactInfo.phone) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Linking.openURL(`tel:${contact.contactInfo.phone}`);
  };
  
  const handleEmail = () => {
    if (!contact.contactInfo.email) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Linking.openURL(`mailto:${contact.contactInfo.email}`);
  };
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ProfileCard profile={contact} isPreview />
      
      <View style={styles.actionButtons}>
        {contact.contactInfo.phone && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCall}
          >
            <View style={styles.actionIcon}>
              <Phone size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
        )}
        
        {contact.contactInfo.email && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEmail}
          >
            <View style={styles.actionIcon}>
              <Mail size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setIsEditingNotes(true)}
        >
          <View style={styles.actionIcon}>
            <Edit size={24} color={colors.primary} />
          </View>
          <Text style={styles.actionText}>Note</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tags</Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {contact.tags && contact.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity 
                style={styles.removeTagButton}
                onPress={() => handleRemoveTag(tag)}
              >
                <X size={14} color={colors.darkGray} />
              </TouchableOpacity>
            </View>
          ))}
          
          <View style={styles.addTagContainer}>
            <TextInput
              style={styles.tagInput}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add tag..."
              placeholderTextColor={colors.mediumGray}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={handleAddTag}
              disabled={!newTag.trim()}
            >
              <Plus size={16} color={newTag.trim() ? colors.primary : colors.mediumGray} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {!isEditingNotes && (
            <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
              <Edit size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        {isEditingNotes ? (
          <View style={styles.addNoteContainer}>
            <TextInput
              style={styles.noteInput}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Add a note about this contact..."
              placeholderTextColor={colors.mediumGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.noteActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditingNotes(false);
                  setNewNote('');
                }}
                variant="outline"
                size="small"
                style={styles.noteActionButton}
              />
              <Button
                title="Save"
                onPress={handleAddNote}
                variant="primary"
                size="small"
                style={styles.noteActionButton}
                disabled={!newNote.trim()}
              />
            </View>
          </View>
        ) : (
          <View>
            {contact.notes ? (
              <Text style={styles.noteText}>{contact.notes}</Text>
            ) : (
              <TouchableOpacity 
                style={styles.addNotePrompt}
                onPress={() => setIsEditingNotes(true)}
              >
                <Plus size={18} color={colors.primary} />
                <Text style={styles.addNoteText}>Add a note</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.metaInfo}>
        {contact.lastInteraction && (
          <Text style={styles.metaText}>
            Last interaction: {formatDate(contact.lastInteraction)}
          </Text>
        )}
      </View>
      
      <Button
        title="Delete Contact"
        onPress={handleDeleteContact}
        variant="outline"
        icon={<Trash size={18} color={colors.error} />}
        style={styles.deleteButton}
        textStyle={{ color: colors.error }}
      />
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagInput: {
    fontSize: 14,
    color: colors.text,
    minWidth: 80,
  },
  addTagButton: {
    marginLeft: 4,
  },
  addNoteContainer: {
    gap: 12,
  },
  noteInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  noteActionButton: {
    minWidth: 80,
  },
  noteText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  addNotePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  addNoteText: {
    fontSize: 16,
    color: colors.primary,
  },
  metaInfo: {
    marginBottom: 24,
    padding: 16,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  deleteButton: {
    borderColor: colors.error,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    minWidth: 120,
  },
});