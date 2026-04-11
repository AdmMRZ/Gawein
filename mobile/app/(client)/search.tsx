import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, StatusBar, TextInput } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { searchService } from '@/services/search';
import { categoryService } from '@/services/category';
import { Avatar } from '@/components/ui/avatar';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { ProviderProfile, Category } from '@/types';

// formatRupiah helper
const formatRupiah = (value: string) => {
  const num = value.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  
  const initialQuery = typeof params.q === 'string' ? params.q : '';
  const initialCategory = typeof params.category === 'string' && !Number.isNaN(Number.parseInt(params.category, 10))
      ? Number.parseInt(params.category, 10)
      : null;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategory);
  
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery || initialCategory !== null));
  const [isFocused, setIsFocused] = useState(false);
  
  // extra filters
  const [ordering, setOrdering] = useState<'-rating' | 'newest' | '-experience'>('-rating');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('1000000');
  const [sliderWidth, setSliderWidth] = useState<number>(200);

  // Constants
  const ABSOLUTE_MAX_PRICE = 2000000;
  const initializedSearchRef = useRef(false);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  const doSearch = useCallback(async (
    options?: {
      keyword?: string;
      category?: number | null;
      verified?: boolean;
      order?: '-rating' | 'newest' | '-experience';
    },
  ) => {
    const keyword = (options?.keyword ?? query).trim();
    const category = options?.category ?? selectedCategory;
    const verified = options?.verified ?? verifiedOnly;
    const order = options?.order ?? ordering;

    setLoading(true);
    try {
      const res = await searchService.searchProviders({
        keyword: keyword || undefined,
        category: category || undefined,
        verified_only: verified,
        ordering: order,
        min_price: minPrice ? Number.parseInt(minPrice, 10) : undefined,
        max_price: maxPrice ? Number.parseInt(maxPrice, 10) : undefined,
      });
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }, [query, selectedCategory, verifiedOnly, ordering, minPrice, maxPrice]);

  useEffect(() => {
    if (initializedSearchRef.current) return;
    initializedSearchRef.current = true;
    if (initialQuery || initialCategory !== null) {
      doSearch({ keyword: initialQuery, category: initialCategory });
    }
  }, [doSearch, initialCategory, initialQuery]);

  const handleSubmitSearch = () => {
    doSearch();
  };

  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    doSearch({ category: categoryId });
  };
  
  const handleToggleVerified = () => {
    const next = !verifiedOnly;
    setVerifiedOnly(next);
    doSearch({ verified: next });
  }

  const handleSelectSort = (nextOrder: '-rating' | 'newest' | '-experience') => {
    setOrdering(nextOrder);
    doSearch({ order: nextOrder });
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER & SEARCH AREA */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.md, gap: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.grayLight }}>
        
        {/* Search Input (Pill) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.grayLight, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, height: 48, borderColor: isFocused ? Colors.navy : 'transparent', borderWidth: 1 }}>
          <Ionicons name="search" size={20} color={isFocused ? Colors.navy : Colors.textMuted} />
          <TextInput
            style={{ flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, height: '100%', marginLeft: Spacing.sm }}
            placeholder="Cari mekanik, desain, AC..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setHasSearched(false); setResults([]); }} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Categories (Chips) */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
            <Pressable
              onPress={() => handleSelectCategory(null)}
              style={{
                paddingHorizontal: Spacing.md, paddingVertical: 8,
                borderRadius: Radius.pill,
                backgroundColor: selectedCategory === null ? Colors.navy : Colors.white,
                borderWidth: 1, borderColor: selectedCategory === null ? Colors.navy : Colors.grayMed,
              }}
            >
              <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: selectedCategory === null ? Colors.white : Colors.textSecondary }}>Semua Kategori</Text>
            </Pressable>
            {categories.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleSelectCategory(item.id)}
                style={{
                  paddingHorizontal: Spacing.md, paddingVertical: 8,
                  borderRadius: Radius.pill,
                  backgroundColor: selectedCategory === item.id ? Colors.navy : Colors.white,
                  borderWidth: 1, borderColor: selectedCategory === item.id ? Colors.navy : Colors.grayMed,
                }}
              >
                <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: selectedCategory === item.id ? Colors.white : Colors.textSecondary }}>{item.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Advanced Filters: Verified, Sort, Price Inline */}
        <View style={{ gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {/* Verified Only */}
            <Pressable
              onPress={handleToggleVerified}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: verifiedOnly ? 'rgba(52, 211, 153, 0.1)' : Colors.white, borderWidth: 1, borderColor: verifiedOnly ? '#34D399' : Colors.grayMed, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.md }}
            >
              <Ionicons name={verifiedOnly ? "checkmark-circle" : "checkmark-circle-outline"} size={16} color={verifiedOnly ? "#34D399" : Colors.textMuted} />
              <Text style={{ fontSize: FontSize.xs, color: verifiedOnly ? "#059669" : Colors.textSecondary, fontWeight: FontWeight.medium }}>Terverifikasi</Text>
            </Pressable>

            {/* Sorting */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
              {[
                { label: 'Rating', value: '-rating' },
                { label: 'Terbaru', value: 'newest' },
                { label: 'Pengalaman', value: '-experience' },
              ].map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => handleSelectSort(opt.value as any)}
                  style={{ backgroundColor: ordering === opt.value ? 'rgba(59, 130, 246, 0.1)' : Colors.white, borderWidth: 1, borderColor: ordering === opt.value ? '#3B82F6' : Colors.grayMed, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.md }}
                >
                  <Text style={{ fontSize: FontSize.xs, color: ordering === opt.value ? '#2563EB' : Colors.textSecondary, fontWeight: FontWeight.medium }}>{opt.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          
          {/* Price Range Filter Input */}
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.bold, marginBottom: 8, letterSpacing: -0.3 }}>
              Dari {minPrice ? `Rp ${formatRupiah(minPrice)}` : 'Rp 0'} ke {maxPrice ? `Rp ${formatRupiah(maxPrice)}${Number(maxPrice) === ABSOLUTE_MAX_PRICE ? '+' : ''}` : 'Tak Terhingga'}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, height: 48 }}>
              {/* Dynamic Width Wrapper for Slider */}
              <View 
                style={{ flex: 1, justifyContent: 'center' }}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
              >
                <MultiSlider
                  values={[Number(minPrice) || 0, Number(maxPrice) || ABSOLUTE_MAX_PRICE]}
                  sliderLength={sliderWidth}
                  onValuesChange={(values) => {
                    setMinPrice(values[0].toString());
                    setMaxPrice(values[1].toString());
                    setHasSearched(false);
                  }}
                  min={0}
                  max={ABSOLUTE_MAX_PRICE}
                  step={25000}
                  allowOverlap={false}
                  snapped
                  selectedStyle={{ backgroundColor: Colors.navy, height: 5 }}
                  unselectedStyle={{ backgroundColor: Colors.grayMed, height: 5 }}
                  trackStyle={{ height: 5, borderRadius: 2.5 }}
                  markerStyle={{
                    height: 22,
                    width: 22,
                    borderRadius: 11,
                    backgroundColor: Colors.white,
                    borderWidth: 2,
                    borderColor: Colors.navy,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                  pressedMarkerStyle={{
                    height: 26,
                    width: 26,
                    borderRadius: 13,
                  }}
                />
              </View>
              
              {/* Go Button */}
              <Pressable 
                onPress={() => doSearch()} 
                style={({ pressed }) => ({ 
                  backgroundColor: Colors.navy, 
                  paddingHorizontal: 16, 
                  height: 38,
                  justifyContent: 'center',
                  borderRadius: Radius.md,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>Go</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* RESULTS LIST */}
      {loading ? (
        <View style={{ padding: Spacing.xl, gap: Spacing.md }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : !hasSearched ? (
        <View style={{ alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingTop: 120 }}>
          <Ionicons name="search-outline" size={64} color={Colors.grayMed} />
         </View>
      ) : results.length === 0 ? (
        <View style={{ alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingTop: 100 }}>
          <Ionicons name="sad-outline" size={64} color={Colors.grayMed} />
          <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginTop: Spacing.md }}>Tidak Ditemukan</Text>
          <Text style={{ fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs }}>Coba gunakan kata kunci atau kriteria filter yang berbeda.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.md }}
          renderItem={({ item }) => (
            <Link href={`/provider/${item.id}`} asChild>
              <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                <View style={{ padding: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.grayLight, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
                  <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
                    <Avatar name={`${item.user.first_name} ${item.user.last_name}`} size={56} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, flex: 1 }} numberOfLines={1}>
                          {item.user.first_name} {item.user.last_name}
                        </Text>
                        {item.is_verified && <Ionicons name="checkmark-circle" size={16} color="#34D399" />}
                      </View>
                      <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary }} numberOfLines={1}>
                        {item.bio || 'Penyedia Jasa Profesional'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: Spacing.md }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="star" size={14} color="#FBBF24" />
                          <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>
                            {Number.parseFloat(item.rating_average || '0').toFixed(1)}
                          </Text>
                          <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted }}>
                            ({item.total_reviews})
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}
