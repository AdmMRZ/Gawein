import React, { useMemo, useState, useEffect } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useAuth } from '@/hooks/use-auth';
import { providerService } from '@/services/provider';
import { categoryService } from '@/services/category';
import { api } from '@/services/api';
import type { Category, ProviderProfile } from '@/types';

const BLUE = '#315BE8';
const LIGHT_BLUE = '#C9D7FF';
const YELLOW = '#FFD45A';
const TEXT = '#111111';
const MUTED = '#777777';
const BORDER = '#D9D9D9';

type HomeMode = 'home' | 'categories' | 'results' | 'filter';
type SortFilter = 'price' | 'rating' | 'experience' | null;
type ExperienceFilter = '<5' | '6-10' | '>10' | null;
type LocationFilter = string | null;

// Removed hardcoded categories and providers

export default function HomeScreen() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<HomeMode>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<SortFilter>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [gender, setGender] = useState<string | null>(null);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [experience, setExperience] = useState<ExperienceFilter>(null);
  const [location, setLocation] = useState<LocationFilter>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Load providers & categories — critical, must not be blocked by city API
    Promise.all([providerService.list(), categoryService.list()])
      .then(([providerRes, categoryRes]) => {
        setProviders(Array.isArray(providerRes) ? providerRes : []);
        setCategories(Array.isArray(categoryRes) ? categoryRes : []);
      })
      .catch((err) => {
        console.error('Failed to load providers/categories:', err);
        setProviders([]);
        setCategories([]);
      });

    // Load cities independently — failure here should NOT block main content
    Promise.all([
      fetch('https://api-regional-indonesia.vercel.app/api/city/3171').then(r => r.json()),
      fetch('https://api-regional-indonesia.vercel.app/api/city/3273').then(r => r.json()),
      fetch('https://api-regional-indonesia.vercel.app/api/city/3578').then(r => r.json()),
      fetch('https://api-regional-indonesia.vercel.app/api/city/5171').then(r => r.json()),
      fetch('https://api-regional-indonesia.vercel.app/api/city/3374').then(r => r.json()),
    ])
      .then(results => setCities(results.map(r => r.data).filter(Boolean)))
      .catch(() => setCities([]));
  }, []);

  const displayCategories = categories;
  const providerSource = providers;
  const activeFilter = Boolean(sortBy || gender || minAge || maxAge || experience || location || priceRange[0] > 0 || priceRange[1] < 10000000);
  const name = user?.first_name || 'Reyna';

  const filteredProviders = useMemo(() => {
    const keyword = normalize(query);
    const list = providerSource.filter((provider) => {
      const firstReg = provider.registrations?.[0];
      const searchable = [
        provider.user.first_name,
        provider.user.last_name,
        provider.bio,
        provider.user?.gender,
        provider.kota_name,
        provider.provinsi_name,
        firstReg?.category_name,
      ].filter(Boolean).join(' ').toLowerCase();
      const byKeyword = keyword ? normalize(searchable).includes(keyword) : true;
      const selectedName = selectedCategory?.name;
      const byCategory = selectedName
        ? provider.registrations?.some((reg) => normalize(reg.category_name || '').includes(normalize(selectedName)))
        : true;
      const price = Number.parseFloat(firstReg?.gaji_diharapkan || '0');
      const byPrice = price >= priceRange[0] && price <= priceRange[1];
      const byGender = gender ? genderMatches(provider.user?.gender || '', gender) : true;
      const byAge = (!minAge || (provider.age || 0) >= Number(minAge)) && (!maxAge || (provider.age || 0) <= Number(maxAge));
      const byExperience = experience === '<5'
        ? provider.years_of_experience < 5
        : experience === '6-10'
          ? provider.years_of_experience >= 6 && provider.years_of_experience <= 10
          : experience === '>10'
            ? provider.years_of_experience > 10
            : true;
      const byLocation = location ? provider.kota_id === location : true;
      return byKeyword && byCategory && byPrice && byGender && byAge && byExperience && byLocation;
    });

    if (!sortBy) return list;
    return [...list].sort((a, b) => {
      const first = sortValue(a, sortBy);
      const second = sortValue(b, sortBy);
      return sortDirection === 'asc' ? first - second : second - first;
    });
  }, [experience, gender, location, maxAge, minAge, priceRange, providerSource, query, selectedCategory, sortBy, sortDirection]);

  const runSearch = () => setMode('results');
  const resetFilters = () => {
    setSortBy(null);
    setSortDirection('asc');
    setPriceRange([0, 10000000]);
    setGender(null);
    setMinAge('');
    setMaxAge('');
    setExperience(null);
    setLocation(null);
  };

  if (mode === 'categories') {
    return (
      <Page>
        <BackButton onPress={() => setMode('home')} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12 }}>
          {displayCategories.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              large
              onPress={() => {
                setSelectedCategory(category);
                setQuery(category.name);
                setMode('results');
              }}
            />
          ))}
        </View>
      </Page>
    );
  }

  if (mode === 'filter') {
    return (
      <Page>
        <BackButton onPress={() => setMode('results')} />
        <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '800', color: TEXT, marginBottom: 16 }}>Filter</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionLabel}>Urutkan Berdasarkan</Text>
            <Radio label="Harga" active={sortBy === 'price'} onPress={() => setSortBy('price')} />
            <Radio label="Rating" active={sortBy === 'rating'} onPress={() => setSortBy('rating')} />
            <Radio label="Pengalaman Kerja" active={sortBy === 'experience'} onPress={() => setSortBy('experience')} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 26 }}>
            <DirectionButton label="↑" active={sortDirection === 'asc'} onPress={() => setSortDirection('asc')} />
            <DirectionButton label="↓" active={sortDirection === 'desc'} onPress={() => setSortDirection('desc')} />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Rentang Harga</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 12, color: BLUE, fontWeight: '700' }}>{formatPrice(priceRange[0].toString())}</Text>
          <Text style={{ fontSize: 12, color: BLUE, fontWeight: '700' }}>{formatPrice(priceRange[1].toString())}</Text>
        </View>
        <MultiSlider
          values={priceRange}
          min={0}
          max={10000000}
          step={500000}
          sliderLength={280}
          onValuesChange={setPriceRange}
          selectedStyle={{ backgroundColor: BLUE, height: 4 }}
          unselectedStyle={{ backgroundColor: '#DDE5FF', height: 4 }}
          markerStyle={{ width: 18, height: 18, borderRadius: 9, borderWidth: 4, borderColor: BLUE, backgroundColor: '#FFFFFF' }}
        />

        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.twoCols}>
          <ChoiceButton label="Laki-laki" active={gender === 'Laki-laki'} onPress={() => setGender(gender === 'Laki-laki' ? null : 'Laki-laki')} />
          <ChoiceButton label="Perempuan" active={gender === 'Perempuan'} onPress={() => setGender(gender === 'Perempuan' ? null : 'Perempuan')} />
        </View>

        <Text style={styles.sectionLabel}>Usia</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <SmallInput placeholder="" value={minAge} onChangeText={setMinAge} keyboardType="number-pad" />
          <Text style={{ fontWeight: '800', color: TEXT }}>s.d.</Text>
          <SmallInput placeholder="" value={maxAge} onChangeText={setMaxAge} keyboardType="number-pad" />
          <Text style={{ color: TEXT }}>tahun</Text>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Pengalaman Kerja</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['<5', '6-10', '>10'] as ExperienceFilter[]).map((item) => (
            <ChoiceButton
              key={item}
              label={item === '<5' ? '<5 tahun' : item === '6-10' ? '6-10 tahun' : '>10 tahun'}
              active={experience === item}
              onPress={() => setExperience(experience === item ? null : item)}
              compact
            />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Lokasi Kota</Text>
        <Pressable 
          onPress={() => setCityModalVisible(true)}
          style={{ height: 48, borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', marginBottom: 14 }}>
          <Text style={{ color: location ? '#111111' : '#777777', fontWeight: location ? '700' : '400' }}>
            {location ? (
              (() => {
                const city = cities.find(c => c.id === location);
                return city ? `${city.name}` : 'Pilih Kota...';
              })()
            ) : 'Semua Kota'}
          </Text>
        </Pressable>

        {/* Modal Kota */}
        {cityModalVisible && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', height: '60%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Pilih Kota</Text>
              <ScrollView>
                <Pressable style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#D9D9D9' }}
                  onPress={() => { setLocation(null); setCityModalVisible(false); }}>
                  <Text style={{ fontSize: 16, fontWeight: location === null ? 'bold' : 'normal' }}>Semua Kota</Text>
                </Pressable>
                {cities.map(c => (
                  <Pressable key={c.id} style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#D9D9D9' }}
                    onPress={() => { setLocation(c.id); setCityModalVisible(false); }}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: location === c.id ? 'bold' : 'normal', color: TEXT }}>{c.name}</Text>
                      <Text style={{ fontSize: 12, color: MUTED }}>{c.province_name}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable onPress={() => setCityModalVisible(false)} style={{ marginTop: 16, height: 48, backgroundColor: '#FFD45A', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>Tutup</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <Pressable onPress={resetFilters} style={[styles.actionButton, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: YELLOW }]}>
            <Text style={{ fontWeight: '800', color: TEXT }}>Hapus Semua</Text>
          </Pressable>
          <Pressable onPress={() => setMode('results')} style={[styles.actionButton, { backgroundColor: YELLOW }]}>
            <Text style={{ fontWeight: '800', color: TEXT }}>Terapkan</Text>
          </Pressable>
        </View>
      </Page>
    );
  }

  if (mode === 'results') {
    return (
      <Page>
        <BackButton onPress={() => setMode('home')} />
        <Text style={{ fontSize: 16, color: TEXT, marginBottom: 8 }}>Sedang cari layanan apa hari ini?</Text>
        <SearchRow query={query} setQuery={(value) => { setQuery(value); if (value.trim()) setMode('results'); }} onSubmit={runSearch} onFilter={() => setMode('filter')} activeFilter={activeFilter} />
        <ProviderList 
          providers={filteredProviders} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
          itemsPerPage={itemsPerPage} 
        />
      </Page>
    );
  }

  return (
    <Page>
      <Text style={{ fontSize: 26, color: TEXT, marginTop: 8 }}>
        Selamat datang <Text style={{ color: YELLOW, fontWeight: '800' }}>{name}!</Text>
      </Text>
      <Text style={{ color: TEXT, marginBottom: 10 }}>Sedang cari layanan apa hari ini?</Text>
      <SearchRow query={query} setQuery={(value) => { setQuery(value); if (value.trim()) setMode('results'); }} onSubmit={runSearch} onFilter={() => setMode('filter')} activeFilter={activeFilter} />

      <View style={{ height: 132, borderRadius: 12, backgroundColor: '#2D5BE3', marginTop: 14, overflow: 'hidden' }}>
        {/* Decorative Shapes */}
        <View style={{ width: 145, height: 132, left: -4, top: -12, position: 'absolute', backgroundColor: '#89A9FF' }} />
        <View style={{ width: 216.16, height: 127.16, left: 47.49, top: -5.51, position: 'absolute', backgroundColor: '#FFD65A' }} />
        <View style={{ width: 229, height: 65, left: 129, top: 59, position: 'absolute', backgroundColor: '#89A9FF' }} />
        <View style={{ width: 102, height: 62, left: 246, top: -2, position: 'absolute', backgroundColor: '#FFD65A' }} />

        {/* Badge */}
        <View style={{ width: 187, height: 15, left: 20, top: 20, position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
             <Ionicons name="shield-checkmark" size={12} color="white" />
          </View>
          <View style={{ width: 136, height: 13, backgroundColor: 'white', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.40)', fontSize: 8, fontWeight: '700' }}>Dipercaya oleh Ribuan Pengguna!</Text>
          </View>
        </View>

        {/* Main Text */}
        <View style={{ left: 20, top: 41, position: 'absolute' }}>
           <Text style={{ color: 'white', fontSize: 16, fontWeight: '300' }}>Cari kerja?</Text>
           <Text style={{ color: 'white', fontSize: 24, fontWeight: '300' }}>
              Di <Text style={{ fontWeight: '700', fontStyle: 'italic', textDecorationLine: 'underline' }}>GaweIn</Text> Aja!
           </Text>
        </View>

        {/* Icon */}
        <View style={{ width: 95, height: 95, left: 229, top: 10, position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
           <Ionicons name="construct" size={64} color="white" />
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: TEXT }}>Kategori</Text>
        <Pressable onPress={() => setMode('categories')}>
          <Text style={{ color: TEXT, fontSize: 10, textDecorationLine: 'underline' }}>Lihat Semua</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }}>
        {displayCategories.slice(0, 8).map((category) => (
          <CategoryTile
            key={category.id}
            category={category}
            onPress={() => {
              setSelectedCategory(category);
              setQuery(category.name);
              setMode('results');
            }}
          />
        ))}
      </View>

      <Text style={{ fontSize: 18, fontWeight: '800', color: TEXT, marginTop: 10, marginBottom: 8 }}>Rekomendasi</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
        {providerSource.slice(0, 6).map((provider, index) => (
          <RecommendationCard key={provider.id} provider={provider} index={index} />
        ))}
      </ScrollView>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ width: '100%', maxWidth: 390, minHeight: '100%', alignSelf: 'center', paddingHorizontal: 26, paddingTop: 54, paddingBottom: 98 }}>
      {children}
    </ScrollView>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 }}>
      <Ionicons name="chevron-back" size={20} color={TEXT} />
      <Text style={{ color: TEXT, fontWeight: '700' }}>Kembali</Text>
    </Pressable>
  );
}

function SearchRow({ query, setQuery, onSubmit, onFilter, activeFilter }: { query: string; setQuery: (value: string) => void; onSubmit: () => void; onFilter: () => void; activeFilter: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ flex: 1, height: 36, borderWidth: 1, borderColor: BORDER, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Ionicons name="search" size={16} color="#C7C7C7" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          placeholder="Masukkan nama layanan"
          placeholderTextColor="#B6B6B6"
          style={{ flex: 1, marginLeft: 8, color: TEXT, fontSize: 13, fontWeight: query ? '700' : '400' }}
        />
      </View>
      <Pressable onPress={onFilter}>
        <Ionicons name={activeFilter ? 'filter' : 'filter-outline'} size={32} color={BLUE} />
      </Pressable>
    </View>
  );
}

function CategoryTile({ category, onPress, large }: { category: Category; onPress: () => void; large?: boolean }) {
  const icon = category.icon_name || 'grid-outline';
  const size = large ? 75 : 58;
  return (
    <Pressable onPress={onPress} style={{ width: large ? 75 : 76, alignItems: 'center', marginBottom: large ? 10 : 0 }}>
      <View style={{ width: size, height: size, borderRadius: large ? 10 : size / 2, backgroundColor: LIGHT_BLUE, alignItems: 'center', justifyContent: 'center' }}>
        {icon.includes('-') ? (
          <Ionicons name={icon as any} size={large ? 34 : 28} color={BLUE} />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={large ? 38 : 34} color={BLUE} />
        )}
      </View>
      <Text style={{ color: TEXT, fontSize: large ? 9 : 10, fontWeight: '700', textAlign: 'center', marginTop: 6 }} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

function ProviderList({ 
  providers, 
  currentPage, 
  onPageChange, 
  itemsPerPage 
}: { 
  providers: ProviderProfile[]; 
  currentPage: number; 
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}) {
  if (!providers.length) {
    return <Text style={{ color: MUTED, marginTop: 24, textAlign: 'center' }}>Belum ada pekerja yang cocok.</Text>;
  }

  const totalPages = Math.ceil(providers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleProviders = providers.slice(startIndex, startIndex + itemsPerPage);

  // Generate page numbers to show
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <View style={{ gap: 12, marginTop: 12 }}>
      {visibleProviders.map((provider, index) => (
        <ProviderRow key={provider.id} provider={provider} index={index} />
      ))}
      
      {totalPages > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
          {pages.map((page) => (
            <Pressable 
              key={page} 
              onPress={() => onPageChange(page)}
              style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 16, 
                backgroundColor: page === currentPage ? YELLOW : 'transparent', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
              <Text style={{ color: TEXT, fontWeight: page === currentPage ? '800' : '500', fontSize: 13 }}>
                {page}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function ProviderRow({ provider, index }: { provider: ProviderProfile; index: number }) {
  const reg = provider.registrations?.[0];
  const rating = Number.parseFloat(provider.rating_average || '0') || 4.5;
  const fullName = `${provider.user.first_name} ${provider.user.last_name}`.trim() || 'Pekerja GaweIn';
  return (
    <Link href={`/provider/${provider.id}`} asChild>
      <Pressable style={{ height: 98, borderRadius: 20, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <View style={{ width: 104, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person" size={70} color="#CCCCCC" />
          <View style={{ position: 'absolute', left: 0, bottom: 0, backgroundColor: BLUE, borderTopRightRadius: 14, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="star" size={12} color={YELLOW} />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>{rating.toFixed(1)} ({provider.total_reviews || 10})</Text>
          </View>
        </View>
        <View style={{ flex: 1, padding: 12 }}>
          <Text style={{ color: MUTED, fontSize: 11 }}>{reg?.category_name || 'Pekerja Profesional'}</Text>
          <Text style={{ color: BLUE, fontSize: 17, fontWeight: '900' }} numberOfLines={1}>{fullName}</Text>
          <Text style={{ color: MUTED, fontSize: 10 }}>{provider.years_of_experience || 1} tahun pengalaman • {provider.kota_name || 'Lokasi tidak ada'}</Text>
          <View style={{ backgroundColor: YELLOW, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 8 }}>
            <Text style={{ color: TEXT, fontWeight: '900', fontSize: 12 }}>{formatPrice(reg?.gaji_diharapkan)}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

function RecommendationCard({ provider, index }: { provider: ProviderProfile; index: number }) {
  const reg = provider.registrations?.[0];
  const fullName = `${provider.user.first_name} ${provider.user.last_name}`.trim() || 'Pekerja GaweIn';
  const rating = Number.parseFloat(provider.rating_average || '0') || 4.5;
  return (
    <Link href={`/provider/${provider.id}`} asChild>
      <Pressable style={{ width: 155, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: '#FFFFFF', padding: 8 }}>
        <Text style={{ fontSize: 11, color: MUTED, marginBottom: 6 }} numberOfLines={1}>{reg?.category_name || 'Pekerja Profesional'}</Text>
        <View style={{ width: '100%', height: 120, borderRadius: 10, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person" size={80} color="#CCCCCC" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <Text style={{ flex: 1, color: BLUE, fontSize: 15, fontWeight: '900' }} numberOfLines={1}>{fullName}</Text>
          <Ionicons name="star" size={11} color={YELLOW} />
          <Text style={{ fontSize: 11, color: TEXT, fontWeight: '700' }}>{rating.toFixed(1)}</Text>
        </View>
        <Text style={{ color: MUTED, fontSize: 10 }}>{provider.years_of_experience || 1} thn • {provider.kota_name || 'N/A'}</Text>
        <View style={{ backgroundColor: YELLOW, borderRadius: 5, paddingHorizontal: 9, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 6 }}>
          <Text style={{ color: TEXT, fontWeight: '900', fontSize: 11 }}>{formatPrice(reg?.gaji_diharapkan)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function Radio({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 15, height: 15, borderRadius: 8, borderWidth: 1, borderColor: active ? BLUE : '#CFCFCF', alignItems: 'center', justifyContent: 'center' }}>
        {active ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BLUE }} /> : null}
      </View>
      <Text style={{ color: TEXT }}>{label}</Text>
    </Pressable>
  );
}

function DirectionButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: YELLOW, backgroundColor: active ? YELLOW : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: TEXT, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function ChoiceButton({ label, active, onPress, compact }: { label: string; active: boolean; onPress: () => void; compact?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ flex: compact ? 1 : undefined, minWidth: compact ? 0 : 0, height: 25, borderRadius: 14, borderWidth: 1.5, borderColor: BLUE, backgroundColor: active ? LIGHT_BLUE : '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 }}>
      <Text style={{ color: TEXT, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function SmallInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#BDBDBD"
      style={{ 
        width: 100, 
        height: 40, 
        borderRadius: 12, 
        borderWidth: 1.5, 
        borderColor: BLUE, 
        color: '#000000', 
        fontSize: 14, 
        textAlign: 'center',
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 10
      }}
    />
  );
}

const styles = {
  sectionLabel: { color: TEXT, fontWeight: '800' as const, marginBottom: 8 },
  twoCols: { flexDirection: 'row' as const, gap: 10, marginBottom: 14 },
  actionButton: { flex: 1, height: 42, borderRadius: 11, alignItems: 'center' as const, justifyContent: 'center' as const },
};

function sortValue(provider: ProviderProfile, sortBy: Exclude<SortFilter, null>) {
  if (sortBy === 'price') return Number.parseFloat(provider.registrations?.[0]?.gaji_diharapkan || '0');
  if (sortBy === 'rating') return Number.parseFloat(provider.rating_average || '0');
  return provider.years_of_experience || 0;
}

function formatPrice(value?: string) {
  const price = Number.parseInt(value || '3500000', 10);
  if (price >= 1000000) return `Rp${(price / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}juta`;
  return `Rp${price.toLocaleString('id-ID')}`;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function genderMatches(providerGender: string, selectedGender: string) {
  const provider = normalize(providerGender);
  const selected = normalize(selectedGender);
  const male = ['laki laki', 'male', 'pria', 'man'];
  const female = ['perempuan', 'female', 'wanita', 'woman'];
  if (selected.includes('laki')) return male.some((value) => provider.includes(value));
  if (selected.includes('perempuan')) return female.some((value) => provider.includes(value));
  return provider.includes(selected);
}


