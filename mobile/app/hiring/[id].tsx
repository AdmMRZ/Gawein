import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, Link } from 'expo-router';
import { hiringService } from '@/services/hiring';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
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
    } catch (e) {
      Alert.alert('Gagal', e instanceof ApiError ? e.message : 'Tidak bisa mengubah status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!hiring) return <LoadingScreen message="Pesanan tidak ditemukan" />;

  const isProvider = user?.role === 'provider';
  const isClient = user?.role === 'client';

  // Aesthetic mapping for statuses
  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'pending': return { icon: 'time', color: Colors.warning, text: 'Menunggu Konfirmasi', bg: Colors.warning + '1A' };
      case 'confirmed': return { icon: 'calendar', color: Colors.info, text: 'Pesanan Diterima', bg: Colors.infoSoft };
      case 'in_progress': return { icon: 'build', color: Colors.navy, text: 'Sedang Dikerjakan', bg: '#0B14261A' };
      case 'completed': return { icon: 'checkmark-circle', color: Colors.success, text: 'Pekerjaan Selesai', bg: Colors.successSoft };
      case 'cancelled': return { icon: 'close-circle', color: Colors.error, text: 'Dibatalkan', bg: Colors.errorSoft };
      default: return { icon: 'help-circle', color: Colors.grayMed, text: status, bg: Colors.grayLight };
    }
  };

  const statusCfg = getStatusConfig(hiring.status);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Stack.Screen options={{ title: 'Status Pesanan', headerShadowVisible: false, headerStyle: { backgroundColor: Colors.cream } }} />
      
      <ScrollView
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100, gap: Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* -- HUGE STATUS HEADER -- */}
        <View style={{ alignItems: 'center', backgroundColor: Colors.white, padding: Spacing.xxl, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.grayLight }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: statusCfg.bg, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md }}>
            <Ionicons name={statusCfg.icon as any} size={40} color={statusCfg.color} />
          </View>
          <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: statusCfg.color }}>
            {statusCfg.text}
          </Text>
          <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 }}>
            ID Pesanan: #{hiring.id.toString().padStart(6, '0')}
          </Text>
        </View>

        {/* -- ORDER DETAILS CARD -- */}
        <View style={{ backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.grayLight, overflow: 'hidden' }}>
          <View style={{ backgroundColor: Colors.slate900, padding: Spacing.lg }}>
            <Text style={{ color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.lg }}>{hiring.category_name}</Text>
          </View>
          <View style={{ padding: Spacing.xl, gap: Spacing.lg }}>
            <DetailRow icon="person" label={isClient ? 'Penyedia Jasa' : 'Pemesan'} value={isClient ? hiring.provider_name : hiring.client_name} />
            <DetailRow icon="wallet" label="Harga Kesepakatan" value={`Rp ${parseInt(hiring.agreed_price).toLocaleString('id-ID')}`} />
            <DetailRow icon="calendar-outline" label="Tanggal Kerja" value={hiring.work_date} />
            <DetailRow icon="location" label="Lokasi" value={hiring.location || '-'} />
            {hiring.notes ? <DetailRow icon="document-text" label="Catatan" value={hiring.notes} /> : null}
          </View>
        </View>

        {/* -- ACTIONS GROUP -- */}
        <View style={{ gap: Spacing.md }}>
          {isProvider && hiring.status === 'confirmed' && (
            <Button title="Mulai Kerjakan" onPress={() => updateStatus('in_progress')} loading={actionLoading} fullWidth size="lg" />
          )}
          {isProvider && hiring.status === 'in_progress' && (
            <Button title="Tandai Selesai" onPress={() => updateStatus('completed')} loading={actionLoading} fullWidth size="lg" style={{ backgroundColor: Colors.success }} />
          )}
          
          {isClient && hiring.status === 'completed' && !hiring.has_review && (
            <Link href={`/review/${hiring.id}`} asChild>
              <Button title="Beri Ulasan Bintang" onPress={() => {}} fullWidth size="lg" />
            </Link>
          )}

          {(hiring.status === 'pending' || hiring.status === 'confirmed') && (
            <Button
              title="Batalkan Pesanan"
              onPress={() => {
                Alert.alert('Batalkan?', 'Yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dikembalikan.', [
                  { text: 'Tutup', style: 'cancel' },
                  { text: 'Ya, Batalkan', style: 'destructive', onPress: () => updateStatus('cancelled') },
                ]);
              }}
              loading={actionLoading}
              fullWidth
              variant="outline"
              size="lg"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' }}>
      <Ionicons name={icon as any} size={20} color={Colors.textSecondary} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
        <Text style={{ fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
