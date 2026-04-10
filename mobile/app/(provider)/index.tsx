import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { hiringService } from '@/services/hiring';
import { schedulingService } from '@/services/scheduling';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { Hiring, Booking } from '@/types';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [hirings, setHirings] = useState<Hiring[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [h, b] = await Promise.all([
        hiringService.list(),
        schedulingService.listBookings(),
      ]);
      setHirings(h);
      setBookings(b);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingScreen />;

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Provider';
  const activeHirings = hirings.filter((h) => h.status === 'in_progress');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const completedCount = hirings.filter((h) => h.status === 'completed').length;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: Colors.cream }}
      contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.xxl, paddingBottom: Spacing.section }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.navy} />
      }
    >
      {/* ── Greeting ──────────────────────────────── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <Avatar name={fullName} size={52} backgroundColor={Colors.navy} />
        <View>
          <Text
            style={{
              fontSize: FontSize.xxl,
              fontWeight: FontWeight.bold,
              color: Colors.navy,
              letterSpacing: -0.5,
            }}
          >
            Halo, {user?.first_name || 'Provider'}
          </Text>
          <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>
            Dashboard penyedia jasa
          </Text>
        </View>
      </View>

      {/* ── Stats ─────────────────────────────────── */}
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <StatCard label="Aktif" value={activeHirings.length} color={Colors.info} />
        <StatCard label="Pending" value={pendingBookings.length} color={Colors.gold} />
        <StatCard label="Selesai" value={completedCount} color={Colors.success} />
      </View>

      {/* ── Pending Bookings ──────────────────────── */}
      {pendingBookings.length > 0 && (
        <View style={{ gap: Spacing.md }}>
          <Text
            style={{
              fontSize: FontSize.lg,
              fontWeight: FontWeight.semibold,
              color: Colors.textPrimary,
              letterSpacing: -0.3,
            }}
          >
            Booking Menunggu
          </Text>
          {pendingBookings.map((b) => (
            <Card key={b.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary }}>
                    {b.service_title}
                  </Text>
                  <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>
                    {b.client_email}
                  </Text>
                </View>
                <StatusBadge status={b.status} />
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* ── Active Hirings ────────────────────────── */}
      {activeHirings.length > 0 && (
        <View style={{ gap: Spacing.md }}>
          <Text
            style={{
              fontSize: FontSize.lg,
              fontWeight: FontWeight.semibold,
              color: Colors.textPrimary,
              letterSpacing: -0.3,
            }}
          >
            Sedang Dikerjakan
          </Text>
          {activeHirings.map((h) => (
            <Card key={h.id}>
              <View style={{ gap: Spacing.xs }}>
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary }}>
                  {h.service_title}
                </Text>
                <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>
                  Klien: {h.client_name}
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
                  Rp {parseInt(h.agreed_price).toLocaleString('id-ID')}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: Radius.lg,
        borderCurve: 'continuous' as const,
        padding: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.xs,
        borderLeftWidth: 3,
        borderLeftColor: color,
        boxShadow: '0 2px 8px rgba(27, 42, 74, 0.06)',
      } as any}
    >
      <Text
        style={{
          fontSize: FontSize.xxl,
          fontWeight: FontWeight.bold,
          color: Colors.textPrimary,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted }}>
        {label}
      </Text>
    </View>
  );
}
