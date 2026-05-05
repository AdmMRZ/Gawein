import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { providerService } from '@/services/provider';
import { Avatar } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { ProviderRegistration, ProviderProfile } from '@/types';

// ── Constants ──────────────────────────────────────────────
const BLUE = Colors.navy;
const BLUE_LIGHT = Colors.navyLight;
const GOLD = Colors.gold;
const GOLD_DARK = '#E5B82F';
const PAGE_BG = '#F8FAFF';
const SURFACE = '#FFFFFF';
const BORDER = '#E4EAFF';
const TEXT = '#111111';
const MUTED = '#6E7480';
const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Dummy provider for now
const DUMMY_PROVIDER = {
  name: 'Yayan Sukayan',
  role: 'Sopir Mobil',
  avatar: null as null,
};

// ── Helpers ────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// ── Time Picker Spinner Modal ───────────────────────────────
function TimePickerModal({
  visible,
  initial,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  initial: { hour: number; minute: number; ampm: 'AM' | 'PM' };
  onConfirm: (h: number, m: number, ampm: 'AM' | 'PM') => void;
  onCancel: () => void;
}) {
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initial.ampm);

  useEffect(() => {
    setHour(initial.hour);
    setMinute(initial.minute);
    setAmpm(initial.ampm);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, width: 300, alignItems: 'center', gap: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: FontWeight.bold, color: BLUE }}>Time</Text>

          {/* Spinners row */}
          <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
            {/* Hour */}
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => setHour(h => (h % 12) + 1)}>
                <Ionicons name="chevron-up" size={24} color={Colors.grayMed} />
              </Pressable>
              <View style={{ borderWidth: 1, borderColor: Colors.grayLight, borderRadius: 8, width: 56, height: 56, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, fontWeight: FontWeight.bold, color: '#111' }}>{pad(hour)}</Text>
              </View>
              <Text style={{ fontSize: 11, color: Colors.grayMed }}>hour</Text>
              <Pressable onPress={() => setHour(h => h <= 1 ? 12 : h - 1)}>
                <Ionicons name="chevron-down" size={24} color={Colors.grayMed} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 28, fontWeight: FontWeight.bold, color: '#111', marginBottom: 20 }}>:</Text>

            {/* Minute */}
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => setMinute(m => (m + 1) % 60)}>
                <Ionicons name="chevron-up" size={24} color={Colors.grayMed} />
              </Pressable>
              <View style={{ borderWidth: 1, borderColor: Colors.grayLight, borderRadius: 8, width: 56, height: 56, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, fontWeight: FontWeight.bold, color: '#111' }}>{pad(minute)}</Text>
              </View>
              <Text style={{ fontSize: 11, color: Colors.grayMed }}>min</Text>
              <Pressable onPress={() => setMinute(m => m <= 0 ? 59 : m - 1)}>
                <Ionicons name="chevron-down" size={24} color={Colors.grayMed} />
              </Pressable>
            </View>
          </View>

          {/* AM / PM */}
          <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: Colors.grayLight, borderRadius: 8, overflow: 'hidden' }}>
            {(['AM', 'PM'] as const).map(v => (
              <Pressable
                key={v}
                onPress={() => setAmpm(v)}
                style={{ paddingHorizontal: 20, paddingVertical: 8, backgroundColor: ampm === v ? BLUE : '#fff' }}
              >
                <Text style={{ color: ampm === v ? '#fff' : '#111', fontWeight: FontWeight.semibold }}>{v}</Text>
              </Pressable>
            ))}
          </View>

          {/* Buttons */}
          <Pressable
            onPress={() => onConfirm(hour, minute, ampm)}
            style={{ backgroundColor: BLUE, borderRadius: 12, width: '100%', paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: FontWeight.bold, fontSize: 16 }}>Lanjutkan</Text>
          </Pressable>
          <Pressable
            onPress={onCancel}
            style={{ borderWidth: 1, borderColor: Colors.grayLight, borderRadius: 12, width: '100%', paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#111', fontWeight: FontWeight.semibold, fontSize: 16 }}>Batalkan</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── Confirm Popup ──────────────────────────────────────────
function ConfirmModal({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%', alignItems: 'center', gap: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: FontWeight.bold, color: '#111', textAlign: 'center' }}>
            Apakah kamu yakin ingin mengonfirmasi jadwal ini?
          </Text>
          <Text style={{ fontSize: 13, color: Colors.grayMed, textAlign: 'center' }}>
            Pastikan data jadwal sudah benar sebelum dikonfirmasi
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <Pressable
              onPress={onCancel}
              style={{ flex: 1, borderWidth: 1, borderColor: Colors.grayLight, borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: FontWeight.semibold, color: '#111' }}>Batalkan</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{ flex: 1, backgroundColor: GOLD, borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: FontWeight.bold, color: '#111' }}>Lanjutkan</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Calendar ───────────────────────────────────────────────
function CalendarGrid({
  year,
  month,
  selectedStart,
  selectedEnd,
  mode,
  onSelectDay,
}: {
  year: number;
  month: number;
  selectedStart: number | null;
  selectedEnd: number | null;
  mode: 'harian' | 'rentang';
  onSelectDay: (day: number) => void;
}) {
  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

  const baseCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  const trailingEmptyCells = (7 - (baseCells.length % 7)) % 7;
  const cells: (number | null)[] = [
    ...baseCells,
    ...Array(trailingEmptyCells).fill(null),
  ];
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const inRange = (day: number) => {
    if (mode !== 'rentang' || !selectedStart || !selectedEnd) return false;
    return day > selectedStart && day < selectedEnd;
  };

  const isSelected = (day: number) =>
    day === selectedStart || (mode === 'rentang' && day === selectedEnd);

  const isPast = (day: number) =>
    isThisMonth && day < today.getDate();

  return (
    <View>
      {/* Day headers */}
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {DAY_LABELS.map(d => (
          <View key={d} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: BLUE }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day cells */}
      <View style={{ gap: 2 }}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={{ flexDirection: 'row' }}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return <View key={`empty-${weekIndex}-${dayIndex}`} style={{ flex: 1, aspectRatio: 1 }} />;
              }

              const selected = isSelected(day);
              const ranged = inRange(day);
              const past = isPast(day);
              const hasRange = mode === 'rentang' && selectedStart !== null && selectedEnd !== null;
              const isStart = hasRange && day === selectedStart;
              const isEnd = hasRange && day === selectedEnd;
              const showRangeFill = hasRange && (selected || ranged);

              return (
                <Pressable
                  key={day}
                  onPress={() => !past && onSelectDay(day)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    justifyContent: 'center',
                    alignItems: 'stretch',
                    opacity: past ? 0.45 : 1,
                  }}
                >
                  <View style={{
                    height: 36,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: showRangeFill ? BLUE_LIGHT : 'transparent',
                    borderTopLeftRadius: isStart ? 18 : 0,
                    borderBottomLeftRadius: isStart ? 18 : 0,
                    borderTopRightRadius: isEnd ? 18 : 0,
                    borderBottomRightRadius: isEnd ? 18 : 0,
                  }}>
                    <View style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: selected ? BLUE : 'transparent',
                    }}>
                      <Text style={{
                        fontSize: 13,
                        fontWeight: selected ? FontWeight.bold : FontWeight.regular,
                        color: past ? '#C7CBD3' : selected ? '#fff' : '#111',
                      }}>
                        {day}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Time display string ────────────────────────────────────
function timeStr(h: number, m: number, ampm: 'AM' | 'PM') {
  return `${pad(h)}:${pad(m)} ${ampm}`;
}

// ── Main Screen ────────────────────────────────────────────
export default function BookingScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [registration, setRegistration] = useState<ProviderRegistration | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Mode: harian = single day, rentang = date range
  const [mode, setMode] = useState<'harian' | 'rentang'>('harian');

  // Selected days
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);

  // Times
  const [startTime, setStartTime] = useState({ hour: 10, minute: 0, ampm: 'AM' as 'AM' | 'PM' });
  const [endTime, setEndTime] = useState({ hour: 10, minute: 0, ampm: 'AM' as 'AM' | 'PM' });
  const [location, setLocation] = useState('');

  // Modals
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const providers = await providerService.list();
        for (const p of providers) {
          const reg = p.registrations?.find((r: ProviderRegistration) => r.id === Number(id));
          if (reg) { setRegistration(reg); setProvider(p); break; }
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <LoadingScreen message="Memuat layanan..." />;

  const providerName = provider
    ? `${provider.user.first_name} ${provider.user.last_name}`.trim()
    : DUMMY_PROVIDER.name;
  const roleName = registration?.category_name ?? DUMMY_PROVIDER.role;

  const handleDaySelect = (day: number) => {
    if (mode === 'harian') {
      setSelectedStart(day);
      setSelectedEnd(null);
    } else {
      if (!selectedStart || (selectedStart && selectedEnd)) {
        setSelectedStart(day);
        setSelectedEnd(null);
      } else {
        if (day < selectedStart) {
          setSelectedEnd(selectedStart);
          setSelectedStart(day);
        } else {
          setSelectedEnd(day);
        }
      }
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const canProceed = selectedStart !== null && location.trim().length > 0;

  const handleSelanjutnya = () => {
    if (!canProceed) return;
    setShowConfirm(true);
  };

  const handleConfirmed = () => {
    setShowConfirm(false);
    router.push({
      pathname: '/booking/payment',
      params: {
        registrationId: String(registration?.id ?? ''),
        providerId: String(provider?.id ?? ''),
        providerName,
        categoryName: roleName,
        price: registration?.gaji_diharapkan ?? '0',
        workDate: `${calYear}-${pad(calMonth + 1)}-${pad(selectedStart!)}`,
        startTime: `${pad(startTime.hour)}:${pad(startTime.minute)}`,
        location: location.trim(),
      },
    });
  };

  // Date label helpers
  const dayOfWeek = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Blue Header ── */}
      <View style={{ backgroundColor: BLUE, paddingTop: insets.top + 12, paddingBottom: 28, paddingHorizontal: 22, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: 12, minHeight: 30 }}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: FontWeight.medium }}>Kembali</Text>
        </Pressable>
        <Text style={{ color: '#FFFFFF', fontSize: 25, fontWeight: FontWeight.bold, textAlign: 'center' }}>
          Atur jadwal kerja
        </Text>
        <Text style={{ color: '#E8EEFF', fontSize: 13, textAlign: 'center', marginTop: 7, lineHeight: 19 }}>
          Pilih tanggal, waktu, dan lokasi pekerjaan.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Provider Card ── */}
        <View style={{
          margin: 16,
          marginTop: -14,
          backgroundColor: SURFACE,
          borderRadius: 24,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          borderWidth: 1,
          borderColor: BORDER,
          shadowColor: BLUE,
          shadowOpacity: 0.1,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 5,
        }}>
          <Avatar name={providerName} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: FontWeight.bold, color: TEXT }} numberOfLines={1}>{providerName}</Text>
            <Text style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{roleName}</Text>
            <Text style={{ fontSize: 14, color: BLUE, fontWeight: FontWeight.bold, marginTop: 5 }}>
              Rp {parseInt(registration?.gaji_diharapkan || '0', 10).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* ── Calendar Card ── */}
        <View style={{ marginHorizontal: 16, backgroundColor: SURFACE, borderRadius: 24, borderWidth: 1, borderColor: BORDER, padding: 16 }}>
          {/* Month navigation */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Pressable onPress={prevMonth} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={BLUE} />
            </Pressable>
            <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: BLUE }}>
              {MONTH_NAMES[calMonth]} {calYear}
            </Text>
            <Pressable onPress={nextMonth} hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color={BLUE} />
            </Pressable>
          </View>

          <CalendarGrid
            year={calYear}
            month={calMonth}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            mode={mode}
            onSelectDay={handleDaySelect}
          />

          {/* ── Waktu / Mode toggle ── */}
          <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15, fontWeight: FontWeight.bold, color: BLUE, textDecorationLine: 'underline' }}>Waktu</Text>
            <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
              {(['harian', 'rentang'] as const).map(m => (
                <Pressable
                  key={m}
                  onPress={() => { setMode(m); setSelectedEnd(null); }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 6,
                    backgroundColor: mode === m ? '#F3F4F6' : '#fff',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: mode === m ? FontWeight.bold : FontWeight.regular, color: '#111', textTransform: 'capitalize' }}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Time rows (Rentang mode) ── */}
          {mode === 'rentang' && selectedStart ? (
            <View style={{ marginTop: 14, gap: 10 }}>
              {/* Start row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36 }}>
                  <Text style={{ fontSize: 11, color: Colors.grayMed }}>From</Text>
                  <Text style={{ fontSize: 22, fontWeight: FontWeight.bold, color: '#111' }}>{selectedStart}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: FontWeight.medium, color: '#111' }}>{MONTH_NAMES[calMonth]} {calYear}</Text>
                  <Text style={{ fontSize: 12, color: Colors.grayMed }}>{dayOfWeek(selectedStart)}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <Pressable onPress={() => setShowTimePicker('start')}>
                  <Ionicons name="time-outline" size={20} color="#555" />
                </Pressable>
                <Pressable
                  onPress={() => setShowTimePicker('start')}
                  style={{ backgroundColor: BLUE, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}
                >
                  <Text style={{ color: '#fff', fontWeight: FontWeight.bold, fontSize: 13 }}>
                    {timeStr(startTime.hour, startTime.minute, startTime.ampm)}
                  </Text>
                </Pressable>
              </View>

              {/* End row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36 }}>
                  <Text style={{ fontSize: 11, color: Colors.grayMed }}>To</Text>
                  <Text style={{ fontSize: 22, fontWeight: FontWeight.bold, color: '#111' }}>{selectedEnd ?? '—'}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: FontWeight.medium, color: '#111' }}>{MONTH_NAMES[calMonth]} {calYear}</Text>
                  <Text style={{ fontSize: 12, color: Colors.grayMed }}>{selectedEnd ? dayOfWeek(selectedEnd) : ''}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <Pressable onPress={() => setShowTimePicker('end')}>
                  <Ionicons name="time-outline" size={20} color="#555" />
                </Pressable>
                <Pressable
                  onPress={() => setShowTimePicker('end')}
                  style={{ backgroundColor: BLUE, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}
                >
                  <Text style={{ color: '#fff', fontWeight: FontWeight.bold, fontSize: 13 }}>
                    {timeStr(endTime.hour, endTime.minute, endTime.ampm)}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : mode === 'harian' && selectedStart ? (
            /* Single day time row */
            <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36 }}>
                <Text style={{ fontSize: 11, color: Colors.grayMed }}>Pada</Text>
                <Text style={{ fontSize: 22, fontWeight: FontWeight.bold, color: '#111' }}>{selectedStart}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: FontWeight.medium, color: '#111' }}>{MONTH_NAMES[calMonth]} {calYear}</Text>
                <Text style={{ fontSize: 12, color: Colors.grayMed }}>{dayOfWeek(selectedStart)}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Pressable onPress={() => setShowTimePicker('start')}>
                <Ionicons name="time-outline" size={20} color="#555" />
              </Pressable>
              <Pressable
                onPress={() => setShowTimePicker('start')}
                style={{ backgroundColor: BLUE, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}
              >
                <Text style={{ color: '#fff', fontWeight: FontWeight.bold, fontSize: 13 }}>
                  {timeStr(startTime.hour, startTime.minute, startTime.ampm)}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: SURFACE, borderRadius: 24, borderWidth: 1, borderColor: BORDER, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 15, backgroundColor: BLUE_LIGHT, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="location-outline" size={20} color={BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: TEXT, fontSize: 17, fontWeight: FontWeight.bold }}>Lokasi pekerjaan</Text>
              <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>Isi alamat tempat pekerjaan dilakukan.</Text>
            </View>
          </View>
          <View style={{ minHeight: 96, borderRadius: 18, backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 10 }}>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Contoh: Jl. Melati No. 12, Jakarta Selatan"
              placeholderTextColor="#A5AEC3"
              multiline
              textAlignVertical="top"
              style={{ color: TEXT, fontSize: 14, lineHeight: 20, minHeight: 72 }}
            />
          </View>
          {!location.trim() ? (
            <Text style={{ color: MUTED, fontSize: 12, marginTop: 8 }}>Lokasi wajib diisi sebelum lanjut ke pembayaran.</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        backgroundColor: SURFACE,
        borderTopWidth: 1, borderTopColor: BORDER,
        shadowColor: BLUE,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: -8 },
        elevation: 8,
      }}>
        <Pressable
          onPress={handleSelanjutnya}
          disabled={!canProceed}
          style={({ pressed }) => ({
            backgroundColor: canProceed ? GOLD : '#E5E7EB',
            borderRadius: 40,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            borderWidth: 1,
            borderColor: canProceed ? GOLD_DARK : '#D1D5DB',
          })}
        >
          <Text style={{ fontSize: 17, fontWeight: FontWeight.bold, color: canProceed ? TEXT : MUTED }}>Selanjutnya</Text>
        </Pressable>
      </View>

      {/* ── Time Picker Modal ── */}
      <TimePickerModal
        visible={showTimePicker !== null}
        initial={showTimePicker === 'end' ? endTime : startTime}
        onConfirm={(h, m, ap) => {
          if (showTimePicker === 'start') setStartTime({ hour: h, minute: m, ampm: ap });
          else setEndTime({ hour: h, minute: m, ampm: ap });
          setShowTimePicker(null);
        }}
        onCancel={() => setShowTimePicker(null)}
      />

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmed}
        onCancel={() => setShowConfirm(false)}
      />
    </View>
  );
}
