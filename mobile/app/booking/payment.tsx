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
import { FontWeight } from '@/constants/theme';

// ── Constants ──────────────────────────────────────────────
const BLUE   = '#315BE8';
const GOLD   = '#FFD45A';
const TRANSPORT_FEE = 50_000;
const PLATFORM_FEE  =  5_000;

type PaymentMethod = 'card' | 'ewallet';

// ── Rupiah formatter ───────────────────────────────────────
function fmtRp(value: string | number) {
  // Use parseFloat so "300000.00" → 300000, not 30000000
  const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  if (isNaN(num)) return 'Rp0';
  return `Rp${Math.round(num).toLocaleString('id-ID')}`;
}

// How many days between two YYYY-MM-DD strings (inclusive)
function daysBetween(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 1;
  const ms = new Date(endStr).getTime() - new Date(startStr).getTime();
  if (isNaN(ms) || ms < 0) return 1;
  return Math.round(ms / 86_400_000) + 1; // +1 to count both start & end day
}

// ── Date formatter ─────────────────────────────────────────
function fmtDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Payment Option Row ─────────────────────────────────────
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: selected ? BLUE : '#E5E7EB',
        padding: 14,
        gap: 12,
        marginBottom: 10,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {icons}
        <Text style={{ fontSize: 14, fontWeight: FontWeight.medium, color: '#111' }}>
          {label}
        </Text>
      </View>
      {/* Radio Circle */}
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 2,
        borderColor: selected ? BLUE : '#D1D5DB',
        justifyContent: 'center', alignItems: 'center',
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
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }}>
      <Text style={{
        fontSize: bold ? 15 : 13,
        fontWeight: bold ? FontWeight.bold : FontWeight.regular,
        color: bold ? '#111' : '#555',
      }}>
        {label}
      </Text>
      <Text style={{
        fontSize: bold ? 15 : 13,
        fontWeight: bold ? FontWeight.bold : FontWeight.semibold,
        color: bold ? '#111' : '#555',
      }}>
        {fmtRp(amount)}
      </Text>
    </View>
  );
}

// ── Card icons ─────────────────────────────────────────────
function CardIcons() {
  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
      {/* Mastercard */}
      <View style={{ width: 32, height: 20, borderRadius: 4, backgroundColor: '#EB001B', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF5F00', position: 'absolute', left: 9 }} />
      </View>
      {/* Visa */}
      <View style={{ width: 36, height: 20, borderRadius: 4, backgroundColor: '#1A1F71', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 8, fontWeight: FontWeight.bold, color: '#fff', fontStyle: 'italic' }}>VISA</Text>
      </View>
    </View>
  );
}

function EWalletIcons() {
  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
      {/* OVO */}
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#4B2FBF', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 6, fontWeight: FontWeight.bold, color: '#fff' }}>OVO</Text>
      </View>
      {/* GoPay */}
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#00AA13', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 6, fontWeight: FontWeight.bold, color: '#fff' }}>Go</Text>
      </View>
      {/* ShopeePay */}
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#EE4D2D', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 5, fontWeight: FontWeight.bold, color: '#fff' }}>SPay</Text>
      </View>
    </View>
  );
}

// ── Confirmation Modal ─────────────────────────────────────
function ConfirmModal({
  visible,
  loading,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 28 }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 28,
            width: '100%',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: FontWeight.bold, color: '#111', textAlign: 'center' }}>
            Apakah kamu yakin ingin merekrut?
          </Text>
          <Text style={{ fontSize: 13, color: '#777', textAlign: 'center', lineHeight: 20 }}>
            Pastikan metode pembayaran sudah benar sebelum melanjutkan proses
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 4 }}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 14, borderRadius: 12,
                borderWidth: 1.5, borderColor: '#D1D5DB',
                alignItems: 'center', opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: FontWeight.semibold, color: '#555' }}>Batalkan</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 14, borderRadius: 12,
                backgroundColor: GOLD,
                alignItems: 'center', opacity: pressed || loading ? 0.85 : 1,
              })}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#111" />
              ) : (
                <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: '#111' }}>Rekrut</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
    mode: string;           // 'harian' | 'rentang'
    workDate: string;       // start date YYYY-MM-DD
    endDate: string;        // end date YYYY-MM-DD (empty if harian)
    startTime: string;      // e.g. "10:00 AM"
    endTime: string;        // e.g. "05:00 PM" (empty if harian)
    location: string;
  }>();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  // Base price per day (parseFloat handles "300000.00" correctly)
  const basePricePerDay = Math.round(parseFloat(String(params.price ?? '0')) || 0);

  const isRentang = params.mode === 'rentang' && !!params.endDate;

  // For rentang: multiply by number of days; for harian: 1 day
  const numDays     = isRentang ? daysBetween(params.workDate ?? '', params.endDate ?? '') : 1;
  const servicePrice = basePricePerDay * numDays;
  const total        = servicePrice + TRANSPORT_FEE + PLATFORM_FEE;

  const dateDisplay = isRentang
    ? `${fmtDate(params.workDate)} – ${fmtDate(params.endDate)}`
    : fmtDate(params.workDate ?? '');

  const timeDisplay = isRentang && params.endTime
    ? `${params.startTime} – ${params.endTime}`
    : (params.startTime ?? '-');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const sessionKey = generateIdempotencyKey();
    try {
      // Step 1: Create booking
      const booking = await schedulingService.createBooking(
        { service: Number(params.serviceId) },
        { idempotencyKey: `bk-${sessionKey}` },
      );

      // Step 2: Create hiring
      const hiring = await hiringService.create(
        {
          booking_id: booking.id,
          agreed_price: servicePrice,
          work_date: params.workDate,
          location: params.location ?? '',
          notes: `Mode: ${params.mode ?? 'harian'} | Waktu: ${timeDisplay}`,
        },
        { idempotencyKey: `hi-${sessionKey}` },
      );

      router.replace({
        pathname: '/booking/success',
        params: { hiringId: String(hiring.id) },
      });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Blue Header ── */}
      <View style={{
        backgroundColor: BLUE,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}>
        <Pressable
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 14 }}>Kembali</Text>
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: FontWeight.bold, textAlign: 'center' }}>
          Rekrut
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 14 }}
      >
        {/* ── Booking Summary ── */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          padding: 16,
          gap: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: BLUE + '20',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Ionicons name="person" size={24} color={BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: '#777' }}>{params.categoryName}</Text>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: '#111' }}>
                {params.providerName}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: BLUE }}>
                {fmtRp(basePricePerDay)}
              </Text>
              {isRentang && numDays > 1 && (
                <Text style={{ fontSize: 11, color: '#777' }}>per hari</Text>
              )}
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />

          {/* Tanggal row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="calendar-outline" size={15} color="#777" />
              <Text style={{ fontSize: 13, color: '#777' }}>
                {isRentang ? 'Rentang' : 'Tanggal'}
              </Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: FontWeight.semibold, color: '#111', maxWidth: '58%', textAlign: 'right' }}>
              {dateDisplay}
            </Text>
          </View>

          {/* Waktu row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="time-outline" size={15} color="#777" />
              <Text style={{ fontSize: 13, color: '#777' }}>Waktu</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: FontWeight.semibold, color: '#111' }}>
              {timeDisplay}
            </Text>
          </View>
        </View>

        {/* ── Metode Pembayaran ── */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          padding: 16,
        }}>
          <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: '#111', marginBottom: 14 }}>
            Metode Pembayaran
          </Text>

          <PaymentOption
            selected={paymentMethod === 'card'}
            value="card"
            label="Kartu Kredit/Debit"
            onSelect={setPaymentMethod}
            icons={<CardIcons />}
          />

          <PaymentOption
            selected={paymentMethod === 'ewallet'}
            value="ewallet"
            label="E-Wallet"
            onSelect={setPaymentMethod}
            icons={<EWalletIcons />}
          />
        </View>

        {/* ── Detail Transaksi ── */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          padding: 16,
        }}>
          <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: '#111', marginBottom: 12 }}>
            Detail Transaksi
          </Text>

          <TransactionRow
            label={isRentang && numDays > 1
              ? `Biaya Jasa (${fmtRp(basePricePerDay)} × ${numDays} hari)`
              : 'Biaya Jasa'}
            amount={servicePrice}
          />
          <TransactionRow label="Biaya Transportasi" amount={TRANSPORT_FEE} />
          <TransactionRow label="Biaya Platform"     amount={PLATFORM_FEE}  />

          <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 }} />

          <TransactionRow label="Total" amount={total} bold />
        </View>

        {/* ── Error ── */}
        {!!error && (
          <View style={{ backgroundColor: '#FEE2E2', padding: 14, borderRadius: 10 }}>
            <Text style={{ fontSize: 13, color: '#DC2626' }}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Fixed Bottom CTA ── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
      }}>
        <Pressable
          onPress={() => setShowConfirm(true)}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: GOLD,
            borderRadius: 40,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed || loading ? 0.85 : 1,
          })}
        >
          <Text style={{ fontSize: 17, fontWeight: FontWeight.bold, color: '#111' }}>
            Rekrut
          </Text>
        </Pressable>
      </View>

      {/* ── Confirmation Modal ── */}
      <ConfirmModal
        visible={showConfirm}
        loading={loading}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </View>
  );
}
