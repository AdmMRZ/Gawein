import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { schedulingService } from '@/services/scheduling';
import { hiringService } from '@/services/hiring';
import { Button } from '@/components/ui/button';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '@/services/api';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // service_id
  const router = useRouter();
  
  const [workDate, setWorkDate] = useState('');
  const [location, setLocation] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted = cleaned.substring(0, 4);
    if (cleaned.length > 4) formatted += '-' + cleaned.substring(4, 6);
    if (cleaned.length > 6) formatted += '-' + cleaned.substring(6, 8);
    setWorkDate(formatted);
  };

  const submitOrder = async () => {
    if (!workDate || !location || !agreedPrice) {
      setError('Harap lengkapi semua kolom wajib.');
      return;
    }

    const isValidDate = (dateString: string) => {
      const regEx = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateString.match(regEx)) return false; 
      const d = new Date(dateString);
      const dNum = d.getTime();
      if (!dNum && dNum !== 0) return false; 
      return d.toISOString().slice(0,10) === dateString;
    };

    if (!isValidDate(workDate)) {
      setError('Format tanggal tidak valid. Gunakan format YYYY-MM-DD sungguhan (Contoh: 2026-04-15).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const booking = await schedulingService.createBooking({
        service: Number(id),
        notes: notes.trim(),
      });
      const hiring = await hiringService.create({
        booking_id: booking.id,
        agreed_price: Number(agreedPrice.replace(/[^0-9]/g, '')),
        work_date: workDate,
        location: location.trim(),
        notes: notes.trim(),
      });
      router.replace(`/hiring/${hiring.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Terjadi kesalahan saat memproses pesanan Anda.');
      setLoading(false);
    }
  };

  const Divider = () => (
    <View style={{ height: 1, backgroundColor: Colors.grayLight, marginVertical: Spacing.md }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Stack.Screen options={{ title: 'Ringkasan Pesanan', headerShadowVisible: false, headerStyle: { backgroundColor: Colors.cream } }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 120, gap: Spacing.md }}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <View style={{ backgroundColor: Colors.errorSoft, padding: Spacing.md, borderRadius: Radius.sm }}>
              <Text style={{ fontSize: FontSize.sm, color: Colors.error }}>{error}</Text>
            </View>
          ) : null}

          {/* MAIN CARD (Shadcn style structure) */}
          <View style={{ 
            backgroundColor: Colors.slate900, 
            borderRadius: Radius.xl, 
            borderWidth: 1, 
            borderColor: Colors.grayLight,
            shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8
          }}>
            <View style={{ padding: Spacing.lg }}>
              <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: -0.5 }}>
                Order Summary
              </Text>
            </View>
            <Divider />
            
            <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.md }}>
              {/* Delivery Address / Location */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs }}>
                  <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
                  <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>Lokasi Pekerjaan</Text>
                </View>
                <TextInput 
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Masukkan alamat lengkap..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  style={{
                    backgroundColor: Colors.cream, color: Colors.textPrimary, fontSize: FontSize.sm,
                    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.grayMed
                  }}
                />
              </View>

              <Divider />

              {/* Schedule */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs }}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
                  <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>Tanggal Pelaksanaan</Text>
                </View>
                <TextInput 
                  value={workDate}
                  onChangeText={handleDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholder="Contoh: 2026-04-15"
                  placeholderTextColor={Colors.textMuted}
                  style={{
                    backgroundColor: Colors.cream, color: Colors.textPrimary, fontSize: FontSize.sm,
                    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.grayMed,
                    letterSpacing: 1
                  }}
                />
              </View>

              <Divider />

              {/* Price / Billing */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs }}>
                  <Ionicons name="card-outline" size={16} color={Colors.textMuted} />
                  <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>Harga Kesepakatan (Rp)</Text>
                </View>
                <TextInput 
                  value={agreedPrice}
                  onChangeText={setAgreedPrice}
                  keyboardType="numeric"
                  placeholder="Masukkan harga..."
                  placeholderTextColor={Colors.textMuted}
                  style={{
                    backgroundColor: Colors.cream, color: Colors.textPrimary, fontSize: FontSize.sm,
                    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.grayMed
                  }}
                />
              </View>

              <Divider />

              {/* Notes */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs }}>
                  <Ionicons name="document-text-outline" size={16} color={Colors.textMuted} />
                  <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>Catatan (Opsional)</Text>
                </View>
                <TextInput 
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder="Instruksi khusus untuk penyedia..."
                  placeholderTextColor={Colors.textMuted}
                  style={{
                    backgroundColor: Colors.cream, color: Colors.textPrimary, fontSize: FontSize.sm,
                    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.grayMed,
                    height: 80, textAlignVertical: 'top'
                  }}
                />
              </View>

              <Divider />

              {/* Summary Footer */}
              <View>
                <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>Detail Transaksi</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm }}>
                  <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>Total Biaya</Text>
                  <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>
                    {agreedPrice ? `Rp ${parseInt(agreedPrice).toLocaleString('id-ID')}` : 'Rp 0'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER CHECKOUT (Fixed at bottom) */}
      <View style={{ 
        position: 'absolute', bottom: Platform.OS === 'ios' ? 24 : 16, left: 20, right: 20, 
        backgroundColor: Colors.slate900, 
        padding: Spacing.md, 
        borderRadius: Radius.xl, 
        borderWidth: 1, borderColor: Colors.grayLight,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 12
      }}>
        <View>
          <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium }}>Total Pembayaran</Text>
          <Text style={{ fontSize: FontSize.xl, color: Colors.primary, fontWeight: FontWeight.bold }}>
            {agreedPrice ? `Rp ${parseInt(agreedPrice).toLocaleString('id-ID')}` : '-'}
          </Text>
        </View>
        <Button
          title="Place Order"
          onPress={submitOrder}
          loading={loading}
          size="lg"
          style={{ width: 140, borderRadius: Radius.md, backgroundColor: Colors.primary }}
        />
      </View>
    </View>
  );
}
