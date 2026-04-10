import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, Link } from 'expo-router';
import { hiringService } from '@/services/hiring';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Hiring } from '@/types';
import { ApiError } from '@/services/api';

export default function HiringDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [hiring, setHiring] = useState<Hiring | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await hiringService.getDetail(Number(id));
      setHiring(res);
    } catch {} finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateStatus = async (status: string) => {
    setActionLoading(true);
    try {
      const res = await hiringService.updateStatus(Number(id), status);
      setHiring(res);
      Alert.alert('Berhasil', `Status diubah ke ${status.replace(/_/g, ' ')}`);
    } catch (e) {
      Alert.alert('Gagal', e instanceof ApiError ? e.message : 'Tidak bisa mengubah status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!hiring) return <LoadingScreen message="Tidak ditemukan" />;

  const isProvider = user?.role === 'provider';
  const isClient = user?.role === 'client';

  return (
    <>
      <Stack.Screen options={{ title: hiring.service_title }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.xxl, paddingBottom: Spacing.section }}
      >
        {/* ── Status ──────────────────────────────── */}
        <View style={{ alignItems: 'center', gap: Spacing.sm }}>
          <StatusBadge status={hiring.status} />
        </View>

        {/* ── Details ─────────────────────────────── */}
        <Card>
          <View style={{ gap: Spacing.lg }}>
            <DetailRow label="Layanan" value={hiring.service_title} />
            <DetailRow label="Penyedia" value={hiring.provider_name} />
            <DetailRow label="Klien" value={hiring.client_name} />
            <DetailRow label="Harga" value={`Rp ${parseInt(hiring.agreed_price).toLocaleString('id-ID')}`} />
            <DetailRow label="Tanggal Kerja" value={hiring.work_date} />
            <DetailRow label="Lokasi" value={hiring.location || '-'} />
            {hiring.notes ? <DetailRow label="Catatan" value={hiring.notes} /> : null}
            <DetailRow
              label="Dibuat"
              value={new Date(hiring.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            />
          </View>
        </Card>

        {/* ── Actions ─────────────────────────────── */}
        {isProvider && hiring.status === 'confirmed' && (
          <Button
            title="Mulai Kerjakan"
            onPress={() => updateStatus('in_progress')}
            loading={actionLoading}
            fullWidth
          />
        )}
        {isProvider && hiring.status === 'in_progress' && (
          <Button
            title="Selesai"
            onPress={() => updateStatus('completed')}
            loading={actionLoading}
            fullWidth
            variant="secondary"
          />
        )}
        {isClient && hiring.status === 'completed' && !hiring.has_review && (
          <Link href={`/review/${hiring.id}`} asChild>
            <Button title="Tulis Review" onPress={() => {}} fullWidth variant="secondary" />
          </Link>
        )}
        {(hiring.status === 'pending' || hiring.status === 'confirmed') && (
          <Button
            title="Batalkan"
            onPress={() => {
              Alert.alert('Batalkan?', 'Yakin ingin membatalkan hiring ini?', [
                { text: 'Tidak', style: 'cancel' },
                { text: 'Ya, Batalkan', style: 'destructive', onPress: () => updateStatus('cancelled') },
              ]);
            }}
            loading={actionLoading}
            fullWidth
            variant="ghost"
          />
        )}
      </ScrollView>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ fontSize: FontSize.md, color: Colors.textPrimary }} selectable>
        {value}
      </Text>
    </View>
  );
}
