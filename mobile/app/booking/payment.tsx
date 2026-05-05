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

const BLUE = Colors.navy;
const BLUE_SOFT = '#EEF3FF';
const YELLOW = Colors.gold;
const YELLOW_DARK = '#E5B82F';
const SURFACE = '#FFFFFF';
const PAGE_BG = '#F8FAFF';
const BORDER = '#E4EAFF';
const TEXT = '#111111';
const MUTED = '#6E7480';

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
        backgroundColor: selected ? BLUE_SOFT : SURFACE,
        borderRadius: 18,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? BLUE : BORDER,
        padding: 14,
        gap: Spacing.md,
        marginBottom: 10,
        opacity: pressed ? 0.88 : 1,
        shadowColor: selected ? BLUE : 'transparent',
        shadowOpacity: selected ? 0.09 : 0,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 7 },
        elevation: selected ? 3 : 0,
      })}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        {icons}
        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: TEXT }}>
          {label}
        </Text>
      </View>
      {/* Radio Circle */}
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 2,
        borderColor: selected ? BLUE : '#B8C3DD',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: SURFACE,
      }}>
        {selected && (
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: BLUE }} />
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
    registrationId: string;
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
      // Step 1: Create booking (links registration)
      const booking = await schedulingService.createBooking(
        { registration: Number(params.registrationId) },
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
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <Stack.Screen
        options={{
          title: 'Pembayaran',
          headerShown: true,
          headerStyle: { backgroundColor: PAGE_BG },
          headerTintColor: TEXT,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 22, paddingBottom: 140, gap: 16 }}
      >
        {/* ── Provider Summary ── */}
        <View style={{
          backgroundColor: SURFACE,
          borderRadius: 24,
          padding: 16,
          borderWidth: 1, borderColor: BORDER,
          gap: 12,
          shadowColor: BLUE,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
          elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: BLUE_SOFT, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="person" size={25} color={BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.xs, color: MUTED, fontWeight: FontWeight.semibold }}>{params.categoryName}</Text>
              <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: TEXT }} numberOfLines={1}>{params.providerName}</Text>
              <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: BLUE }}>{formatRupiah(servicePrice)}</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#EDF1FF' }} />

          {/* Date, Time, Location rows */}
          {[
            { icon: 'calendar-outline', label: 'Tanggal', value: formatDate(params.workDate ?? '') },
            { icon: 'time-outline', label: 'Waktu', value: params.startTime ?? '-' },
            { icon: 'location-outline', label: 'Lokasi', value: params.location ?? '-' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={icon as any} size={16} color={MUTED} />
                <Text style={{ fontSize: FontSize.sm, color: MUTED, fontWeight: FontWeight.medium }}>{label}</Text>
              </View>
              <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: TEXT, maxWidth: '55%', textAlign: 'right' }} numberOfLines={1}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Payment Methods ── */}
        <View style={{ backgroundColor: SURFACE, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: BORDER }}>
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: TEXT }}>
              Metode pembayaran
            </Text>
            <Text style={{ fontSize: FontSize.sm, color: MUTED, marginTop: 3 }}>
              Pilih metode untuk menyelesaikan rekrut.
            </Text>
          </View>

          <PaymentOption
            selected={paymentMethod === 'card'}
            value="card"
            label="Kartu Kredit/Debit"
            onSelect={setPaymentMethod}
            icons={
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {/* Mastercard */}
                <View style={{ width: 34, height: 22, borderRadius: 7, backgroundColor: '#EB001B', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF5F00', position: 'absolute', left: 8 }} />
                </View>
                {/* Visa */}
                <View style={{ width: 34, height: 22, borderRadius: 7, backgroundColor: '#1A1F71', justifyContent: 'center', alignItems: 'center' }}>
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
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#4B2FBF', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 6, fontWeight: FontWeight.bold, color: '#fff' }}>OVO</Text>
                </View>
                {/* GoPay */}
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#00AA13', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 5, fontWeight: FontWeight.bold, color: '#fff' }}>Go</Text>
                </View>
                {/* ShopeePay */}
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#EE4D2D', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 5, fontWeight: FontWeight.bold, color: '#fff' }}>SPay</Text>
                </View>
              </View>
            }
          />
        </View>

        {/* ── Transaction Detail ── */}
        <View style={{ backgroundColor: SURFACE, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: BORDER }}>
          <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: TEXT, marginBottom: Spacing.md }}>
            Detail Transaksi
          </Text>

          <TransactionRow label="Biaya Jasa" amount={servicePrice} />
          <TransactionRow label="Biaya Transportasi" amount={TRANSPORT_FEE} />
          <TransactionRow label="Biaya Platform" amount={PLATFORM_FEE} />

          <View style={{ height: 1, backgroundColor: '#EDF1FF', marginVertical: Spacing.sm }} />

          <TransactionRow label="Total" amount={total} bold />
        </View>

        {/* ── Error ── */}
        {error ? (
          <View style={{ backgroundColor: '#FEECEC', padding: Spacing.md, borderRadius: Radius.lg }}>
            <Text style={{ fontSize: FontSize.sm, color: Colors.error }}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Fixed Bottom CTA ── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: SURFACE,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
        borderTopWidth: 1, borderTopColor: BORDER,
        shadowColor: BLUE,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: -8 },
        elevation: 8,
      }}>
        <Pressable
          onPress={() => setShowConfirmModal(true)}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: YELLOW,
            borderRadius: 22,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed || loading ? 0.85 : 1,
            borderWidth: 1,
            borderColor: YELLOW_DARK,
            shadowColor: YELLOW_DARK,
            shadowOpacity: 0.22,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          })}
        >
          {loading ? (
            <ActivityIndicator size="small" color={TEXT} />
          ) : (
            <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: TEXT }}>
              Rekrut
            </Text>
          )}
        </Pressable>
      </View>

      {/* ── Confirmation Modal ── */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(17,24,39,0.56)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}
          onPress={() => setShowConfirmModal(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: SURFACE,
              borderRadius: 28,
              padding: 22,
              width: '100%',
              gap: 14,
              borderWidth: 1,
              borderColor: BORDER,
              shadowColor: '#0F172A',
              shadowOpacity: 0.18,
              shadowRadius: 28,
              shadowOffset: { width: 0, height: 16 },
              elevation: 10,
            }}
          >
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: BLUE_SOFT, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="shield-checkmark-outline" size={30} color={BLUE} />
              </View>
              <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: TEXT, textAlign: 'center' }}>
                Konfirmasi rekrut
              </Text>
            </View>
            <Text style={{ fontSize: FontSize.sm, color: MUTED, textAlign: 'center', lineHeight: 21 }}>
              Pastikan jadwal, lokasi, dan metode pembayaran sudah benar sebelum melanjutkan.
            </Text>
            <View style={{ backgroundColor: BLUE_SOFT, borderRadius: 18, padding: 14, gap: 8 }}>
              <TransactionRow label="Total pembayaran" amount={total} bold />
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm }}>
              <Pressable
                onPress={() => setShowConfirmModal(false)}
                style={({ pressed }) => ({
                  flex: 1, paddingVertical: 14, borderRadius: 18,
                  borderWidth: 1.5, borderColor: BORDER,
                  backgroundColor: SURFACE,
                  alignItems: 'center', opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: MUTED }}>
                  Batalkan
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => ({
                  flex: 1, paddingVertical: 14, borderRadius: 18,
                  backgroundColor: YELLOW,
                  borderWidth: 1,
                  borderColor: YELLOW_DARK,
                  alignItems: 'center', opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: TEXT }}>
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
