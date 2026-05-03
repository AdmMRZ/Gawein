import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { providerService } from '@/services/provider';
import { Avatar } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { Service, ProviderProfile } from '@/types';

// ── Constants ──────────────────────────────────────────────
const BLUE = '#315BE8';
const BLUE_LIGHT = '#E8EEFF';
const GOLD = '#FFD45A';
const DAY_LABELS = ['SAN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
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

function formatDateLabel(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
  return `${MONTH_NAMES[month]} ${year}\n${dayName}`;
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

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => {
          if (!day) return <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;

          const selected = isSelected(day);
          const ranged = inRange(day);
          const past = isPast(day);

          return (
            <Pressable
              key={day}
              onPress={() => !past && onSelectDay(day)}
              style={{
                width: `${100 / 7}%`,
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: ranged ? BLUE_LIGHT : 'transparent',
              }}
            >
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: selected ? BLUE : 'transparent',
              }}>
                <Text style={{
                  fontSize: 13,
                  fontWeight: selected ? FontWeight.bold : FontWeight.regular,
                  color: past ? '#ccc' : selected ? '#fff' : '#111',
                }}>
                  {day}
                </Text>
              </View>
            </Pressable>
          );
        })}
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

  const [service, setService] = useState<Service | null>(null);
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

  // Modals
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const providers = await providerService.list();
        for (const p of providers) {
          const svc = p.services?.find((s: Service) => s.id === Number(id));
          if (svc) { setService(svc); setProvider(p); break; }
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <LoadingScreen message="Memuat layanan..." />;

  const providerName = provider
    ? `${provider.user.first_name} ${provider.user.last_name}`.trim()
    : DUMMY_PROVIDER.name;
  const roleName = service?.category_name ?? DUMMY_PROVIDER.role;

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

  const canProceed = selectedStart !== null;

  const handleSelanjutnya = () => {
    if (!canProceed) return;
    setShowConfirm(true);
  };

  const handleConfirmed = () => {
    setShowConfirm(false);
    const startDateStr = `${calYear}-${pad(calMonth + 1)}-${pad(selectedStart!)}`;
    const endDateStr = selectedEnd
      ? `${calYear}-${pad(calMonth + 1)}-${pad(selectedEnd)}`
      : '';
    router.push({
      pathname: '/booking/payment',
      params: {
        serviceId: String(service?.id ?? ''),
        providerId: String(provider?.id ?? ''),
        providerName,
        categoryName: roleName,
        price: service?.price ?? '0',
        mode,                                               // 'harian' | 'rentang'
        workDate: startDateStr,
        endDate: endDateStr,
        startTime: `${pad(startTime.hour)}:${pad(startTime.minute)} ${startTime.ampm}`,
        endTime: mode === 'rentang' && endDateStr
          ? `${pad(endTime.hour)}:${pad(endTime.minute)} ${endTime.ampm}`
          : '',
        location: '',
      },
    });
  };

  // Date label helpers
  const dayOfWeek = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Blue Header ── */}
      <View style={{ backgroundColor: BLUE, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 14 }}>Kembali</Text>
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: FontWeight.bold, textAlign: 'center' }}>
          Jadwalkan Sekarang!
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Provider Card ── */}
        <View style={{ margin: 16, backgroundColor: '#FFF9E6', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={providerName} size={56} />
          <View>
            <Text style={{ fontSize: 17, fontWeight: FontWeight.bold, color: '#111' }}>{providerName}</Text>
            <Text style={{ fontSize: 13, color: Colors.grayMed }}>{roleName}</Text>
          </View>
        </View>

        {/* ── Calendar Card ── */}
        <View style={{ marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 }}>
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
                  <Text style={{ fontSize: 11, color: Colors.grayMed }}>Dari</Text>
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
                  <Text style={{ fontSize: 11, color: Colors.grayMed }}>Sampai</Text>
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
                <Text style={{ fontSize: 11, color: Colors.grayMed }}>Dari</Text>
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
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
      }}>
        <Pressable
          onPress={handleSelanjutnya}
          style={({ pressed }) => ({
            backgroundColor: GOLD,
            borderRadius: 40,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontSize: 17, fontWeight: FontWeight.bold, color: '#111' }}>Selanjutnya →</Text>
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
