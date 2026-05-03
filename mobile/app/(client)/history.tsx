import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable,
  RefreshControl, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { historyService } from '@/services/history';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { FontWeight } from '@/constants/theme';
import type { Hiring } from '@/types';

// ── Constants ──────────────────────────────────────────────
const BLUE = '#315BE8';
const GOLD = '#FFD45A';
const GOLD_SOFT = '#FFF9E6';

// ── Helpers ────────────────────────────────────────────────
function fmtRp(value: string | number) {
  const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  return `Rp${Math.round(num).toLocaleString('id-ID')}`;
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Category icon map
function categoryIcon(name?: string | null): keyof typeof Ionicons.glyphMap {
  const n = (name ?? '').toLowerCase();
  if (n.includes('sopir') || n.includes('mobil') || n.includes('driver')) return 'car';
  if (n.includes('rumah') || n.includes('asisten') || n.includes('art')) return 'home';
  if (n.includes('ac') || n.includes('teknisi') || n.includes('elektri')) return 'settings';
  if (n.includes('rias') || n.includes('kecantikan') || n.includes('salon')) return 'color-palette';
  if (n.includes('masak') || n.includes('cook') || n.includes('chef')) return 'restaurant';
  return 'person-circle';
}

// ── Status helpers ─────────────────────────────────────────
function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    in_progress: 'On Progress',
    completed: 'Completed',
    cancelled: 'Dibatalkan',
  };
  return map[status] ?? status;
}

function isActive(status: string) {
  return status === 'pending' || status === 'confirmed' || status === 'in_progress';
}

// ── Transaction Card ───────────────────────────────────────
function TransactionCard({ item, onRate, onRebook }: {
  item: Hiring;
  onRate: (id: number) => void;
  onRebook: (id: number) => void;
}) {
  const completed = item.status === 'completed';
  const active    = isActive(item.status);

  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: active ? BLUE + '30' : '#E5E7EB',
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Status strip */}
      <View style={{
        backgroundColor: active ? '#EFF6FF' : '#F9FAFB',
        paddingHorizontal: 14,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}>
        <View style={{
          width: 7, height: 7, borderRadius: 4,
          backgroundColor: active ? BLUE : completed ? '#10B981' : '#9CA3AF',
        }} />
        <Text style={{ fontSize: 11, fontWeight: FontWeight.semibold, color: active ? BLUE : completed ? '#10B981' : '#9CA3AF' }}>
          {getStatusLabel(item.status)}
        </Text>
      </View>

      {/* Main content */}
      <Pressable
        onPress={() => onRate(item.id)}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, padding: 14 })}
      >
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          {/* Category icon */}
          <View style={{
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: BLUE + '15',
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Ionicons name={categoryIcon(item.category_name)} size={24} color={BLUE} />
          </View>

          {/* Info */}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: '#111' }} numberOfLines={1}>
              {item.provider_name}
            </Text>
            <Text style={{ fontSize: 12, color: '#777' }}>
              {item.category_name ?? item.service_title}
            </Text>
            <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              {fmtDate(item.created_at)}
            </Text>
          </View>

          {/* Price */}
          <Text style={{ fontSize: 14, fontWeight: FontWeight.bold, color: '#111' }}>
            {fmtRp(item.agreed_price)}
          </Text>
        </View>

        {/* Action buttons (only completed) */}
        {completed && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {!item.has_review && (
              <Pressable
                onPress={() => onRate(item.id)}
                style={({ pressed }) => ({
                  backgroundColor: GOLD,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: '#111' }}>Rate →</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => onRebook(item.id)}
              style={({ pressed }) => ({
                backgroundColor: GOLD,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 7,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: '#111' }}>Rebook →</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </View>
  );
}

// ── Section Header ─────────────────────────────────────────
function SectionLabel({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={{
      backgroundColor: active ? '#EFF6FF' : '#F3F4F6',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      alignSelf: 'flex-start',
      marginBottom: 10,
    }}>
      <Text style={{ fontSize: 12, fontWeight: FontWeight.semibold, color: active ? BLUE : '#555' }}>
        {label}
      </Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function AktivitasScreen() {
  const router  = useRouter();
  const [hirings, setHirings]     = useState<Hiring[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await historyService.list();
      setHirings(res);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const goDetail  = (id: number) => router.push(`/history/${id}` as any);
  const goRebook  = (id: number) => router.push(`/history/${id}` as any);

  const active    = hirings.filter(h => isActive(h.status));
  const completed = hirings.filter(h => h.status === 'completed');
  const cancelled = hirings.filter(h => h.status === 'cancelled');

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, gap: 12, paddingTop: Platform.OS === 'ios' ? 56 : 40 }}>
        <Text style={{ fontSize: 22, fontWeight: FontWeight.bold, color: '#111', marginBottom: 8 }}>Aktivitas</Text>
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </View>
    );
  }

  type ListItem =
    | { type: 'header'; key: string; label: string; active: boolean }
    | { type: 'card';   key: string; item: Hiring };

  const listData: ListItem[] = [];

  if (active.length > 0) {
    listData.push({ type: 'header', key: 'h-active', label: 'On Progress', active: true });
    active.forEach(h => listData.push({ type: 'card', key: `c-${h.id}`, item: h }));
  }
  if (completed.length > 0) {
    completed.forEach(h => {
      listData.push({ type: 'header', key: `h-comp-${h.id}`, label: 'Completed', active: false });
      listData.push({ type: 'card', key: `c-${h.id}`, item: h });
    });
  }
  if (cancelled.length > 0) {
    listData.push({ type: 'header', key: 'h-cancel', label: 'Dibatalkan', active: false });
    cancelled.forEach(h => listData.push({ type: 'card', key: `c-${h.id}`, item: h }));
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
      }}>
        <Text style={{ fontSize: 22, fontWeight: FontWeight.bold, color: '#111', textAlign: 'center' }}>
          Aktivitas
        </Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Belum ada aktivitas"
            description="Mulai cari dan rekrut penyedia jasa"
          />
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <SectionLabel label={item.label} active={item.active} />;
          }
          return (
            <TransactionCard
              item={item.item}
              onRate={goDetail}
              onRebook={goRebook}
            />
          );
        }}
      />
    </View>
  );
}
