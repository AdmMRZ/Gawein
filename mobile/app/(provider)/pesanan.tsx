import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable,
  RefreshControl, Platform, ActivityIndicator, Modal,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { schedulingService } from '@/services/scheduling';
import { SkeletonCard } from '@/components/ui/loading-screen';
import type { Booking } from '@/types';

// ── Constants ──────────────────────────────────────────────
const BLUE       = '#315BE8';
const GOLD       = '#FFD45A';

// ── Helpers ────────────────────────────────────────────────
function fmtDateTime(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    + ', '
    + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function isUpcoming(status: string) {
  return ['pending', 'confirmed'].includes(status);
}

// ── Category icon ──────────────────────────────────────────
function categoryIcon(name?: string | null): keyof typeof Ionicons.glyphMap {
  const n = (name ?? '').toLowerCase();
  if (n.includes('sopir') || n.includes('mobil') || n.includes('driver')) return 'car';
  if (n.includes('rumah') || n.includes('asisten') || n.includes('art'))   return 'home';
  if (n.includes('ac') || n.includes('teknisi') || n.includes('elektri'))  return 'settings';
  if (n.includes('rias') || n.includes('kecantikan'))                       return 'color-palette';
  if (n.includes('masak') || n.includes('cook') || n.includes('chef'))      return 'restaurant';
  return 'person-circle';
}

// ── Section Badge ──────────────────────────────────────────
function SectionBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

// ── Upcoming Card ──────────────────────────────────────────
function UpcomingCard({ item, onPress }: { item: Booking; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.upcomingCard, { opacity: pressed ? 0.9 : 1 }]}>
      <Text style={styles.dateText}>{fmtDateTime(item.created_at)}</Text>
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Ionicons name={categoryIcon(item.service_title)} size={26} color={BLUE} />
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.clientName} numberOfLines={1}>{item.client_email}</Text>
              <Text style={styles.detailText}>{item.service_title}</Text>
              {!!item.notes && <Text style={styles.detailText} numberOfLines={1}>{item.notes}</Text>}
            </View>
          </View>
        </View>
        <Text style={[styles.priceText, { fontSize: 11, color: '#555' }]}>{item.status}</Text>
      </View>
    </Pressable>
  );
}

// ── Completed Card ─────────────────────────────────────────
function CompletedCard({ item, onPress }: { item: Booking; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.completedCard, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={styles.cardRow}>
        <View style={styles.detailRow}>
          <View style={styles.iconBox}>
            <Ionicons name={categoryIcon(item.service_title)} size={26} color={BLUE} />
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.clientName} numberOfLines={1}>{item.client_email}</Text>
            <Text style={styles.detailText}>{item.service_title}</Text>
            <Text style={styles.detailText}>{fmtDateTime(item.created_at)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ── Detail Modal ───────────────────────────────────────────
function DetailModal({
  booking,
  visible,
  onClose,
  onUpdateStatus,
  updating,
}: {
  booking: Booking | null;
  visible: boolean;
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
  updating: boolean;
}) {
  if (!booking) return null;
  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: Platform.OS === 'ios' ? 44 : 24,
          gap: 14,
          maxHeight: '85%',
        }}>
          {/* Handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 4 }} />

          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111', textAlign: 'center' }}>
            Detail Pesanan
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
            {/* Client Header */}
            <View style={{ backgroundColor: GOLD, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="person" size={26} color="#111" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>{booking.client_email}</Text>
                <Text style={{ fontSize: 13, color: '#333' }}>{booking.service_title}</Text>
              </View>
            </View>

            {/* Info rows */}
            {[
              { icon: 'calendar-outline',          label: 'Tanggal',  value: fmtDateTime(booking.created_at) },
              { icon: 'construct-outline',          label: 'Layanan',  value: booking.service_title },
              { icon: 'chatbubble-outline',         label: 'Catatan',  value: booking.notes || '-' },
              { icon: 'information-circle-outline', label: 'Status',   value: booking.status },
            ].map(({ icon, label, value }) => (
              <View key={label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <Ionicons name={icon as any} size={16} color={BLUE} style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#777' }}>{label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: '#111' }}>{value}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* CTA */}
          {isPending && (
            <Pressable
              onPress={() => onUpdateStatus('confirmed')}
              disabled={updating}
              style={({ pressed }) => ({
                backgroundColor: GOLD,
                borderRadius: 40,
                paddingVertical: 15,
                alignItems: 'center',
                opacity: pressed || updating ? 0.8 : 1,
                marginTop: 4,
              })}
            >
              {updating
                ? <ActivityIndicator size="small" color="#111" />
                : <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Konfirmasi Pesanan</Text>
              }
            </Pressable>
          )}

          {isConfirmed && (
            <Pressable
              onPress={() => onUpdateStatus('completed')}
              disabled={updating}
              style={({ pressed }) => ({
                backgroundColor: BLUE,
                borderRadius: 40,
                paddingVertical: 15,
                alignItems: 'center',
                opacity: pressed || updating ? 0.8 : 1,
                marginTop: 4,
              })}
            >
              {updating
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Mark as Completed</Text>
              }
            </Pressable>
          )}

          <Pressable onPress={onClose} style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontSize: 14, color: '#777' }}>Tutup</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function ProviderPesananScreen() {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState<Booking | null>(null);
  const [updating, setUpdating]     = useState(false);
  const [error, setError]           = useState('');

  const load = useCallback(async () => {
    try {
      const res = await schedulingService.listBookings();
      setBookings(res);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selected) return;
    setUpdating(true);
    setError('');
    try {
      await schedulingService.updateBookingStatus(selected.id, newStatus);
      setSelected(null);
      await load();
    } catch {
      setError('Gagal memperbarui status. Coba lagi.');
    } finally {
      setUpdating(false);
    }
  };

  const upcoming  = bookings.filter(h => isUpcoming(h.status));
  const completed = bookings.filter(h => !isUpcoming(h.status));

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 44, gap: 12 }}>
        <Text style={styles.pageTitle}>Pesanan</Text>
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: Platform.OS === 'ios' ? 60 : 44, paddingBottom: 120 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE} />}
      >
        <Text style={styles.pageTitle}>Pesanan</Text>

        {/* ── Upcoming ── */}
        <SectionBadge label="Upcoming" />
        {upcoming.length === 0
          ? <Text style={styles.emptyText}>Tidak ada pesanan aktif</Text>
          : upcoming.map(b => (
              <UpcomingCard key={b.id} item={b} onPress={() => setSelected(b)} />
            ))
        }

        {/* ── Completed ── */}
        <SectionBadge label="Completed" />
        {completed.length === 0
          ? <Text style={styles.emptyText}>Tidak ada pesanan selesai</Text>
          : completed.map(b => (
              <CompletedCard key={b.id} item={b} onPress={() => setSelected(b)} />
            ))
        }

        {!!error && (
          <Text style={{ fontSize: 13, color: '#DC2626', textAlign: 'center', marginTop: 8 }}>{error}</Text>
        )}
      </ScrollView>

      <DetailModal
        booking={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={handleUpdateStatus}
        updating={updating}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 10 },

  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 6,
  },

  badge: {
    backgroundColor: '#FFD45A',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginVertical: 4,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#111',
  },

  upcomingCard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },

  completedCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#B0C4DE',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    backgroundColor: '#fff',
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLeft: { flex: 1 },

  dateText: { fontSize: 12, fontWeight: '700', color: '#111' },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },

  infoBlock: { flex: 1, gap: 2 },

  clientName: { fontSize: 15, fontWeight: '600', color: '#111' },
  detailText: { fontSize: 12, color: '#555' },
  priceText:  { fontSize: 13, fontWeight: '600', color: '#111', textAlign: 'right' },

  paymentRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  paymentBadge: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  paymentText: { fontSize: 12, color: '#111' },

  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 8 },
});
