import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { providerService } from '@/services/provider';
import { chatService } from '@/services/chat';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors } from '@/constants/theme';
import type { ProviderProfile } from '@/types';

const BLUE = Colors.navy;
const BLUE_DARK = Colors.navyDark;
const BLUE_SOFT = '#EEF3FF';
const YELLOW = Colors.gold;
const PALE_YELLOW = '#FFF0B8';
const TEXT = '#111111';
const MUTED = '#737373';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    providerService.getDetail(Number(id))
      .then(setProvider)
      .catch(() => {
        setProvider(demoProvider(Number(id) || 1));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const registration = provider?.registrations?.[0];
  const fullName = provider ? `${provider.user.first_name} ${provider.user.last_name}`.trim() || 'Pekerja GaweIn' : '';
  const experienceItems = useMemo(() => lines(registration?.pengalaman, [
    'Penyedia belum menambahkan detail pengalaman.',
  ]), [registration?.pengalaman]);

  if (loading) return <LoadingScreen />;
  if (!provider) return <LoadingScreen message="Penyedia tidak ditemukan" />;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ width: '100%', maxWidth: 390, alignSelf: 'center', paddingBottom: 96 }}>
        <View style={{ height: 200, backgroundColor: BLUE, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, paddingHorizontal: 34, paddingTop: 64 }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Kembali</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', marginTop: -66 }}>
          <View style={{ width: 118, height: 118, borderRadius: 59, borderWidth: 4, borderColor: '#FFFFFF', backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="person" size={80} color="#CCCCCC" />
          </View>
          <Text style={{ color: TEXT, fontSize: 25, fontWeight: '900', marginTop: 28 }}>{fullName}</Text>
          <Text style={{ color: TEXT, fontSize: 14, marginTop: 4 }}>{provider.age || 33} tahun</Text>
        </View>

        <View style={{ paddingHorizontal: 35, marginTop: 28 }}>
          <Text style={{ color: TEXT, fontSize: 19, lineHeight: 28, textAlign: 'justify' }}>
            {provider.bio || 'Saya sopir yang mengutamakan kenyamanan dan keamanan penumpang. Terbiasa mengemudi jarak dekat maupun jauh dengan disiplin waktu dan tanggung jawab tinggi.'}
          </Text>

          <DetailPanel
            category={registration?.category_name || 'Belum ada kategori'}
            location={[registration?.kota_name, registration?.provinsi_name].filter(Boolean).join(', ') || 'Belum ada lokasi'}
            years={`${registration?.tahun_pengalaman ?? (provider.years_of_experience || 0)} tahun`}
            price={formatPrice(registration?.gaji_diharapkan)}
          />

          <View style={styles.experienceBlock}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionMark} />
              <Text style={styles.sectionHeading}>Pengalaman Kerja</Text>
            </View>
            <View style={styles.experienceList}>
              {experienceItems.map((item) => (
                <View key={item} style={styles.experienceItem}>
                  <View style={styles.dot} />
                  <Text style={styles.experienceText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
            <Pressable 
              onPress={async () => {
                if (isChatting) return;
                setIsChatting(true);
                try {
                  const room = await chatService.getOrCreateRoom(provider.user.id);
                  router.push(`/messages/${room.id}` as any);
                } catch (error) {
                  Alert.alert('Error', 'Gagal membuka chat');
                } finally {
                  setIsChatting(false);
                }
              }} 
              disabled={isChatting}
              style={[styles.bottomButton, isChatting && { opacity: 0.7 }]}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={TEXT} />
              <Text style={styles.bottomText}>Kirim Pesan</Text>
            </Pressable>
            {registration ? (
              <Link href={`/booking/${registration.id}`} asChild>
                <Pressable style={styles.bottomButton}>
                  <Ionicons name="calendar-outline" size={18} color={TEXT} />
                  <Text style={styles.bottomText}>Atur Jadwal</Text>
                </Pressable>
              </Link>
            ) : (
              <Pressable onPress={() => Alert.alert('Jadwal', 'Layanan belum tersedia.')} style={styles.bottomButton}>
                <Ionicons name="calendar-outline" size={18} color={TEXT} />
                <Text style={styles.bottomText}>Atur Jadwal</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 16 }}>
      <Ionicons name="chevron-back" size={18} color={TEXT} />
      <Text style={{ color: TEXT }}>Kembali</Text>
    </Pressable>
  );
}

function DetailPanel({ category, location, years, price }: { category: string; location: string; years: string; price: string }) {
  return (
    <View style={styles.detailShell}>
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View>
            <Text style={styles.eyebrow}>PENDAFTARAN AKTIF</Text>
            <Text style={styles.detailTitle}>Detail Pekerjaan</Text>
          </View>
          <View style={styles.categoryPill}>
            <Ionicons name="sparkles-outline" size={13} color={BLUE_DARK} />
            <Text style={styles.categoryPillText} numberOfLines={1}>{category}</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <DetailRow icon="location-outline" label="Lokasi" value={location} />
          <DetailRow icon="briefcase-outline" label="Pengalaman" value={years} />
          <DetailRow icon="cash-outline" label="Gaji diharapkan" value={price} emphasis />
        </View>
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value, emphasis }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; emphasis?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, emphasis && styles.detailIconEmphasis]}>
        <Ionicons name={icon} size={18} color={emphasis ? TEXT : BLUE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, emphasis && styles.detailValueEmphasis]} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

const styles = {
  detailShell: {
    backgroundColor: '#F3F6FF',
    borderRadius: 28,
    padding: 5,
    marginTop: 24,
    shadowColor: BLUE,
    shadowOpacity: 0.13,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4EAFF',
    gap: 16,
  },
  detailHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  eyebrow: {
    color: BLUE,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 1.2,
  },
  detailTitle: {
    color: TEXT,
    fontSize: 21,
    fontWeight: '900' as const,
    marginTop: 3,
  },
  categoryPill: {
    maxWidth: 128,
    minHeight: 31,
    borderRadius: 16,
    backgroundColor: BLUE_SOFT,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    paddingHorizontal: 10,
  },
  categoryPillText: {
    color: BLUE_DARK,
    fontSize: 11,
    fontWeight: '900' as const,
    flexShrink: 1,
  },
  detailGrid: {
    gap: 10,
  },
  detailRow: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#F8FAFF',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF0FF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  detailIconEmphasis: {
    backgroundColor: YELLOW,
  },
  detailLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  detailValue: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '900' as const,
    lineHeight: 20,
  },
  detailValueEmphasis: {
    color: BLUE_DARK,
  },
  experienceBlock: {
    marginTop: 24,
  },
  sectionHeadingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 9,
    marginBottom: 11,
  },
  sectionMark: {
    width: 8,
    height: 22,
    borderRadius: 4,
    backgroundColor: YELLOW,
  },
  sectionHeading: {
    color: TEXT,
    fontSize: 19,
    fontWeight: '900' as const,
  },
  experienceList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 15,
    gap: 11,
  },
  experienceItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BLUE,
    marginTop: 9,
  },
  experienceText: {
    flex: 1,
    color: TEXT,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '600' as const,
  },
  bottomButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: YELLOW,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    shadowColor: '#B59112',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  bottomText: {
    color: TEXT,
    fontWeight: '900' as const,
    fontSize: 15,
  },
};

function lines(value: string | undefined, fallback: string[]) {
  const parsed = value?.split(/\r?\n|;/).map((line) => line.replace(/^[-*\u2022]\s*/, '').trim()).filter(Boolean);
  return parsed?.length ? parsed : fallback;
}

function formatPrice(value?: string) {
  const price = Number.parseInt(value || '0', 10);
  if (!price) return 'Belum ditentukan';
  return `Rp${price.toLocaleString('id-ID')}`;
}



function demoProvider(id: number): ProviderProfile {
  return {
    id,
    user: {
      id,
      email: 'yayan@gawein.test',
      username: 'yayan',
      first_name: 'Yayan',
      last_name: 'Sukayan',
      role: 'provider',
      is_active: true,
      is_verified: true,
      created_at: '',
      updated_at: '',
    },
    bio: 'Saya sopir yang mengutamakan kenyamanan dan keamanan penumpang. Terbiasa mengemudi jarak dekat maupun jauh dengan disiplin waktu dan tanggung jawab tinggi.',
    age: 33,
    years_of_experience: 7,
    is_verified: true,
    verification_status: 'verified',
    rating_average: '4.5',
    total_reviews: 10,
    kota_id: '3174',
    kota_name: 'Jakarta Selatan',
    provinsi_name: 'DKI Jakarta',
    created_at: '',
    updated_at: '',
    registrations: [{
      id,
      category: 1,
      category_name: 'Transportasi',
      provinsi_id: '31',
      kota_id: '3174',
      provinsi_name: 'DKI Jakarta',
      kota_name: 'Jakarta Selatan',
      pengalaman: 'Sopir mobil profesional selama 7 tahun.',
      tahun_pengalaman: 7,
      gaji_diharapkan: '3500000',
      created_at: '',
      updated_at: '',
    }],
  };
}
