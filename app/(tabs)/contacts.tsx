import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useContactsStore } from '@/store/contactsStore';
import colors from '@/constants/colors';
import ContactListItem from '@/components/ContactListItem';
import EmptyState from '@/components/EmptyState';
import { Search, UserPlus, QrCode, Upload, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function ContactsScreen() {
  const router = useRouter();
  const { contacts, loadContacts, isLoading } = useContactsStore();
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
  
  if (contacts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={handleScanContact}
          >
            <View style={styles.actionIcon}>
              <QrCode size={32} color={colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Scan QR Code</Text>
            <Text style={styles.actionSubtitle}>Scan a digital business card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={handleScanContact}
          >
            <View style={styles.actionIcon}>
              <Upload size={32} color={colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Scan Paper Card</Text>
            <Text style={styles.actionSubtitle}>Import from physical card</Text>
          </TouchableOpacity>
        </View>
        
        <EmptyState
          title="No Contacts Yet"
          description="Scan a QR code or business card to add your first contact."
          actionLabel="Scan Contact"
          onAction={handleScanContact}
          icon={<UserPlus size={40} color={colors.primary} />}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#CCCCCC" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="#CCCCCC"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.smallActionButton}
            onPress={handleScanContact}
          >
            <QrCode size={20} color={colors.primary} />
            <Text style={styles.smallActionText}>Scan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.smallActionButton, styles.premiumButton]}
            onPress={handleExportContacts}
          >
            <Crown size={16} color="#FFD700" />
            <Text style={[styles.smallActionText, styles.premiumText]}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {filteredContacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContactListItem contact={item} />}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      ) : (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No contacts found matching "{searchQuery}"</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#2C2C2C',
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
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(44, 44, 44, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
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
    color: '#CCCCCC',
    textAlign: 'center',
  },
});