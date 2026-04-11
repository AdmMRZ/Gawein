import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { useLocalSearchParams, Link, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { providerService } from '@/services/provider';
import { reviewService } from '@/services/review';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { ProviderProfile, Review } from '@/types';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prov, revs] = await Promise.all([
          providerService.getDetail(Number(id)),
          reviewService.list(Number(id)),
        ]);
        setProvider(prov);
        setReviews(revs);
      } catch {} finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!provider) return <LoadingScreen message="Penyedia tidak ditemukan" />;

  const fullName = `${provider.user.first_name} ${provider.user.last_name}`.trim();
  const rating = parseFloat(provider.rating_average || '0');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* -- BANNER & HEADER -- */}
        <View style={{ height: 220, backgroundColor: Colors.slate900, position: 'relative' }}>
          <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}>
            <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </Pressable>
          </View>
          {/* subtle pattern in background */}
          <Ionicons name="briefcase" size={150} color="rgba(255,255,255,0.03)" style={{ position: 'absolute', right: -20, bottom: -40, transform: [{ rotate: '-15deg' }] }} />
        </View>

        {/* -- PROFILE SHEET -- */}
        <View style={{ 
          marginTop: -40, 
          backgroundColor: Colors.cream, 
          borderTopLeftRadius: 32, 
          borderTopRightRadius: 32, 
          paddingHorizontal: Spacing.xl, 
          paddingTop: 30,
          position: 'relative' 
        }}>
          {/* Floating Avatar */}
          <View style={{ position: 'absolute', top: -50, left: Spacing.xl, borderWidth: 4, borderColor: Colors.cream, borderRadius: 100 }}>
            <Avatar name={fullName} size={90} />
          </View>

          {/* Title & Trust Badges */}
          <View style={{ marginTop: 40, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: FontSize.display, fontWeight: FontWeight.bold, color: Colors.navy, letterSpacing: -1 }}>
                {fullName}
              </Text>
              {provider.is_verified && <Ionicons name="checkmark-circle" size={24} color={Colors.navy} />}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={16} color={Colors.warning} />
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{rating > 0 ? rating.toFixed(1) : 'Baru'}</Text>
                <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary }}>({provider.total_reviews} ulasan)</Text>
              </View>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.grayMed }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-sharp" size={16} color={Colors.textSecondary} />
                <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary }}>{provider.location || 'Lokasi tidak diketahui'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: 4 }}>
              <Badge label={`${provider.years_of_experience} thn pengalaman`} variant="info" />
              {provider.is_verified && <Badge label="Terpercaya" variant="success" />}
            </View>
          </View>

          {/* Bio Section */}
          {provider.bio ? (
            <Text style={{ fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24, marginTop: Spacing.lg }}>
              {provider.bio}
            </Text>
          ) : null}

          <View style={{ height: 1, backgroundColor: Colors.grayLight, marginVertical: Spacing.xl }} />

          {/* -- SERVICES LIST (GOJEK MENU STYLE) -- */}
          <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: Spacing.md, letterSpacing: -0.5 }}>
            Pilih Layanan
          </Text>
          
          <View style={{ gap: Spacing.md }}>
            {provider.services?.length ? provider.services.map((service) => (
              <View key={service.id} style={{ 
                backgroundColor: Colors.white, 
                borderRadius: Radius.lg, 
                padding: Spacing.md, 
                borderWidth: 1, 
                borderColor: Colors.grayLight,
                flexDirection: 'row',
                gap: Spacing.md
              }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy, letterSpacing: -0.3 }}>
                    {service.title}
                  </Text>
                  <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 }} numberOfLines={2}>
                    {service.description}
                  </Text>
                  <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.navy, marginTop: 4 }}>
                    Rp {parseInt(service.price).toLocaleString('id-ID')}
                  </Text>
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <Link href={`/booking/${service.id}`} asChild>
                    <Pressable style={({ pressed }) => ({
                      backgroundColor: Colors.primary,
                      paddingHorizontal: Spacing.lg,
                      paddingVertical: 10,
                      borderRadius: Radius.pill,
                      opacity: pressed ? 0.8 : 1,
                    })}>
                      <Text style={{ color: Colors.textPrimary, fontWeight: FontWeight.bold, fontSize: FontSize.sm }}>Pesan</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            )) : (
              <View style={{ alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.white, borderRadius: Radius.lg }}>
                <Text style={{ color: Colors.textSecondary }}>Belum ada layanan tersedia.</Text>
              </View>
            )}
          </View>

          <View style={{ height: 1, backgroundColor: Colors.grayLight, marginVertical: Spacing.xl }} />

          {/* -- REVIEWS -- */}
          <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: Spacing.md, letterSpacing: -0.5 }}>
            Ulasan Pelanggan
          </Text>
          <View style={{ gap: Spacing.md }}>
            {reviews.length === 0 ? (
              <View style={{ alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.white, borderRadius: Radius.lg }}>
                <Ionicons name="chatbubbles-outline" size={40} color={Colors.grayMed} style={{ marginBottom: Spacing.sm }} />
                <Text style={{ color: Colors.textSecondary }}>Belum ada ulasan</Text>
              </View>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={{ backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.grayLight }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.navy }}>
                      {review.client_name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="star" size={14} color={Colors.warning} />
                      <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{review.rating}.0</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 }}>
                    {review.comment}
                  </Text>
                  <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 8 }}>
                    {new Date(review.created_at).toLocaleDateString('id-ID')}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
