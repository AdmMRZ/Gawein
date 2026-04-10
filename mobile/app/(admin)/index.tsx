import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Alert, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { adminService } from '@/services/admin';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { ProviderProfile } from '@/types';

export default function AdminScreen() {
  const { logout } = useAuth();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await adminService.listPendingProviders();
      setProviders(res);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleVerify = (id: number, name: string) => {
    Alert.alert('Verifikasi', `Verifikasi ${name}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Verifikasi',
        onPress: async () => {
          await adminService.verifyProvider(id);
          loadData();
        },
      },
    ]);
  };

  const handleReject = (id: number, name: string) => {
    Alert.alert('Tolak', `Tolak ${name}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Tolak',
        style: 'destructive',
        onPress: async () => {
          await adminService.rejectProvider(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {loading ? (
        <View style={{ padding: Spacing.xxl, gap: Spacing.md }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.md, flexGrow: 1 }}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.navy} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="shield-checkmark-outline"
              title="Tidak ada pending"
              description="Semua provider sudah diverifikasi"
            />
          }
          ListFooterComponent={
            <View style={{ marginTop: Spacing.xxl }}>
              <Button title="Keluar" onPress={() => {
                Alert.alert('Keluar', 'Yakin?', [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Keluar', style: 'destructive', onPress: logout },
                ]);
              }} variant="danger" fullWidth />
            </View>
          }
          renderItem={({ item }) => {
            const fullName = `${item.user.first_name} ${item.user.last_name}`.trim();
            return (
              <Card>
                <View style={{ gap: Spacing.md }}>
                  <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
                    <Avatar name={fullName} size={44} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{
                          fontSize: FontSize.md,
                          fontWeight: FontWeight.semibold,
                          color: Colors.textPrimary,
                        }}
                      >
                        {fullName}
                      </Text>
                      <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }} selectable>
                        {item.user.email}
                      </Text>
                      <Badge label="Menunggu Verifikasi" variant="warning" />
                    </View>
                  </View>
                  {item.bio ? (
                    <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 }}>
                      {item.bio}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Verifikasi"
                        onPress={() => handleVerify(item.id, fullName)}
                        fullWidth
                        size="sm"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Tolak"
                        onPress={() => handleReject(item.id, fullName)}
                        variant="danger"
                        fullWidth
                        size="sm"
                      />
                    </View>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}
