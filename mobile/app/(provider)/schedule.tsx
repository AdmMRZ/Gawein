import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { schedulingService } from '@/services/scheduling';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { Availability } from '@/types';
import { ApiError } from '@/services/api';

export default function ScheduleScreen() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await schedulingService.listAvailability();
      setSlots(res);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    if (!date || !startTime || !endTime) {
      setFormError('Lengkapi semua field');
      return;
    }
    setFormError('');
    setFormLoading(true);
    try {
      await schedulingService.createAvailability({ date, start_time: startTime, end_time: endTime });
      setDate('');
      setStartTime('');
      setEndTime('');
      setShowForm(false);
      loadData();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Gagal menambah jadwal');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Hapus Jadwal', 'Yakin ingin menghapus slot ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await schedulingService.deleteAvailability(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* ── Add Button ────────────────────────────── */}
      <View style={{ padding: Spacing.xxl, paddingBottom: 0 }}>
        <Button
          title={showForm ? 'Tutup Form' : 'Tambah Jadwal'}
          onPress={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'primary'}
          fullWidth
          icon={<Ionicons name={showForm ? 'close' : 'add'} size={18} color={showForm ? Colors.navy : Colors.textInverse} />}
        />
      </View>

      {/* ── Add Form ──────────────────────────────── */}
      {showForm && (
        <View style={{ padding: Spacing.xxl, paddingTop: Spacing.lg }}>
          <Card>
            <View style={{ gap: Spacing.md }}>
              <Input
                label="Tanggal (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                placeholder="2026-04-15"
              />
              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Mulai (HH:MM)"
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Selesai (HH:MM)"
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="17:00"
                  />
                </View>
              </View>
              {formError ? (
                <Text style={{ fontSize: FontSize.sm, color: Colors.error }}>{formError}</Text>
              ) : null}
              <Button title="Simpan" onPress={handleAdd} loading={formLoading} fullWidth variant="secondary" />
            </View>
          </Card>
        </View>
      )}

      {/* ── Slots List ────────────────────────────── */}
      {loading ? (
        <View style={{ padding: Spacing.xxl, gap: Spacing.md }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.md, flexGrow: 1 }}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.navy} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="Belum ada jadwal"
              description="Tambahkan slot waktu yang kamu tersedia"
            />
          }
          renderItem={({ item }) => (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ gap: 2 }}>
                  <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary }}>
                    {new Date(item.date + 'T00:00:00').toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                  <Text
                    style={{
                      fontSize: FontSize.sm,
                      color: Colors.textSecondary,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                  </Text>
                </View>
                <Button title="Hapus" onPress={() => handleDelete(item.id)} variant="ghost" size="sm" />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
