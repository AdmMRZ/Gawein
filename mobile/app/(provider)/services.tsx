import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { providerService } from '@/services/provider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { Service } from '@/types';

export default function ProviderServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await providerService.listMyServices();
      setServices(res);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = (id: number, title: string) => {
    Alert.alert('Hapus Layanan', `Hapus "${title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await providerService.deleteService(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* ── Header Action ─────────────────────────── */}
      <View style={{ padding: Spacing.xxl, paddingBottom: 0 }}>
        <Link href="/service/create" asChild>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing.sm,
              backgroundColor: Colors.navy,
              height: 44,
              borderRadius: Radius.md,
              borderCurve: 'continuous' as const,
            } as any}
          >
            <Ionicons name="add" size={20} color={Colors.textInverse} />
            <Text
              style={{
                fontSize: FontSize.md,
                fontWeight: FontWeight.semibold,
                color: Colors.textInverse,
              }}
            >
              Tambah Layanan
            </Text>
          </Pressable>
        </Link>
      </View>

      {loading ? (
        <View style={{ padding: Spacing.xxl, gap: Spacing.md }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            padding: Spacing.xxl,
            gap: Spacing.md,
            flexGrow: 1,
          }}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.navy} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title="Belum ada layanan"
              description="Tambahkan layanan yang kamu tawarkan"
            />
          }
          renderItem={({ item }) => (
            <Card>
              <View style={{ gap: Spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text
                    style={{
                      fontSize: FontSize.md,
                      fontWeight: FontWeight.semibold,
                      color: Colors.textPrimary,
                      flex: 1,
                    }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: FontSize.md,
                      fontWeight: FontWeight.bold,
                      color: Colors.error,
                      fontVariant: ['tabular-nums'],
                    }}
                    selectable
                  >
                    Rp {parseInt(item.price).toLocaleString('id-ID')}
                  </Text>
                </View>
                <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
                  {item.category_name && <Badge label={item.category_name} />}
                  <Badge
                    label={item.is_active ? 'Aktif' : 'Nonaktif'}
                    variant={item.is_active ? 'success' : 'default'}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Edit"
                      onPress={() => router.push(`/service/${item.id}`)}
                      variant="outline"
                      size="sm"
                      fullWidth
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Hapus"
                      onPress={() => handleDelete(item.id, item.title)}
                      variant="danger"
                      size="sm"
                      fullWidth
                    />
                  </View>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
