import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getNfcTags } from '@/lib/nfc';
import colors from '@/constants/colors';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

import { ErrorState } from '@/components/EmptyState';

export default function NFCManagerScreen() {
  const router = useRouter();
  const { data: nfcTags, isLoading, error, refetch } = useQuery({
    queryKey: ['nfc-tags'],
    queryFn: getNfcTags,
  });

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.tagItem}>
      <Text style={styles.tagName}>{item.name}</Text>
      <Text style={styles.tagType}>{item.type}</Text>
      <TouchableOpacity onPress={() => router.push(`/nfc/configure/${item.id}`)}>
        <MaterialCommunityIcons name="cog-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <Text>Loading NFC tags...</Text>;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={nfcTags}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No NFC tags found.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/nfc/activate')}>
        <MaterialCommunityIcons name="plus-circle-outline" size={32} color={colors.primary} />
        <Text style={styles.addButtonText}>Activate New Tag</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  tagType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
});
