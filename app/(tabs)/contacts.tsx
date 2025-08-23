import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useContactsStore } from '@/store/contactsStore';
import { useTheme } from '@/hooks/useTheme';
import ContactListItem from '@/components/ContactListItem';
import EmptyState from '@/components/EmptyState';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ErrorState } from '@/components/EmptyState';

export default function ContactsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { contacts, loadContacts, isLoading, error } = useContactsStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);
  
  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      (contact.contactInfo.company && contact.contactInfo.company.toLowerCase().includes(query)) ||
      (contact.contactInfo.position && contact.contactInfo.position.toLowerCase().includes(query)) ||
      (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });
  
  const handleScanContact = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/scan');
  };
  
  const handleExportContacts = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Premium Feature', 'Export contacts to CSV or integrate with CRM systems with Tapping Premium.');
  };

  if (isLoading) {
    return <Text>Loading contacts...</Text>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadContacts} />;
  }
  
  if (contacts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleScanContact}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.lightGray }]}>
              <MaterialCommunityIcons name="qrcode" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Scan QR Code</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Scan a digital business card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleScanContact}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.lightGray }]}>
              <MaterialCommunityIcons name="upload" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Scan Paper Card</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Import from physical card</Text>
          </TouchableOpacity>
        </View>
        
        <EmptyState
          title="No Contacts Yet"
          description="Scan a QR code or business card to add your first contact."
          actionLabel="Scan Contact"
          onAction={handleScanContact}
          icon={<MaterialCommunityIcons name="account-plus" size={40} color={colors.primary} />}
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search contacts..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.smallActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/contacts/add')}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color={colors.primary} />
            <Text style={[styles.smallActionText, { color: colors.text }]}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.smallActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleScanContact}
          >
            <MaterialCommunityIcons name="qrcode" size={20} color={colors.primary} />
            <Text style={[styles.smallActionText, { color: colors.text }]}>Scan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.smallActionButton, styles.premiumButton]}
            onPress={handleExportContacts}
          >
            <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
            <Text style={[styles.smallActionText, styles.premiumText]}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {filteredContacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/contacts/${item.id}`)}>
            <ContactListItem contact={item} />
          </TouchableOpacity>
        )}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      ) : (
        <View style={styles.noResults}>
          <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>No contacts found matching "{searchQuery}"</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  premiumButton: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  smallActionText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  premiumText: {
    color: '#FFD700',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
