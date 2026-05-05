import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { categoryService } from '@/services/category';
import type { Category } from '@/types';

const BLUE = '#315BE8';
const BLUE_DARK = '#2447B8';
const BLUE_SOFT = '#EEF3FF';
const YELLOW = '#FFD45A';
const TEXT = '#111111';
const MUTED = '#6E7480';
const BORDER = '#E4EAFF';

export default function ProviderHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (err) {
      console.log('Failed to fetch categories:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const name = user?.first_name || 'Reyna';

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#F8FAFF' }} 
      contentContainerStyle={{ width: '100%', maxWidth: 390, minHeight: '100%', alignSelf: 'center', paddingHorizontal: 24, paddingTop: 54, paddingBottom: 104 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={BLUE} />
      }
    >
      <Text style={styles.welcome}>
        Selamat datang <Text style={styles.welcomeName}>{name}!</Text>
      </Text>
      <Text style={styles.subtitle}>Kamu mau kerja sebagai apa?</Text>

      <View style={styles.bannerShell}>
        <Image
          source={require('@/assets/images/header.png')}
          style={styles.bannerImage}
        />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>KATEGORI TERSEDIA</Text>
          <Text style={styles.sectionTitle}>Kamu mau kerja sebagai apa?</Text>
        </View>
        <Text style={styles.countText}>{categories.length} opsi</Text>
      </View>

      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <CategoryTile
            key={category.id}
            category={category}
            onPress={() => {
              router.push(`/(provider)/register-category/${category.id}?categoryName=${encodeURIComponent(category.name)}`);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function CategoryTile({ category, onPress }: { category: Category; onPress: () => void }) {
  const icon = category.icon_name || 'grid-outline';
  const isMaterial = ['broom', 'lipstick', 'medical-bag'].includes(icon);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.categoryShell, pressed && styles.categoryPressed]}>
      <View style={styles.categoryCard}>
        <View style={styles.categoryIconWrap}>
          {isMaterial ? (
            <MaterialCommunityIcons name={icon as any} size={32} color={BLUE} />
          ) : (
            <Ionicons name={icon as any} size={32} color={BLUE} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {category.name}
          </Text>
          <Text style={styles.categoryHint}>Daftar sekarang</Text>
        </View>
        <View style={styles.categoryArrow}>
          <Ionicons name="chevron-forward" size={15} color={BLUE_DARK} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = {
  welcome: {
    fontSize: 26,
    color: TEXT,
    marginTop: 8,
  },
  welcomeName: {
    color: YELLOW,
    fontWeight: '900' as const,
  },
  subtitle: {
    color: TEXT,
    marginTop: 4,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bannerShell: {
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden' as const,
    backgroundColor: '#FFFFFF',
    shadowColor: BLUE,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  bannerImage: {
    width: '100%' as const,
    height: 132,
    resizeMode: 'cover' as const,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionEyebrow: {
    color: BLUE,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900' as const,
    marginTop: 4,
  },
  countText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '800' as const,
    marginBottom: 2,
  },
  categoryGrid: {
    gap: 11,
  },
  categoryShell: {
    backgroundColor: '#EEF3FF',
    borderRadius: 24,
    padding: 4,
  },
  categoryPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  categoryCard: {
    minHeight: 82,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  categoryIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: BLUE_SOFT,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  categoryName: {
    color: TEXT,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900' as const,
  },
  categoryHint: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700' as const,
    marginTop: 3,
  },
  categoryArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: YELLOW,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
