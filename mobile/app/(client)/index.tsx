import React, { useMemo, useState, useEffect } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useAuth } from '@/hooks/use-auth';
import { providerService } from '@/services/provider';
import { categoryService } from '@/services/category';
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
type LocationFilter = 'Dalam Kota' | 'Luar Kota' | null;

const categoryIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  perbaikan: 'cog',
  'rumah tangga': 'home',
  transportasi: 'car',
  teknologi: 'memory',
  kreativitas: 'brush',
  kebersihan: 'broom',
  kecantikan: 'lipstick',
  keamanan: 'lock',
  kesehatan: 'medical-bag',
  'ac repair': 'cog',
  beauty: 'lipstick',
  cleaning: 'broom',
  electrical: 'briefcase',
  garden: 'briefcase',
  plumbing: 'pipe-wrench',
  tutor: 'school',
};

const categoryAliases: [string[], keyof typeof MaterialCommunityIcons.glyphMap][] = [
  [['perbaikan', 'service', 'repair', 'mekanik'], 'cog'],
  [['rumah', 'tangga', 'asisten'], 'home'],
  [['transportasi', 'sopir', 'driver', 'mobil', 'motor'], 'car'],
  [['teknologi', 'it', 'komputer'], 'memory'],
  [['kreativitas', 'desain', 'creative'], 'brush'],
  [['kebersihan', 'bersih', 'clean'], 'broom'],
  [['kecantikan', 'beauty', 'salon'], 'lipstick'],
  [['keamanan', 'security', 'aman'], 'lock'],
  [['kesehatan', 'health', 'medis'], 'medical-bag'],
  [['electrical', 'listrik'], 'briefcase'],
  [['garden', 'gardener', 'taman'], 'briefcase'],
  [['plumbing', 'pipa'], 'pipe-wrench'],
  [['tutor', 'guru', 'ajar'], 'school'],
];

const fallbackCategories = [
  'AC Repair',
  'Beauty',
  'Cleaning',
  'Electrical',
  'Garden',
  'Plumbing',
  'Tutor',
  'Transportasi',
  'Rumah Tangga',
].map((name, index) => ({
  id: -(index + 1),
  name,
  description: '',
  is_active: true,
  created_at: '',
  updated_at: '',
}));

const demoProviders: ProviderProfile[] = [
  demoProvider(1, 'Joko', 'Kendil', 'Layanan Electrical Terpercaya', 'Electrical', 20, '200000', '4.5', 10, 'Laki-laki', 'Perbaikan'),
  demoProvider(2, 'Ani', 'Sumarni', 'Layanan Beauty Terpercaya', 'Beauty', 7, '350000', '4.5', 18, 'Perempuan', 'Kecantikan'),
  demoProvider(3, 'Yayan', 'Sukayan', 'Sopir Mobil', 'Transportasi', 7, '3500000', '4.5', 10, 'Laki-laki', 'Transportasi'),
  demoProvider(4, 'Fitri', 'Andayani', 'Sopir Mobil', 'Transportasi', 2, '3200000', '4.3', 31, 'Perempuan', 'Transportasi'),
  demoProvider(5, 'Maysitoh', 'Rahma', 'Asisten Rumah Tangga', 'Rumah Tangga', 5, '4200000', '4.8', 18, 'Perempuan', 'Rumah Tangga'),
  demoProvider(6, 'Rudi', 'Hartono', 'Asisten Rumah Tangga', 'Rumah Tangga', 4, '3600000', '4.6', 15, 'Laki-laki', 'Rumah Tangga'),
  demoProvider(7, 'Raka', 'Pradana', 'AC Repair', 'AC Repair', 6, '2800000', '4.8', 22, 'Laki-laki', 'Perbaikan'),
  demoProvider(8, 'Sari', 'Putri', 'Plumbing Service', 'Plumbing', 4, '2300000', '4.6', 15, 'Perempuan', 'Perbaikan'),
  demoProvider(9, 'Rizky', 'Aditya', 'Tutor Komputer', 'Tutor', 5, '3000000', '4.7', 27, 'Laki-laki', 'Teknologi'),
  demoProvider(10, 'Dina', 'Permata', 'Teknisi Aplikasi', 'Teknologi', 4, '2600000', '4.6', 21, 'Perempuan', 'Teknologi'),
  demoProvider(11, 'Salsa', 'Nabila', 'Desainer Poster', 'Kreativitas', 3, '2100000', '4.5', 19, 'Perempuan', 'Kreativitas'),
  demoProvider(12, 'Bagas', 'Putra', 'Fotografer Produk', 'Kreativitas', 5, '3300000', '4.7', 26, 'Laki-laki', 'Kreativitas'),
  demoProvider(13, 'Budi', 'Santoso', 'Cleaning Service', 'Cleaning', 4, '2400000', '4.4', 16, 'Laki-laki', 'Kebersihan'),
  demoProvider(14, 'Mira', 'Lestari', 'Garden Cleaning', 'Garden', 6, '2900000', '4.8', 23, 'Perempuan', 'Kebersihan'),
  demoProvider(15, 'Ayu', 'Lestari', 'Makeup Artist', 'Beauty', 6, '3600000', '4.8', 30, 'Perempuan', 'Kecantikan'),
  demoProvider(16, 'Tomi', 'Saputra', 'Hair Stylist', 'Kecantikan', 5, '3100000', '4.6', 20, 'Laki-laki', 'Kecantikan'),
  demoProvider(17, 'Wawan', 'Setiawan', 'Petugas Keamanan', 'Keamanan', 9, '4000000', '4.6', 41, 'Laki-laki', 'Keamanan'),
  demoProvider(18, 'Nadia', 'Safitri', 'Security Event', 'Keamanan', 6, '3800000', '4.7', 28, 'Perempuan', 'Keamanan'),
  demoProvider(19, 'Nina', 'Aulia', 'Perawat Lansia', 'Kesehatan', 8, '5200000', '4.9', 34, 'Perempuan', 'Kesehatan'),
  demoProvider(20, 'Fajar', 'Ramadhan', 'Fisioterapis', 'Kesehatan', 7, '4800000', '4.8', 29, 'Laki-laki', 'Kesehatan'),
];

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

  useEffect(() => {
    Promise.all([providerService.list(), categoryService.list()])
      .then(([providerRes, categoryRes]) => {
        setProviders(providerRes);
        setCategories(categoryRes.length ? categoryRes : fallbackCategories);
      })
      .catch(() => setCategories(fallbackCategories));
  }, []);

  const displayCategories = categories.length ? categories : fallbackCategories;
  const providerSource = useMemo(() => {
    const seen = new Set<number>();
    return [...demoProviders, ...providers].filter((provider) => {
      if (seen.has(provider.id)) return false;
      seen.add(provider.id);
      return true;
    });
  }, [providers]);
  const activeFilter = Boolean(sortBy || gender || minAge || maxAge || experience || location || priceRange[0] > 0 || priceRange[1] < 10000000);
  const name = user?.first_name || 'Reyna';

  const filteredProviders = useMemo(() => {
    const keyword = normalize(query);
    const list = providerSource.filter((provider) => {
      const firstService = provider.services?.[0];
      const searchable = [
        provider.user.first_name,
        provider.user.last_name,
        provider.bio,
        provider.gender,
        provider.location,
        firstService?.title,
        firstService?.category_name,
        categoryAliasText(firstService?.category_name || ''),
      ].filter(Boolean).join(' ').toLowerCase();
      const byKeyword = keyword ? normalize(searchable).includes(keyword) : true;
      const selectedName = selectedCategory?.name;
      const byCategory = selectedName
        ? provider.services?.some((service) => categoryMatches(service.category_name || '', selectedName))
        : true;
      const price = Number.parseInt(firstService?.price || '0', 10);
      const byPrice = price >= priceRange[0] && price <= priceRange[1];
      const byGender = gender ? genderMatches(provider.gender || '', gender) : true;
      const byAge = (!minAge || (provider.age || 0) >= Number(minAge)) && (!maxAge || (provider.age || 0) <= Number(maxAge));
      const byExperience = experience === '<5'
        ? provider.years_of_experience < 5
        : experience === '6-10'
          ? provider.years_of_experience >= 6 && provider.years_of_experience <= 10
          : experience === '>10'
            ? provider.years_of_experience > 10
            : true;
      const locationText = provider.location?.toLowerCase() || '';
      const byLocation = location === 'Dalam Kota'
        ? !locationText.includes('luar kota')
        : location === 'Luar Kota'
          ? locationText.includes('luar kota') || locationText.includes('kabupaten')
          : true;
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
          {allCategoryTiles(displayCategories).map((category) => (
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
        <MultiSlider
          values={priceRange}
          min={0}
          max={10000000}
          step={500000}
          sliderLength={300}
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
          <SmallInput placeholder="Masukkan Usia" value={minAge} onChangeText={setMinAge} keyboardType="number-pad" />
          <Text style={{ fontWeight: '800', color: TEXT }}>s.d.</Text>
          <SmallInput placeholder="Masukkan Usia" value={maxAge} onChangeText={setMaxAge} keyboardType="number-pad" />
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

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Lokasi</Text>
        <View style={styles.twoCols}>
          <ChoiceButton label="Dalam Kota" active={location === 'Dalam Kota'} onPress={() => setLocation(location === 'Dalam Kota' ? null : 'Dalam Kota')} />
          <ChoiceButton label="Luar Kota" active={location === 'Luar Kota'} onPress={() => setLocation(location === 'Luar Kota' ? null : 'Luar Kota')} />
        </View>

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
        <ProviderList providers={filteredProviders} />
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

      <View style={{ height: 82, borderRadius: 10, backgroundColor: BLUE, marginTop: 14, overflow: 'hidden', padding: 14 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 11, marginBottom: 6 }}>Dipercaya oleh Ribuan Pengguna!</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Cari kerja?</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Di GaweIn Aja!</Text>
        <Ionicons name="construct" size={64} color={YELLOW} style={{ position: 'absolute', right: 18, top: 10 }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: TEXT }}>Kategori</Text>
        <Pressable onPress={() => setMode('categories')}>
          <Text style={{ color: TEXT, fontSize: 10, textDecorationLine: 'underline' }}>Lihat Semua</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }}>
        {allCategoryTiles(displayCategories).slice(0, 8).map((category) => (
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
  const icon = getCategoryIcon(category.name);
  const size = large ? 75 : 58;
  return (
    <Pressable onPress={onPress} style={{ width: large ? 75 : 76, alignItems: 'center', marginBottom: large ? 10 : 0 }}>
      <View style={{ width: size, height: size, borderRadius: large ? 10 : size / 2, backgroundColor: LIGHT_BLUE, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name={icon} size={large ? 38 : 34} color={BLUE} />
      </View>
      <Text style={{ color: TEXT, fontSize: large ? 9 : 10, fontWeight: '700', textAlign: 'center', marginTop: 6 }} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

function ProviderList({ providers }: { providers: ProviderProfile[] }) {
  if (!providers.length) {
    return <Text style={{ color: MUTED, marginTop: 24, textAlign: 'center' }}>Belum ada pekerja yang cocok.</Text>;
  }
  return (
    <View style={{ gap: 12, marginTop: 12 }}>
      {providers.slice(0, 5).map((provider, index) => (
        <ProviderRow key={provider.id} provider={provider} index={index} />
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 4 }}>
        {['1', '2', '3', '4', '...', '15'].map((page) => (
          <Text key={page} style={{ color: TEXT, fontWeight: page === '1' ? '800' : '500', backgroundColor: page === '1' ? YELLOW : 'transparent', paddingHorizontal: page === '1' ? 7 : 0, borderRadius: 5 }}>
            {page}
          </Text>
        ))}
      </View>
    </View>
  );
}

function ProviderRow({ provider, index }: { provider: ProviderProfile; index: number }) {
  const service = provider.services?.[0];
  const rating = Number.parseFloat(provider.rating_average || '0') || 4.5;
  const fullName = `${provider.user.first_name} ${provider.user.last_name}`.trim() || 'Pekerja GaweIn';
  return (
    <Link href={`/provider/${provider.id}`} asChild>
      <Pressable style={{ height: 98, borderRadius: 20, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <View style={{ width: 104 }}>
          <Image source={{ uri: workerPhotoFor(provider, index) }} style={{ width: 104, height: 98 }} />
          <View style={{ position: 'absolute', left: 0, bottom: 0, backgroundColor: BLUE, borderTopRightRadius: 14, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="star" size={12} color={YELLOW} />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>{rating.toFixed(1)} ({provider.total_reviews || 10})</Text>
          </View>
        </View>
        <View style={{ flex: 1, padding: 12 }}>
          <Text style={{ color: MUTED, fontSize: 11 }}>{service?.title || service?.category_name || 'Pekerja Profesional'}</Text>
          <Text style={{ color: BLUE, fontSize: 17, fontWeight: '900' }} numberOfLines={1}>{fullName}</Text>
          <Text style={{ color: MUTED, fontSize: 10 }}>{provider.years_of_experience || 1} tahun pengalaman</Text>
          <View style={{ backgroundColor: YELLOW, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 8 }}>
            <Text style={{ color: TEXT, fontWeight: '900', fontSize: 12 }}>{formatPrice(service?.price)}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

function RecommendationCard({ provider, index }: { provider: ProviderProfile; index: number }) {
  const service = provider.services?.[0];
  const fullName = `${provider.user.first_name} ${provider.user.last_name}`.trim() || 'Pekerja GaweIn';
  const rating = Number.parseFloat(provider.rating_average || '0') || 4.5;
  return (
    <Link href={`/provider/${provider.id}`} asChild>
      <Pressable style={{ width: 155, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: '#FFFFFF', padding: 8 }}>
        <Text style={{ fontSize: 11, color: MUTED, marginBottom: 6 }} numberOfLines={1}>{service?.title || 'Pekerja Profesional'}</Text>
        <Image source={{ uri: workerPhotoFor(provider, index) }} style={{ width: '100%', height: 120, borderRadius: 10 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <Text style={{ flex: 1, color: BLUE, fontSize: 15, fontWeight: '900' }} numberOfLines={1}>{fullName}</Text>
          <Ionicons name="star" size={11} color={YELLOW} />
          <Text style={{ fontSize: 11, color: TEXT, fontWeight: '700' }}>{rating.toFixed(1)}</Text>
        </View>
        <Text style={{ color: MUTED, fontSize: 10 }}>{provider.years_of_experience || 1} tahun pengalaman</Text>
        <View style={{ backgroundColor: YELLOW, borderRadius: 5, paddingHorizontal: 9, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 6 }}>
          <Text style={{ color: TEXT, fontWeight: '900', fontSize: 11 }}>{formatPrice(service?.price)}</Text>
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
      placeholderTextColor="#C8C8C8"
      style={{ width: 98, height: 26, borderRadius: 14, borderWidth: 1.5, borderColor: BLUE, color: TEXT, fontSize: 11, textAlign: 'center' }}
    />
  );
}

const styles = {
  sectionLabel: { color: TEXT, fontWeight: '800' as const, marginBottom: 8 },
  twoCols: { flexDirection: 'row' as const, gap: 10, marginBottom: 14 },
  actionButton: { flex: 1, height: 42, borderRadius: 11, alignItems: 'center' as const, justifyContent: 'center' as const },
};

function sortValue(provider: ProviderProfile, sortBy: Exclude<SortFilter, null>) {
  if (sortBy === 'price') return Number.parseInt(provider.services?.[0]?.price || '0', 10);
  if (sortBy === 'rating') return Number.parseFloat(provider.rating_average || '0');
  return provider.years_of_experience || 0;
}

function formatPrice(value?: string) {
  const price = Number.parseInt(value || '3500000', 10);
  if (price >= 1000000) return `Rp${(price / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}juta`;
  return `Rp${price.toLocaleString('id-ID')}`;
}

function getCategoryIcon(name: string): keyof typeof MaterialCommunityIcons.glyphMap {
  const key = name.toLowerCase();
  if (categoryIcons[key]) return categoryIcons[key];
  const found = categoryAliases.find(([aliases]) => aliases.some((alias) => key.includes(alias)));
  return found?.[1] || 'briefcase';
}

function allCategoryTiles(categories: Category[]): Category[] {
  const required = ['AC Repair', 'Beauty', 'Cleaning', 'Electrical', 'Garden', 'Plumbing', 'Tutor'];
  const merged = [...categories];
  required.forEach((name, index) => {
    if (!merged.some((category) => normalize(category.name) === normalize(name))) {
      merged.push({ id: -100 - index, name, description: '', is_active: true, created_at: '', updated_at: '' });
    }
  });
  return merged;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function categoryAliasText(category: string) {
  const normalized = normalize(category);
  const aliases: Record<string, string> = {
    'ac repair': 'perbaikan repair service teknisi ac',
    electrical: 'perbaikan listrik electrician',
    plumbing: 'perbaikan pipa plumber',
    beauty: 'kecantikan salon makeup',
    cleaning: 'kebersihan bersih cleaner',
    garden: 'kebersihan taman gardener',
    tutor: 'teknologi guru belajar',
  };
  return aliases[normalized] || '';
}

function categoryMatches(serviceCategory: string, selectedCategory: string) {
  const service = normalize(serviceCategory);
  const selected = normalize(selectedCategory);
  if (service === selected || categoryAliasText(serviceCategory).includes(selected) || categoryAliasText(selectedCategory).includes(service)) return true;
  const groups = [
    ['perbaikan', 'ac repair', 'electrical', 'plumbing'],
    ['kecantikan', 'beauty'],
    ['kebersihan', 'cleaning', 'garden'],
    ['teknologi', 'tutor'],
    ['transportasi'],
    ['rumah tangga'],
    ['kreativitas'],
    ['keamanan'],
    ['kesehatan'],
  ];
  return groups.some((group) => group.includes(service) && group.includes(selected));
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

function workerPhotoFor(provider: ProviderProfile, index: number) {
  const fullName = `${provider.user.first_name} ${provider.user.last_name}`.toLowerCase();
  if (fullName.includes('joko')) return malePhotos[1];
  const isFemale = provider.gender?.toLowerCase().includes('perempuan');
  return isFemale ? femalePhotos[index % femalePhotos.length] : malePhotos[index % malePhotos.length];
}

const malePhotos = [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
];

const femalePhotos = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
];

function demoProvider(
  id: number,
  firstName: string,
  lastName: string,
  title: string,
  categoryName: string,
  years: number,
  price: string,
  rating: string,
  reviews: number,
  gender: 'Laki-laki' | 'Perempuan',
  localCategory: string,
): ProviderProfile {
  return {
    id,
    user: {
      id,
      email: `${firstName.toLowerCase()}@gawein.test`,
      username: firstName.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      role: 'provider',
      is_active: true,
      is_verified: true,
      created_at: '',
      updated_at: '',
    },
    bio: `${title} berpengalaman dan siap membantu kebutuhan harian Anda. ${localCategory}`,
    gender,
    age: 28 + id,
    location: 'Dalam Kota',
    years_of_experience: years,
    is_verified: true,
    verification_status: 'verified',
    rating_average: rating,
    total_reviews: reviews,
    created_at: '',
    updated_at: '',
    services: [{
      id,
      provider: id,
      category: null,
      category_name: categoryName,
      provider_name: `${firstName} ${lastName}`.trim(),
      title,
      description: `${title} profesional`,
      price,
      location: 'Dalam Kota',
      service_scope: '',
      service_limitations: '',
      is_active: true,
      created_at: '',
      updated_at: '',
    }],
  };
}
