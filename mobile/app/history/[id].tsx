import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable,
  TextInput, Modal, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { historyService } from '@/services/history';
import { reviewService } from '@/services/review';
import { ApiError } from '@/services/api';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { FontWeight } from '@/constants/theme';
import type { Hiring } from '@/types';

// ── Constants ──────────────────────────────────────────────
const BLUE      = '#315BE8';
const GOLD      = '#FFD45A';
const GOLD_SOFT = '#FFF9E6';
const TRANSPORT = 50_000;
const PLATFORM  =  5_000;

// ── Helpers ────────────────────────────────────────────────
function fmtRp(value: string | number) {
  const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  return `Rp${Math.round(num).toLocaleString('id-ID')}`;
}

function fmtDateTime(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    + ', '
    + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ── Price Row ──────────────────────────────────────────────
function PriceRow({ label, amount, bold = false }: { label: string; amount: number; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }}>
      <Text style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? FontWeight.bold : FontWeight.regular, color: bold ? '#111' : '#555' }}>
        {label}
      </Text>
      <Text style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? FontWeight.bold : FontWeight.semibold, color: bold ? '#111' : '#555' }}>
        {fmtRp(amount)}
      </Text>
    </View>
  );
}

// ── Star Picker ────────────────────────────────────────────
function StarPicker({ rating, onRate, readonly }: { rating: number; onRate?: (r: number) => void; readonly?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => !readonly && onRate?.(star)}
          hitSlop={8}
          disabled={readonly}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={36}
            color={star <= rating ? GOLD : '#D1D5DB'}
          />
        </Pressable>
      ))}
    </View>
  );
}

// ── Confirm Modal ──────────────────────────────────────────
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
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 28 }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%', alignItems: 'center', gap: 14 }}
        >
          <Text style={{ fontSize: 18, fontWeight: FontWeight.bold, color: '#111', textAlign: 'center' }}>
            Apakah kamu yakin ingin mengirim ulasan?
          </Text>
          <Text style={{ fontSize: 13, color: '#777', textAlign: 'center' }}>
            Pastikan penilaian sudah benar sebelum dikirim
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
              {loading
                ? <ActivityIndicator size="small" color="#111" />
                : <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: '#111' }}>Kirim</Text>
              }
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function HistoryDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();

  const [hiring, setHiring]           = useState<Hiring | null>(null);
  const [loading, setLoading]         = useState(true);
  const [rating, setRating]           = useState(0);
  const [comment, setComment]         = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    historyService.getDetail(Number(id))
      .then(h => { setHiring(h); setSubmitted(h.has_review); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const servicePrice = Math.round(parseFloat(String(hiring?.agreed_price ?? '0')) || 0);
  const total        = servicePrice + TRANSPORT + PLATFORM;

  const canSubmit = rating > 0 && comment.trim().length > 0;

  const handleSubmitReview = async () => {
    setSubmitting(true);
    setReviewError('');
    try {
      await reviewService.create({ hiring_id: Number(id), rating, comment: comment.trim() });
      setSubmitted(true);
      setShowModal(false);
      if (hiring) setHiring({ ...hiring, has_review: true });
    } catch (e) {
      setReviewError(e instanceof ApiError ? e.message : 'Gagal mengirim ulasan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRebook = () => {
    // Navigate to provider/service detail for rebooking
    if (hiring?.service) {
      router.push(`/booking/${hiring.service}` as any);
    }
  };

  if (loading) return <LoadingScreen message="Memuat detail..." />;
  if (!hiring)  return <LoadingScreen message="Tidak ditemukan" />;

  const isCompleted = hiring.status === 'completed';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={{
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
      }}>
        <Pressable
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}
        >
          <Ionicons name="chevron-back" size={20} color="#111" />
          <Text style={{ fontSize: 14, color: '#111' }}>Kembali</Text>
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: FontWeight.bold, color: '#111', textAlign: 'center' }}>
          Detail Transaksi
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── ID & Date ── */}
        <View style={{ paddingHorizontal: 2, gap: 2 }}>
          <Text style={{ fontSize: 13, color: '#555' }}>
            ID Transaksi MK-{String(hiring.id).padStart(4, '0')}
          </Text>
          <Text style={{ fontSize: 13, color: '#555' }}>
            {fmtDateTime(hiring.created_at)}
          </Text>
        </View>

        {/* ── Provider Card ── */}
        <View style={{
          backgroundColor: GOLD,
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}>
          <View style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: 'rgba(255,255,255,0.4)',
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Ionicons name="person" size={28} color="#111" />
          </View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: FontWeight.bold, color: '#111' }}>
              {hiring.provider_name}
            </Text>
            <Text style={{ fontSize: 13, color: '#333' }}>
              {hiring.category_name ?? hiring.service_title}
            </Text>
          </View>
        </View>

        {/* ── Detail Transaksi Card ── */}
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

          <PriceRow label="Biaya Jasa"         amount={servicePrice} />
          <PriceRow label="Biaya Transportasi" amount={TRANSPORT}    />
          <PriceRow label="Biaya Platform"     amount={PLATFORM}     />

          <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 }} />

          <PriceRow label="Total" amount={total} bold />
        </View>

        {/* ── Review Section (completed only) ── */}
        {isCompleted && (
          <View style={{
            backgroundColor: GOLD_SOFT,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#FFD45A80',
            padding: 16,
            gap: 14,
          }}>
            {submitted ? (
              /* ── Already reviewed ── */
              <>
                <Text style={{ fontSize: 14, fontWeight: FontWeight.bold, color: '#111', textAlign: 'center' }}>
                  Ulasan Terkirim ✓
                </Text>
                <StarPicker rating={rating || 5} readonly />
                {comment ? (
                  <Text style={{ fontSize: 13, color: '#555', textAlign: 'center', fontStyle: 'italic' }}>
                    "{comment}"
                  </Text>
                ) : null}
              </>
            ) : (
              /* ── Review form ── */
              <>
                <Text style={{ fontSize: 14, fontWeight: FontWeight.bold, color: '#111', textAlign: 'center' }}>
                  Berikan penilaian untuk pengalaman Anda!
                </Text>

                <StarPicker rating={rating} onRate={setRating} />

                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Ceritakan pengalamanmu..."
                  placeholderTextColor="#BDBDBD"
                  multiline
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    padding: 12,
                    fontSize: 13,
                    color: '#111',
                    minHeight: 72,
                    textAlignVertical: 'top',
                  }}
                />

                {!!reviewError && (
                  <Text style={{ fontSize: 12, color: '#DC2626', textAlign: 'center' }}>
                    {reviewError}
                  </Text>
                )}

                <Pressable
                  onPress={() => canSubmit && setShowModal(true)}
                  style={({ pressed }) => ({
                    backgroundColor: canSubmit ? BLUE : '#D1D5DB',
                    borderRadius: 40,
                    paddingVertical: 13,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: canSubmit ? '#fff' : '#9CA3AF' }}>
                    Kirim
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* ── Rebook Button ── */}
        <Pressable
          onPress={handleRebook}
          style={({ pressed }) => ({
            backgroundColor: GOLD,
            borderRadius: 40,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontSize: 17, fontWeight: FontWeight.bold, color: '#111' }}>Rebook →</Text>
        </Pressable>
      </ScrollView>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        visible={showModal}
        loading={submitting}
        onConfirm={handleSubmitReview}
        onCancel={() => setShowModal(false)}
      />
    </View>
  );
}
