import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { providerService } from '@/services/provider';
import { reviewService } from '@/services/review';
import { Avatar } from '@/components/ui/avatar';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { ProviderProfile, Review } from '@/types';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

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

  if (loading) return <LoadingScreen />;
  if (!provider) return <LoadingScreen message="Tidak ditemukan" />;

  const fullName = `${provider.user.first_name} ${provider.user.last_name}`.trim();

  return (
    <>
      <Stack.Screen options={{ title: fullName || 'Detail Penyedia' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.xxl, paddingBottom: Spacing.section }}
      >
        {/* ── Profile Header ──────────────────────── */}
        <View style={{ alignItems: 'center', gap: Spacing.md }}>
          <Avatar name={fullName} size={80} />
          <Text
            style={{
              fontSize: FontSize.xxl,
              fontWeight: FontWeight.bold,
              color: Colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            {fullName}
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
            <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>
              {provider.location || 'Lokasi belum diatur'}
            </Text>
          </View>
          <RatingStars
            rating={parseFloat(provider.rating_average || '0')}
            size={18}
            totalReviews={provider.total_reviews}
          />
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {provider.is_verified && <Badge label="Terverifikasi" variant="success" />}
            <Badge label={`${provider.years_of_experience} thn pengalaman`} variant="info" />
          </View>
        </View>

        {/* ── Bio ─────────────────────────────────── */}
        {provider.bio ? (
          <Card>
            <Text
              style={{
                fontSize: FontSize.md,
                color: Colors.textSecondary,
                lineHeight: 22,
              }}
            >
              {provider.bio}
            </Text>
          </Card>
        ) : null}

        {/* ── Services ────────────────────────────── */}
        {provider.services && provider.services.length > 0 && (
          <View style={{ gap: Spacing.md }}>
            <Text
              style={{
                fontSize: FontSize.lg,
                fontWeight: FontWeight.semibold,
                color: Colors.textPrimary,
                letterSpacing: -0.3,
              }}
            >
              Layanan
            </Text>
            {provider.services.map((service) => (
              <Link key={service.id} href={`/booking/${service.id}`} asChild>
                <Pressable>
                  <Card>
                    <View style={{ gap: Spacing.sm }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text
                          style={{
                            fontSize: FontSize.md,
                            fontWeight: FontWeight.semibold,
                            color: Colors.textPrimary,
                            flex: 1,
                          }}
                          numberOfLines={2}
                        >
                          {service.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: FontSize.md,
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                            fontVariant: ['tabular-nums'],
                          }}
                          selectable
                        >
                          Rp {parseInt(service.price).toLocaleString('id-ID')}
                        </Text>
                      </View>
                      <Text
                        style={{ fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 20 }}
                        numberOfLines={2}
                      >
                        {service.description}
                      </Text>
                      {service.category_name && (
                        <Badge label={service.category_name} variant="default" />
                      )}
                    </View>
                  </Card>
                </Pressable>
              </Link>
            ))}
          </View>
        )}

        {/* ── Reviews ─────────────────────────────── */}
        <View style={{ gap: Spacing.md }}>
          <Text
            style={{
              fontSize: FontSize.lg,
              fontWeight: FontWeight.semibold,
              color: Colors.textPrimary,
              letterSpacing: -0.3,
            }}
          >
            Ulasan ({reviews.length})
          </Text>
          {reviews.length === 0 ? (
            <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>
              Belum ada ulasan
            </Text>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <View style={{ gap: Spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary }}>
                      {review.client_name}
                    </Text>
                    <RatingStars rating={review.rating} size={13} showValue={false} />
                  </View>
                  <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 }}>
                    {review.comment}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted }}>
                    {new Date(review.created_at).toLocaleDateString('id-ID')}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}
