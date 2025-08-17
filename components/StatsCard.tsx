import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileStats } from '@/types/profile';
import colors from '@/constants/colors';
import { Eye, Save, Clock } from 'lucide-react-native';

interface StatsCardProps {
  stats: ProfileStats;
}

export default function StatsCard({ stats }: StatsCardProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Stats</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <Eye size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.views}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <Save size={20} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.saves}</Text>
            <Text style={styles.statLabel}>Saves</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.lastViewed}>
        <Clock size={16} color="#CCCCCC" />
        <Text style={styles.lastViewedText}>
          Last viewed: {formatDate(stats.lastViewed)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(44, 44, 44, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  lastViewed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },
  lastViewedText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});