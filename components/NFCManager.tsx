import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { 
  getUserNFCTags, 
  getNFCInteractionHistory, 
  getNFCAnalytics,
  deleteNFCTag,
  deactivateNFCTag 
} from '@/lib/nfc-supabase';
import { NFCTag, NFCInteraction } from '@/lib/nfc-supabase';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function NFCManager() {
  const colors = useTheme();
  const [nfcTags, setNfcTags] = useState<NFCTag[]>([]);
  const [interactions, setInteractions] = useState<NFCInteraction[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNFCData();
  }, []);

  const loadNFCData = async () => {
    try {
      setLoading(true);
      const [tags, history, stats] = await Promise.all([
        getUserNFCTags(),
        getNFCInteractionHistory(),
        getNFCAnalytics()
      ]);
      
      setNfcTags(tags);
      setInteractions(history);
      setAnalytics(stats);
    } catch (error) {
      console.error('Error loading NFC data:', error);
      Alert.alert('Error', 'Failed to load NFC data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNFCData();
    setRefreshing(false);
  };

  const handleDeleteTag = async (tagId: string, tagUid: string) => {
    Alert.alert(
      'Delete NFC Tag',
      `Are you sure you want to delete the NFC tag "${tagUid}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteNFCTag(tagId);
              if (success) {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                setNfcTags(prev => prev.filter(tag => tag.id !== tagId));
                Alert.alert('Success', 'NFC tag deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete NFC tag');
              }
            } catch (error) {
              console.error('Error deleting NFC tag:', error);
              Alert.alert('Error', 'Failed to delete NFC tag');
            }
          }
        }
      ]
    );
  };

  const handleToggleTagStatus = async (tagId: string, isActive: boolean) => {
    try {
      const success = await deactivateNFCTag(tagId);
      if (success) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setNfcTags(prev => prev.map(tag => 
          tag.id === tagId ? { ...tag, is_active: !isActive } : tag
        ));
        Alert.alert('Success', `NFC tag ${isActive ? 'deactivated' : 'activated'} successfully`);
      } else {
        Alert.alert('Error', `Failed to ${isActive ? 'deactivate' : 'activate'} NFC tag`);
      }
    } catch (error) {
      console.error('Error toggling tag status:', error);
      Alert.alert('Error', `Failed to ${isActive ? 'deactivate' : 'activate'} NFC tag`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTagTypeIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return <MaterialCommunityIcons name="tag-outline" size={16} color={colors.primary} />;
      case 'contact':
        return <MaterialCommunityIcons name="tag-outline" size={16} color={colors.secondary} />;
      case 'url':
        return <MaterialCommunityIcons name="tag-outline" size={16} color={colors.info} />;
      default:
        return <MaterialCommunityIcons name="tag-outline" size={16} color={colors.textSecondary} />;
    }
  };

  const getInteractionTypeIcon = (type: string) => {
    switch (type) {
      case 'read':
        return <MaterialCommunityIcons name="chart-line" size={16} color={colors.success} />;
      case 'write':
        return <MaterialCommunityIcons name="chart-line" size={16} color={colors.primary} />;
      case 'scan':
        return <MaterialCommunityIcons name="chart-line" size={16} color={colors.warning} />;
      default:
        return <MaterialCommunityIcons name="chart-line" size={16} color={colors.textSecondary} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading NFC data...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="nfc-variant" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>NFC Manager</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your NFC tags and view analytics
        </Text>
      </View>

      {/* Analytics Summary */}
      {analytics && (
        <View style={[styles.analyticsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.analyticsHeader}>
            <MaterialCommunityIcons name="chart-bar" size={24} color={colors.primary} />
            <Text style={[styles.analyticsTitle, { color: colors.text }]}>NFC Analytics</Text>
          </View>
          
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsItem}>
              <Text style={[styles.analyticsNumber, { color: colors.primary }]}>
                {analytics.totalTags}
              </Text>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                Total Tags
              </Text>
            </View>
            
            <View style={styles.analyticsItem}>
              <Text style={[styles.analyticsNumber, { color: colors.secondary }]}>
                {analytics.totalInteractions}
              </Text>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                Total Interactions
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* NFC Tags Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your NFC Tags ({nfcTags.length})
        </Text>
        
        {nfcTags.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="nfc-variant" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No NFC tags found
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Write data to NFC tags to see them here
            </Text>
          </View>
        ) : (
          nfcTags.map((tag) => (
            <View key={tag.id} style={[styles.tagCard, { backgroundColor: colors.surface }]}>
              <View style={styles.tagHeader}>
                <View style={styles.tagInfo}>
                  {getTagTypeIcon(tag.tag_type)}
                  <Text style={[styles.tagType, { color: colors.text }]}>
                    {tag.tag_type.toUpperCase()}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: tag.is_active ? colors.success + '20' : colors.error + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: tag.is_active ? colors.success : colors.error }
                    ]}>
                      {tag.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.tagActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surface }]}
                    onPress={() => handleToggleTagStatus(tag.id, tag.is_active)}
                  >
                    {tag.is_active ? (
                      <MaterialCommunityIcons name="power-off" size={16} color={colors.warning} />
                    ) : (
                      <MaterialCommunityIcons name="power" size={16} color={colors.success} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                    onPress={() => handleDeleteTag(tag.id, tag.tag_uid)}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={[styles.tagUID, { color: colors.textSecondary }]}>
                UID: {tag.tag_uid}
              </Text>
              
              {tag.last_used && (
                <Text style={[styles.lastUsed, { color: colors.textSecondary }]}>
                  Last used: {formatDate(tag.last_used)}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Recent Interactions Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Interactions ({interactions.length})
        </Text>
        
        {interactions.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="clock-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No interactions yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Start using NFC to see interaction history
            </Text>
          </View>
        ) : (
          interactions.slice(0, 10).map((interaction) => (
            <View key={interaction.id} style={[styles.interactionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.interactionHeader}>
                {getInteractionTypeIcon(interaction.interaction_type)}
                <Text style={[styles.interactionType, { color: colors.text }]}>
                  {interaction.interaction_type.toUpperCase()}
                </Text>
                <Text style={[styles.interactionTime, { color: colors.textSecondary }]}>
                  {formatDate(interaction.created_at)}
                </Text>
              </View>
              
              {interaction.interaction_data && (
                <Text style={[styles.interactionData, { color: colors.textSecondary }]} numberOfLines={2}>
                  {JSON.stringify(interaction.interaction_data)}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
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
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  analyticsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  analyticsItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  tagCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tagType: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagUID: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  lastUsed: {
    fontSize: 12,
  },
  interactionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  interactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  interactionType: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  interactionTime: {
    fontSize: 12,
  },
  interactionData: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
