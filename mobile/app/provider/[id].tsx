import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { providerService } from '@/services/provider';
import { reviewService } from '@/services/review';
import { chatService } from '@/services/chat';
import { LoadingScreen } from '@/components/ui/loading-screen';
import type { ProviderProfile, Review } from '@/types';

const BLUE = '#315BE8';
const YELLOW = '#FFD45A';
const PALE_YELLOW = '#FFF0B8';
const TEXT = '#111111';
const BORDER = '#D9D9D9';

const fallbackReviews = [
  { client_name: 'Lisa', rating: 3, comment: 'Yayan sering terlambat', created_at: '2025-11-01T00:00:00.000Z' },
  { client_name: 'Rose', rating: 5, comment: 'Skill menyetir baik, selalu tepat waktu', created_at: '2025-04-01T00:00:00.000Z' },
  { client_name: 'Jisoo', rating: 4, comment: 'Bisa manual dan matic, kadang terlambat', created_at: '2025-01-01T00:00:00.000Z' },
  { client_name: 'Mingyu', rating: 5, comment: 'Aman dan sabar di jalan, recommended!', created_at: '2024-03-01T00:00:00.000Z' },
  { client_name: 'Krystal', rating: 4, comment: 'Komunikatif dan tahu rute dengan baik.', created_at: '2024-01-01T00:00:00.000Z' },
  { client_name: 'Sehun', rating: 4, comment: 'Pelayanan bagus, responsif kalau mendadak.', created_at: '2023-10-01T00:00:00.000Z' },
  { client_name: 'Rose', rating: 5, comment: 'Sudah beberapa kali pakai jasanya, selalu puas!', created_at: '2023-06-01T00:00:00.000Z' },
  { client_name: 'Jisoo', rating: 4, comment: 'Bisa manual dan matic, kadang terlambat', created_at: '2023-02-01T00:00:00.000Z' },
  { client_name: 'Karina', rating: 3, comment: 'Nyetirnya agak ngebut, bikin kurang nyaman.', created_at: '2022-12-01T00:00:00.000Z' },
  { client_name: 'Sungchan', rating: 4, comment: 'Tidak membantu dengan barang bawaan.', created_at: '2021-07-01T00:00:00.000Z' },
].map((item, index) => ({ id: -index - 1, hiring: 0, client: 0, client_email: '', provider: 0, provider_name: '', ...item }));

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'scope' | 'limitations'>('scope');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    Promise.all([providerService.getDetail(Number(id)), reviewService.list(Number(id))])
      .then(([providerRes, reviewRes]) => {
        setProvider(providerRes);
        setReviews(reviewRes.length ? reviewRes : fallbackReviews);
      })
      .catch(() => {
        setProvider(demoProvider(Number(id) || 1));
        setReviews(fallbackReviews);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const service = provider?.services?.[0];
  const fullName = provider ? `${provider.user.first_name} ${provider.user.last_name}`.trim() || 'Pekerja GaweIn' : '';
  const scopeItems = useMemo(() => lines(service?.service_scope, [
    'Mengantar dan menjemput sesuai jadwal',
    'Menjaga kebersihan dan kondisi kendaraan',
    'Membantu perjalanan dalam dan luar kota',
  ]), [service?.service_scope]);
  const limitationItems = useMemo(() => lines(service?.service_limitations, [
    'Tidak mengemudi kendaraan tidak layak jalan',
    'Tidak membawa barang berisiko tinggi',
    'Tidak menanggung biaya operasional',
  ]), [service?.service_limitations]);

  if (loading) return <LoadingScreen />;
  if (!provider) return <LoadingScreen message="Penyedia tidak ditemukan" />;

  if (showAllReviews) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ width: '100%', maxWidth: 390, alignSelf: 'center', paddingHorizontal: 34, paddingTop: 58, paddingBottom: 40 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <BackButton onPress={() => setShowAllReviews(false)} />
        <Text style={{ fontWeight: '900', color: TEXT, marginBottom: 14 }}>Ulasan</Text>
        <View style={{ gap: 9 }}>
          {reviews.map((review, index) => <ReviewCard key={`${review.id}-${index}`} review={review} index={index} />)}
        </View>
      </ScrollView>
    );
  }

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

          <View style={{ backgroundColor: PALE_YELLOW, borderRadius: 20, padding: 5, flexDirection: 'row', marginTop: 24, marginBottom: 14 }}>
            <Segment label="Cakupan Layanan" active={tab === 'scope'} onPress={() => setTab('scope')} />
            <Segment label="Batasan Layanan" active={tab === 'limitations'} onPress={() => setTab('limitations')} />
          </View>

          {(tab === 'scope' ? scopeItems : limitationItems).map((item) => (
            <Text key={item} style={{ color: TEXT, fontSize: 17, lineHeight: 27 }}>{'\u2022'}  {item}</Text>
          ))}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
            <Text style={{ color: TEXT, fontSize: 21, fontWeight: '900' }}>Ulasan ({reviews.length})</Text>
            <Pressable onPress={() => setShowAllReviews(true)}>
              <Text style={{ color: TEXT, fontSize: 12, textDecorationLine: 'underline' }}>Lihat Semua</Text>
            </Pressable>
          </View>

          <Text style={{ color: TEXT, fontSize: 15, marginBottom: 14 }}>Ulasan Terbaik</Text>
          <View style={{ gap: 9 }}>
            {reviews.slice(0, 3).map((review, index) => <ReviewCard key={`${review.id}-${index}`} review={review} index={index} />)}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
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
            {service ? (
              <Link href={`/booking/${service.id}`} asChild>
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

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, borderRadius: 16, backgroundColor: active ? YELLOW : 'transparent', height: 35, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: TEXT, fontSize: 16, fontWeight: active ? '900' : '500' }}>{label}</Text>
    </Pressable>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <View style={{ minHeight: 66, borderRadius: 13, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12, backgroundColor: '#FFFFFF' }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="person" size={28} color="#CCCCCC" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: TEXT, fontSize: 16, fontWeight: '900' }}>
          {review.client_name}, <Text style={{ fontSize: 13, fontWeight: '500' }}>{formatMonth(review.created_at)}</Text>
        </Text>
        <Text style={{ color: TEXT, fontSize: 13 }} numberOfLines={2}>{review.comment}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons key={star} name="star" size={14} color={star <= review.rating ? YELLOW : '#D4D4D4'} />
        ))}
      </View>
    </View>
  );
}

const styles = {
  bottomButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: YELLOW,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
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

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
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
    gender: 'Laki-laki',
    age: 33,
    city: 'Dalam Kota',
    city_id: null,
    years_of_experience: 7,
    is_verified: true,
    verification_status: 'verified',
    rating_average: '4.5',
    total_reviews: 10,
    created_at: '',
    updated_at: '',
    services: [{
      id,
      provider: id,
      category: null,
      category_name: 'Transportasi',
      provider_name: 'Yayan Sukayan',
      title: 'Sopir Mobil',
      description: 'Sopir mobil profesional',
      price: '3500000',
      city: 'Dalam Kota',
      city_id: null,
      service_scope: '',
      service_limitations: '',
      is_active: true,
      created_at: '',
      updated_at: '',
    }],
  };
}
