import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { historyService } from '@/services/history';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Hiring } from '@/types';

export default function HistoryScreen() {
  const [hirings, setHirings] = useState<Hiring[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await historyService.list();
      setHirings(res);
    } catch {
      // Silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cream, padding: Spacing.xxl, gap: Spacing.md }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <FlatList
      data={hirings}
      keyExtractor={(item) => String(item.id)}
      style={{ flex: 1, backgroundColor: Colors.cream }}
      contentContainerStyle={{
        padding: Spacing.xxl,
        gap: Spacing.md,
        flexGrow: 1,
      }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navy} />
      }
      ListEmptyComponent={
        <EmptyState
          icon="receipt-outline"
          title="Belum ada riwayat"
          description="Mulai cari dan rekrut penyedia jasa"
        />
      }
      renderItem={({ item }) => (
        <Link href={`/history/${item.id}`} asChild>
          <Pressable>
            <Card>
              <View style={{ gap: Spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: FontSize.md,
                      fontWeight: FontWeight.semibold,
                      color: Colors.textPrimary,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.service_title}
                  </Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary }}>
                  {item.provider_name}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                  <Text
                    style={{
                      fontSize: FontSize.md,
                      fontWeight: FontWeight.semibold,
                      color: Colors.navy,
                      fontVariant: ['tabular-nums'],
                    }}
                    selectable
                  >
                    Rp {parseInt(item.agreed_price).toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        </Link>
      )}
    />
  );
}
