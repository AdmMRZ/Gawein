import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { providerService } from '@/services/provider';
import { categoryService } from '@/services/category';
import { SearchBar } from '@/components/ui/search-bar';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/constants/theme';
import type { ProviderProfile, Category } from '@/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [providerRes, catRes] = await Promise.all([
        providerService.list(),
        categoryService.list(),
      ]);
      setProviders(providerRes);
      setCategories(catRes);
    } catch {
      // Silent fail, shows empty state
    } finally {
      setLoading(false);
    }
  };

  const greeting = user?.first_name
    ? `Halo, ${user.first_name}`
    : 'Halo';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: Colors.cream }}
      contentContainerStyle={{ paddingBottom: Spacing.section }}
    >
      {/* ── Header ────────────────────────────────── */}
      <View style={{ padding: Spacing.xxl, paddingBottom: Spacing.lg }}>
        <Text
          style={{
            fontSize: FontSize.display,
            fontWeight: FontWeight.bold,
            color: Colors.navy,
            letterSpacing: -0.8,
          }}
        >
          {greeting}
        </Text>
        <Text
          style={{
            fontSize: FontSize.md,
            color: Colors.textSecondary,
            marginTop: Spacing.xs,
          }}
        >
          Mau cari jasa apa hari ini?
        </Text>
      </View>

      {/* ── Search ────────────────────────────────── */}
      <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xxl }}>
        <Link href="/(client)/search" asChild>
          <Pressable>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.white,
                borderRadius: Radius.md,
                borderCurve: 'continuous' as const,
                borderWidth: 1,
                borderColor: Colors.grayLight,
                paddingHorizontal: Spacing.md,
                height: 44,
                gap: Spacing.sm,
                boxShadow: Shadow.sm,
              } as any}
            >
              <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
              <Text style={{ fontSize: FontSize.md, color: Colors.textMuted, flex: 1 }}>
                Cari jasa...
              </Text>
            </View>
          </Pressable>
        </Link>
      </View>

      {/* ── Categories ────────────────────────────── */}
      {categories.length > 0 && (
        <View style={{ marginBottom: Spacing.xxl }}>
          <Text
            style={{
              fontSize: FontSize.lg,
              fontWeight: FontWeight.semibold,
              color: Colors.textPrimary,
              paddingHorizontal: Spacing.xxl,
              marginBottom: Spacing.md,
              letterSpacing: -0.3,
            }}
          >
            Kategori
          </Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.xxl, gap: Spacing.sm }}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: Colors.white,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.sm,
                  borderRadius: Radius.pill,
                  borderWidth: 1,
                  borderColor: Colors.grayLight,
                }}
              >
                <Text
                  style={{
                    fontSize: FontSize.sm,
                    fontWeight: FontWeight.medium,
                    color: Colors.textPrimary,
                  }}
                >
                  {item.name}
                </Text>
              </View>
            )}
          />
        </View>
      )}

      {/* ── Providers ─────────────────────────────── */}
      <View style={{ paddingHorizontal: Spacing.xxl }}>
        <Text
          style={{
            fontSize: FontSize.lg,
            fontWeight: FontWeight.semibold,
            color: Colors.textPrimary,
            marginBottom: Spacing.md,
            letterSpacing: -0.3,
          }}
        >
          Penyedia Jasa
        </Text>

        {loading ? (
          <View style={{ gap: Spacing.md }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <View style={{ gap: Spacing.md }}>
            {providers.map((provider) => (
              <Link key={provider.id} href={`/provider/${provider.id}`} asChild>
                <Pressable>
                  <Card>
                    <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
                      <Avatar
                        name={`${provider.user.first_name} ${provider.user.last_name}`}
                        size={48}
                      />
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                          <Text
                            style={{
                              fontSize: FontSize.md,
                              fontWeight: FontWeight.semibold,
                              color: Colors.textPrimary,
                              letterSpacing: -0.2,
                              flex: 1,
                            }}
                            numberOfLines={1}
                          >
                            {provider.user.first_name} {provider.user.last_name}
                          </Text>
                          {provider.is_verified && (
                            <Badge label="Terverifikasi" variant="success" />
                          )}
                        </View>
                        <Text
                          style={{ fontSize: FontSize.sm, color: Colors.textMuted }}
                          numberOfLines={1}
                        >
                          {provider.location || 'Lokasi belum diatur'}
                        </Text>
                        <RatingStars
                          rating={parseFloat(provider.rating_average || '0')}
                          size={14}
                          totalReviews={provider.total_reviews}
                        />
                      </View>
                    </View>
                    {provider.services && provider.services.length > 0 && (
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: Spacing.xs,
                          marginTop: Spacing.md,
                        }}
                      >
                        {provider.services.slice(0, 3).map((s) => (
                          <View
                            key={s.id}
                            style={{
                              backgroundColor: Colors.cream,
                              paddingHorizontal: Spacing.sm,
                              paddingVertical: 2,
                              borderRadius: Radius.sm,
                            }}
                          >
                            <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary }}>
                              {s.title}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Card>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
