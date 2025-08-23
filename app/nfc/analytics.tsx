import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getNFCAnalytics } from '@/lib/nfc-supabase';
import colors from '@/constants/colors';

import { ErrorState } from '@/components/EmptyState';

export default function NFCAnalyticsScreen() {
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['nfc-analytics'],
    queryFn: getNFCAnalytics,
  });

  if (isLoading) {
    return <Text>Loading NFC analytics...</Text>;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>NFC Analytics</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Tags</Text>
          <Text style={styles.cardValue}>{analytics?.total_devices}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Tags</Text>
          <Text style={styles.cardValue}>{analytics?.active_devices}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Interactions</Text>
          <Text style={styles.cardValue}>{analytics?.recent_interactions}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interaction Types</Text>
        {analytics?.interaction_counts && Object.entries(analytics.interaction_counts).map(([type, count]) => (
          <View key={type} style={styles.interactionRow}>
            <Text style={styles.interactionType}>{type}</Text>
            <Text style={styles.interactionCount}>{count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  interactionType: {
    fontSize: 16,
    color: colors.text,
  },
  interactionCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});
