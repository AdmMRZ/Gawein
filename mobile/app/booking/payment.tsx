import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { schedulingService } from '@/services/scheduling';
import { hiringService } from '@/services/hiring';
import { ApiError, generateIdempotencyKey } from '@/services/api';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

// ── Format Rupiah ──────────────────────────────────────────
const formatRupiah = (value: string | number) => {
  const num = typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, ''), 10);
  if (isNaN(num)) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID')}`;
};

// ── Payment Method Item ────────────────────────────────────
const TRANSPORT_FEE = 50000;
const PLATFORM_FEE = 5000;

type PaymentMethod = 'card' | 'ewallet';

function PaymentOption({
  selected,
  value,
  label,
  icons,
  onSelect,
}: {
  selected: boolean;
  value: PaymentMethod;
  label: string;
  icons: React.ReactNode;
  onSelect: (v: PaymentMethod) => void;
}) {
  return (
    <Pressable
      onPress={() => onSelect(value)}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: selected ? 'rgba(99,102,241,0.08)' : Colors.slate900,
        borderRadius: Radius.xl,
        borderWidth: 1.5,
        borderColor: selected ? Colors.primary : Colors.grayLight,
        padding: Spacing.md,
        gap: Spacing.md,
        marginBottom: Spacing.sm,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        {icons}
        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary }}>
          {label}
        </Text>
      </View>
      {/* Radio Circle */}
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 2,
        borderColor: selected ? Colors.primary : Colors.grayMed,
        justifyContent: 'center', alignItems: 'center',
      }}>
        {selected && (
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary }} />
        )}
      </View>
    </Pressable>
  );
}

// ── Transaction Row ────────────────────────────────────────
function TransactionRow({ label, amount, bold = false }: { label: string; amount: number; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
      <Text style={{
        fontSize: bold ? FontSize.md : FontSize.sm,
        fontWeight: bold ? FontWeight.bold : FontWeight.regular,
        color: bold ? Colors.textPrimary : Colors.textSecondary,
      }}>
        {label}
      </Text>
      <Text style={{
        fontSize: bold ? FontSize.md : FontSize.sm,
        fontWeight: bold ? FontWeight.bold : FontWeight.semibold,
        color: bold ? Colors.textPrimary : Colors.textSecondary,
      }}>
        {formatRupiah(amount)}
      </Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    serviceId: string;
    providerId: string;
    providerName: string;
    categoryName: string;
    price: string;
    workDate: string;
    startTime: string;
    location: string;
  }>();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const servicePrice = parseInt(String(params.price ?? '0').replace(/\D/g, ''), 10) || 0;
  const total = servicePrice + TRANSPORT_FEE + PLATFORM_FEE;

  const handleSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError('');

    // Generate unique session key for this recruitment attempt
    const sessionKey = generateIdempotencyKey();

    try {
      // Step 1: Create booking (links service)
      const booking = await schedulingService.createBooking(
        { service: Number(params.serviceId) },
        { idempotencyKey: `bk-${sessionKey}` }
      );

      // Step 2: Create hiring with booking reference
      const hiring = await hiringService.create(
        {
          booking_id: booking.id,
          agreed_price: servicePrice,
          work_date: params.workDate,
          location: params.location ?? '',
          notes: `Waktu: ${params.startTime ?? ''}`,
        },
        { idempotencyKey: `hi-${sessionKey}` }
      );

      // Step 3: Navigate to success page
      router.replace({
        pathname: '/booking/success',
        params: { hiringId: String(hiring.id) },
      });
    } catch (e) {
      const msg = e instanceof ApiError
        ? e.message
        : 'Terjadi kesalahan. Silakan coba lagi.';
      setError(msg);
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Stack.Screen
        options={{
          title: 'Pembayaran',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 140, gap: Spacing.md }}
      >
        {/* ── Provider Summary ── */}
        <View style={{
          backgroundColor: Colors.slate900,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          borderWidth: 1, borderColor: Colors.grayLight,
          gap: Spacing.sm,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="person" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted }}>{params.categoryName}</Text>
              <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{params.providerName}</Text>
              <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary }}>{formatRupiah(servicePrice)}</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: Colors.grayLight }} />

          {/* Date, Time, Location rows */}
          {[
            { icon: 'calendar-outline', label: 'Tanggal', value: formatDate(params.workDate ?? '') },
            { icon: 'time-outline', label: 'Waktu', value: params.startTime ?? '-' },
            { icon: 'location-outline', label: 'Lokasi', value: params.location ?? '-' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
                <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>{label}</Text>
              </View>
              <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, maxWidth: '55%', textAlign: 'right' }} numberOfLines={1}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Payment Methods ── */}
        <View style={{ backgroundColor: Colors.slate900, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.grayLight }}>
          <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md }}>
            Metode Pembayaran
          </Text>

          <PaymentOption
            selected={paymentMethod === 'card'}
            value="card"
            label="Kartu Kredit/Debit"
            onSelect={setPaymentMethod}
            icons={
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {/* Mastercard */}
                <View style={{ width: 28, height: 18, borderRadius: 4, backgroundColor: '#EB001B', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF5F00', position: 'absolute', left: 8 }} />
                </View>
                {/* Visa */}
                <View style={{ width: 28, height: 18, borderRadius: 4, backgroundColor: '#1A1F71', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 7, fontWeight: FontWeight.bold, color: '#fff', fontStyle: 'italic' }}>VISA</Text>
                </View>
              </View>
            }
          />

          <PaymentOption
            selected={paymentMethod === 'ewallet'}
            value="ewallet"
            label="E-Wallet"
            onSelect={setPaymentMethod}
            icons={
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {/* OVO */}
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#4B2FBF', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 6, fontWeight: FontWeight.bold, color: '#fff' }}>OVO</Text>
                </View>
                {/* GoPay */}
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#00AA13', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 5, fontWeight: FontWeight.bold, color: '#fff' }}>Go</Text>
                </View>
                {/* ShopeePay */}
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#EE4D2D', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 5, fontWeight: FontWeight.bold, color: '#fff' }}>SPay</Text>
                </View>
              </View>
            }
          />
        </View>

        {/* ── Transaction Detail ── */}
        <View style={{ backgroundColor: Colors.slate900, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.grayLight }}>
          <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md }}>
            Detail Transaksi
          </Text>

          <TransactionRow label="Biaya Jasa" amount={servicePrice} />
          <TransactionRow label="Biaya Transportasi" amount={TRANSPORT_FEE} />
          <TransactionRow label="Biaya Platform" amount={PLATFORM_FEE} />

          <View style={{ height: 1, backgroundColor: Colors.grayLight, marginVertical: Spacing.sm }} />

          <TransactionRow label="Total" amount={total} bold />
        </View>

        {/* ── Error ── */}
        {error ? (
          <View style={{ backgroundColor: Colors.errorSoft, padding: Spacing.md, borderRadius: Radius.lg }}>
            <Text style={{ fontSize: FontSize.sm, color: Colors.error }}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Fixed Bottom CTA ── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.cream,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
        borderTopWidth: 1, borderTopColor: Colors.grayLight,
      }}>
        <Pressable
          onPress={() => setShowConfirmModal(true)}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: Colors.warning,
            borderRadius: Radius.xl,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed || loading ? 0.85 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1a1a1a" />
          ) : (
            <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#1a1a1a' }}>
              Rekrut
            </Text>
          )}
        </Pressable>
      </View>

      {/* ── Confirmation Modal ── */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}
          onPress={() => setShowConfirmModal(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: Colors.slate900,
              borderRadius: Radius.xl,
              padding: Spacing.xl,
              width: '100%',
              gap: Spacing.md,
            }}
          >
            <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' }}>
              Apakah kamu yakin ingin merekrut?
            </Text>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              Pastikan metode pembayaran sudah benar sebelum melanjutkan proses
            </Text>

            <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm }}>
              <Pressable
                onPress={() => setShowConfirmModal(false)}
                style={({ pressed }) => ({
                  flex: 1, paddingVertical: 14, borderRadius: Radius.lg,
                  borderWidth: 1.5, borderColor: Colors.grayMed,
                  alignItems: 'center', opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textMuted }}>
                  Batalkan
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => ({
                  flex: 1, paddingVertical: 14, borderRadius: Radius.lg,
                  backgroundColor: Colors.warning,
                  alignItems: 'center', opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#1a1a1a' }}>
                  Rekrut
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
