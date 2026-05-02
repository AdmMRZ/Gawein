import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { providerService } from '@/services/provider';
import { Avatar } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { Service, ProviderProfile } from '@/types';

// ── Format Helpers ─────────────────────────────────────────
const formatRupiah = (value: string | number) => {
  const num = typeof value === 'number' ? value : parseInt(value.replace(/\D/g, ''), 10);
  if (isNaN(num)) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID')}`;
};

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// ── Date Picker Modal ──────────────────────────────────────
function DatePickerModal({
  visible,
  value,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onCancel: () => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(value ? parseInt(value.split('-')[0]) : today.getFullYear());
  const [month, setMonth] = useState(value ? parseInt(value.split('-')[1]) - 1 : today.getMonth());
  const [day, setDay] = useState(value ? parseInt(value.split('-')[2]) : today.getDate());

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleConfirm = () => {
    const d = String(day).padStart(2, '0');
    const m = String(month + 1).padStart(2, '0');
    onConfirm(`${year}-${m}-${d}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onCancel}>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: Colors.slate900,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: Spacing.xl,
            gap: Spacing.lg,
          }}
        >
          <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' }}>
            Pilih Tanggal
          </Text>

          {/* Year Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl }}>
            <Pressable onPress={() => setYear(y => y - 1)}>
              <Ionicons name="chevron-back" size={24} color={Colors.primary} />
            </Pressable>
            <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, width: 60, textAlign: 'center' }}>{year}</Text>
            <Pressable onPress={() => setYear(y => y + 1)}>
              <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
            </Pressable>
          </View>

          {/* Month Chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {MONTHS.map((m, i) => (
              <Pressable
                key={m}
                onPress={() => setMonth(i)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6,
                  borderRadius: Radius.pill,
                  backgroundColor: month === i ? Colors.primary : Colors.grayLight,
                }}
              >
                <Text style={{ fontSize: FontSize.sm, color: month === i ? '#fff' : Colors.textMuted, fontWeight: FontWeight.medium }}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Day Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <Pressable
                key={d}
                onPress={() => setDay(d)}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  justifyContent: 'center', alignItems: 'center',
                  backgroundColor: day === d ? Colors.primary : 'transparent',
                }}
              >
                <Text style={{ fontSize: FontSize.sm, color: day === d ? '#fff' : Colors.textPrimary, fontWeight: day === d ? FontWeight.bold : FontWeight.regular }}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Pressable
              onPress={onCancel}
              style={{ flex: 1, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.grayMed, alignItems: 'center' }}
            >
              <Text style={{ color: Colors.textMuted, fontWeight: FontWeight.semibold }}>Batal</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={{ flex: 1, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: FontWeight.bold }}>Konfirmasi</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Time Picker Modal ──────────────────────────────────────
function TimePickerModal({
  visible,
  value,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  value: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}) {
  const [hour, setHour] = useState(value ? parseInt(value.split(':')[0]) : 8);
  const [minute, setMinute] = useState(value ? parseInt(value.split(':')[1]) : 0);

  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = [0, 15, 30, 45];

  const handleConfirm = () => {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    onConfirm(`${h}:${m}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onCancel}>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: Colors.slate900,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: Spacing.xl,
            gap: Spacing.lg,
          }}
        >
          <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' }}>
            Pilih Waktu
          </Text>

          <Text style={{ textAlign: 'center', fontSize: 40, fontWeight: FontWeight.bold, color: Colors.primary }}>
            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
          </Text>

          {/* Hour selector */}
          <View>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 8 }}>Jam</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {HOURS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => setHour(h)}
                  style={{
                    width: 44, height: 44, borderRadius: 22,
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: hour === h ? Colors.primary : Colors.grayLight,
                  }}
                >
                  <Text style={{ fontSize: FontSize.sm, color: hour === h ? '#fff' : Colors.textPrimary, fontWeight: hour === h ? FontWeight.bold : FontWeight.regular }}>
                    {String(h).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Minute selector */}
          <View>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 8 }}>Menit</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {MINUTES.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMinute(m)}
                  style={{
                    flex: 1, paddingVertical: 12,
                    borderRadius: Radius.md,
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: minute === m ? Colors.primary : Colors.grayLight,
                  }}
                >
                  <Text style={{ fontSize: FontSize.md, color: minute === m ? '#fff' : Colors.textPrimary, fontWeight: minute === m ? FontWeight.bold : FontWeight.regular }}>
                    :{String(m).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Pressable
              onPress={onCancel}
              style={{ flex: 1, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.grayMed, alignItems: 'center' }}
            >
              <Text style={{ color: Colors.textMuted, fontWeight: FontWeight.semibold }}>Batal</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={{ flex: 1, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: FontWeight.bold }}>Konfirmasi</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // service_id
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [workDate, setWorkDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');

  // Pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all providers and find the one that owns this service_id
        const providers = await providerService.list();
        for (const p of providers) {
          const svc = p.services?.find((s: Service) => s.id === Number(id));
          if (svc) {
            setService(svc);
            setProvider(p);
            break;
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingScreen message="Memuat detail layanan..." />;
  if (!service || !provider) return <LoadingScreen message="Layanan tidak ditemukan." />;

  const providerName = `${provider.user.first_name} ${provider.user.last_name}`.trim();
  const categoryName = service.category_name || 'Layanan Jasa';

  const isValid = workDate && startTime && location.trim().length > 0;

  const handleNext = () => {
    if (!isValid) {
      Alert.alert('Form Belum Lengkap', 'Harap isi tanggal, waktu, dan lokasi kerja terlebih dahulu.');
      return;
    }
    // Navigate to payment page with params
    router.push({
      pathname: '/booking/payment',
      params: {
        serviceId: String(service.id),
        providerId: String(provider.id),
        providerName,
        categoryName,
        price: service.price,
        workDate,
        startTime,
        location,
      },
    });
  };

  // ── Row component for info items ─────────────────────────
  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon as any} size={18} color={Colors.textMuted} />
        <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>{label}</Text>
      </View>
      <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary }}>{value}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Stack.Screen
        options={{
          title: 'Detail Pesanan',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.cream },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 140, gap: Spacing.md }}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Provider Info Card ── */}
          <View style={{
            backgroundColor: Colors.slate900,
            borderRadius: Radius.xl,
            padding: Spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
            borderWidth: 1, borderColor: Colors.grayLight,
          }}>
            <Avatar name={providerName} size={60} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium }}>{categoryName}</Text>
              <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 2 }}>
                {providerName}
              </Text>
              <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 2 }}>
                {formatRupiah(service.price)}
              </Text>
            </View>
            {provider.is_verified && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            )}
          </View>

          {/* ── Schedule Card ── */}
          <View style={{
            backgroundColor: Colors.slate900,
            borderRadius: Radius.xl,
            borderWidth: 1, borderColor: Colors.grayLight,
            overflow: 'hidden',
          }}>
            {/* Tanggal */}
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: Spacing.md,
                borderBottomWidth: 1, borderBottomColor: Colors.grayLight,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(99,102,241,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary }}>Tanggal</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: FontSize.sm, color: workDate ? Colors.textPrimary : Colors.textMuted }}>
                  {workDate ? formatDateDisplay(workDate) : 'Pilih tanggal'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </Pressable>

            {/* Waktu */}
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: Spacing.md,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(56,189,248,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={18} color={Colors.secondary} />
                </View>
                <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary }}>Waktu</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: FontSize.sm, color: startTime ? Colors.textPrimary : Colors.textMuted }}>
                  {startTime || 'Pilih waktu'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </Pressable>
          </View>

          {/* ── Location Input (Map-style) ── */}
          <View style={{
            backgroundColor: Colors.slate900,
            borderRadius: Radius.xl,
            borderWidth: 1, borderColor: Colors.grayLight,
            overflow: 'hidden',
          }}>
            {/* Location input */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              padding: Spacing.md,
              borderBottomWidth: 1, borderBottomColor: Colors.grayLight,
            }}>
              <Ionicons name="location-outline" size={20} color={Colors.textMuted} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Masukkan Lokasi"
                placeholderTextColor={Colors.textMuted}
                style={{ flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, paddingVertical: 0 }}
                returnKeyType="done"
              />
              {location.length > 0 && (
                <Pressable onPress={() => setLocation('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Map placeholder */}
            <View style={{ height: 180, backgroundColor: '#1a2a3a', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              {/* Simulated map grid */}
              <View style={{ position: 'absolute', inset: 0 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * 25, height: 1, backgroundColor: 'rgba(100,150,200,0.15)' }} />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <View key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: i * 50, width: 1, backgroundColor: 'rgba(100,150,200,0.15)' }} />
                ))}
              </View>

              {/* Map pin */}
              {location ? (
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 }}>
                    <Ionicons name="location" size={24} color="#fff" />
                  </View>
                  <View style={{ width: 10, height: 10, backgroundColor: 'rgba(239,68,68,0.3)', borderRadius: 5, marginTop: 4 }} />
                  <View style={{ marginTop: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.pill }}>
                    <Text style={{ color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.medium }} numberOfLines={1}>
                      {location}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Ionicons name="map-outline" size={40} color="rgba(100,150,200,0.4)" />
                  <Text style={{ fontSize: FontSize.xs, color: 'rgba(100,150,200,0.5)' }}>Masukkan lokasi untuk melihat peta</Text>
                </View>
              )}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

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
          onPress={handleNext}
          style={({ pressed }) => ({
            backgroundColor: isValid ? Colors.warning : Colors.grayMed,
            borderRadius: Radius.xl,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: isValid ? '#1a1a1a' : Colors.textMuted }}>
            Proses Pesanan
          </Text>
        </Pressable>
      </View>

      {/* ── Pickers ── */}
      <DatePickerModal
        visible={showDatePicker}
        value={workDate}
        onConfirm={(date) => { setWorkDate(date); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
      <TimePickerModal
        visible={showTimePicker}
        value={startTime}
        onConfirm={(time) => { setStartTime(time); setShowTimePicker(false); }}
        onCancel={() => setShowTimePicker(false)}
      />
    </View>
  );
}
