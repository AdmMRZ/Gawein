import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { schedulingService } from '@/services/scheduling';
import { hiringService } from '@/services/hiring';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { ApiError } from '@/services/api';

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'booking' | 'hiring'>('booking');
  const [bookingId, setBookingId] = useState<number | null>(null);

  const handleCreateBooking = async () => {
    setError('');
    setLoading(true);
    try {
      const booking = await schedulingService.createBooking({
        service: Number(id),
        notes: notes.trim(),
      });
      setBookingId(booking.id);
      setStep('hiring');
      Alert.alert('Booking dibuat', 'Lanjut isi detail hiring.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal membuat booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHiring = async () => {
    if (!bookingId || !agreedPrice || !workDate) {
      setError('Harap isi harga dan tanggal kerja');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const hiring = await hiringService.create({
        booking_id: bookingId,
        agreed_price: Number(agreedPrice),
        work_date: workDate,
        location: location.trim(),
        notes: notes.trim(),
      });
      Alert.alert('Berhasil', 'Hiring telah dibuat.', [
        { text: 'Lihat Detail', onPress: () => router.replace(`/hiring/${hiring.id}`) },
      ]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal membuat hiring');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: step === 'booking' ? 'Booking' : 'Isi Detail Hiring' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.xxl, paddingBottom: Spacing.section }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'booking' ? (
          <>
            <Card>
              <View style={{ gap: Spacing.lg }}>
                <Text
                  style={{
                    fontSize: FontSize.lg,
                    fontWeight: FontWeight.semibold,
                    color: Colors.textPrimary,
                    letterSpacing: -0.3,
                  }}
                >
                  Buat Booking
                </Text>
                <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 }}>
                  Kirim permintaan booking ke penyedia jasa. Setelah dikonfirmasi, kamu bisa lanjut ke tahap hiring.
                </Text>
                <Input
                  label="Catatan (opsional)"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Detail kebutuhan, waktu, dsb..."
                  multiline
                  style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }}
                />
              </View>
            </Card>

            {error ? (
              <Text style={{ fontSize: FontSize.sm, color: Colors.error }} selectable>{error}</Text>
            ) : null}

            <Button
              title="Kirim Booking"
              onPress={handleCreateBooking}
              loading={loading}
              fullWidth
              size="lg"
              variant="secondary"
            />
          </>
        ) : (
          <>
            <Card>
              <View style={{ gap: Spacing.lg }}>
                <Text
                  style={{
                    fontSize: FontSize.lg,
                    fontWeight: FontWeight.semibold,
                    color: Colors.textPrimary,
                    letterSpacing: -0.3,
                  }}
                >
                  Detail Hiring
                </Text>
                <Input
                  label="Harga yang disepakati (Rp) *"
                  value={agreedPrice}
                  onChangeText={setAgreedPrice}
                  placeholder="150000"
                  keyboardType="numeric"
                />
                <Input
                  label="Tanggal kerja (YYYY-MM-DD) *"
                  value={workDate}
                  onChangeText={setWorkDate}
                  placeholder="2026-04-15"
                />
                <Input
                  label="Lokasi kerja"
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Alamat lengkap"
                />
              </View>
            </Card>

            {error ? (
              <Text style={{ fontSize: FontSize.sm, color: Colors.error }} selectable>{error}</Text>
            ) : null}

            <Button
              title="Konfirmasi Hiring"
              onPress={handleCreateHiring}
              loading={loading}
              fullWidth
              size="lg"
            />
          </>
        )}
      </ScrollView>
    </>
  );
}
