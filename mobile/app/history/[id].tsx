import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, Link } from 'expo-router';
import { historyService } from '@/services/history';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Hiring } from '@/types';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hiring, setHiring] = useState<Hiring | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyService.getDetail(Number(id))
      .then(setHiring)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!hiring) return <LoadingScreen message="Tidak ditemukan" />;

  return (
    <>
      <Stack.Screen options={{ title: hiring.service_title }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.xxl, paddingBottom: Spacing.section }}
      >
        <View style={{ alignItems: 'center' }}>
          <StatusBadge status={hiring.status} />
        </View>

        <Card>
          <View style={{ gap: Spacing.lg }}>
            <Row label="Layanan" value={hiring.service_title} />
            <Row label="Penyedia" value={hiring.provider_name} />
            <Row label="Harga" value={`Rp ${parseInt(hiring.agreed_price).toLocaleString('id-ID')}`} />
            <Row label="Tanggal Kerja" value={hiring.work_date} />
            <Row label="Lokasi" value={hiring.location || '-'} />
            {hiring.notes ? <Row label="Catatan" value={hiring.notes} /> : null}
            <Row
              label="Dibuat"
              value={new Date(hiring.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            />
          </View>
        </Card>

        {hiring.status === 'completed' && !hiring.has_review && (
          <Link href={`/review/${hiring.id}`} asChild>
            <Button title="Tulis Review" onPress={() => {}} fullWidth variant="secondary" />
          </Link>
        )}
      </ScrollView>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ fontSize: FontSize.md, color: Colors.textPrimary }} selectable>{value}</Text>
    </View>
  );
}
