import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { searchService } from '@/services/search';
import { categoryService } from '@/services/category';
import { SearchBar } from '@/components/ui/search-bar';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { ProviderProfile, Category } from '@/types';
import { useEffect } from 'react';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await searchService.searchProviders({
        keyword: query.trim() || undefined,
        category: selectedCategory || undefined,
      });
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory]);

  useEffect(() => {
    if (selectedCategory !== null) {
      doSearch();
    }
  }, [selectedCategory]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* ── Search + Filters ──────────────────────── */}
      <View style={{ padding: Spacing.xxl, gap: Spacing.md }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={doSearch}
          placeholder="Cari berdasarkan nama, jasa, lokasi..."
        />
        <FlatList
          data={[{ id: 0, name: 'Semua' } as Category, ...categories]}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.sm }}
          renderItem={({ item }) => {
            const isSelected = item.id === 0 ? selectedCategory === null : selectedCategory === item.id;
            return (
              <Pressable
                onPress={() => setSelectedCategory(item.id === 0 ? null : item.id)}
                style={{
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.xs,
                  borderRadius: Radius.pill,
                  backgroundColor: isSelected ? Colors.navy : Colors.white,
                  borderWidth: 1,
                  borderColor: isSelected ? Colors.navy : Colors.grayLight,
                }}
              >
                <Text
                  style={{
                    fontSize: FontSize.sm,
                    fontWeight: FontWeight.medium,
                    color: isSelected ? Colors.textInverse : Colors.textSecondary,
                  }}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* ── Results ───────────────────────────────── */}
      {loading ? (
        <View style={{ paddingHorizontal: Spacing.xxl, gap: Spacing.md }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : !hasSearched ? (
        <EmptyState
          icon="search-outline"
          title="Cari penyedia jasa"
          description="Ketik kata kunci atau pilih kategori untuk menemukan penyedia jasa"
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="sad-outline"
          title="Tidak ditemukan"
          description="Coba ubah kata kunci atau filter pencarian"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.xxl, gap: Spacing.md, paddingBottom: Spacing.section }}
          renderItem={({ item }) => (
            <Link href={`/provider/${item.id}`} asChild>
              <Pressable>
                <Card>
                  <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
                    <Avatar name={`${item.user.first_name} ${item.user.last_name}`} size={44} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{
                          fontSize: FontSize.md,
                          fontWeight: FontWeight.semibold,
                          color: Colors.textPrimary,
                        }}
                        numberOfLines={1}
                      >
                        {item.user.first_name} {item.user.last_name}
                      </Text>
                      <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }} numberOfLines={1}>
                        {item.location || 'Lokasi belum diatur'}
                      </Text>
                      <RatingStars
                        rating={parseFloat(item.rating_average || '0')}
                        size={13}
                        totalReviews={item.total_reviews}
                      />
                    </View>
                    {item.is_verified && <Badge label="Verified" variant="success" />}
                  </View>
                </Card>
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}
