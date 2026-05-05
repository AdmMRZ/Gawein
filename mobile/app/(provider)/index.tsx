import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { categoryService } from '@/services/category';
import type { Category } from '@/types';

const BLUE = '#315BE8';
const LIGHT_BLUE = '#C9D7FF';
const YELLOW = '#FFD45A';
const TEXT = '#111111';

const HARDCODED_CATEGORIES: Category[] = [
  { id: 'perbaikan', name: 'Perbaikan', icon_name: 'settings' },
  { id: 'rumah-tangga', name: 'Rumah Tangga', icon_name: 'home' },
  { id: 'transportasi', name: 'Transportasi', icon_name: 'car' },
  { id: 'teknologi', name: 'Teknologi', icon_name: 'hardware-chip' },
  { id: 'kreativitas', name: 'Kreativitas', icon_name: 'color-palette' },
  { id: 'kebersihan', name: 'Kebersihan', icon_name: 'broom' },
  { id: 'kecantikan', name: 'Kecantikan', icon_name: 'lipstick' },
  { id: 'keamanan', name: 'Keamanan', icon_name: 'shield-checkmark' },
  { id: 'kesehatan', name: 'Kesehatan', icon_name: 'medical-bag' },
];

export default function ProviderHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(HARDCODED_CATEGORIES);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // If backend has matching categories, you can uncomment this
      // const data = await categoryService.list();
      // setCategories(data);
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
      style={{ flex: 1, backgroundColor: '#FFFFFF' }} 
      contentContainerStyle={{ width: '100%', maxWidth: 390, minHeight: '100%', alignSelf: 'center', paddingHorizontal: 26, paddingTop: 54, paddingBottom: 98 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={BLUE} />
      }
    >
      <Text style={{ fontSize: 26, color: TEXT, marginTop: 8 }}>
        Selamat datang <Text style={{ color: YELLOW, fontWeight: '800' }}>{name}!</Text>
      </Text>
      <Text style={{ color: TEXT, marginBottom: 10, fontSize: 16 }}>Kamu mau kerja sebagai apa?</Text>

      {/* Banner */}
      <View style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden' }}>
        <Image 
          source={require('@/assets/images/header.png')} 
          style={{ width: '100%', height: 132, resizeMode: 'cover' }} 
        />
      </View>

      {/* Categories Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 24, justifyContent: 'center' }}>
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
    <Pressable onPress={onPress} style={{ width: 105, alignItems: 'center', marginBottom: 12 }}>
      <View style={{ width: 105, height: 105, borderRadius: 16, backgroundColor: LIGHT_BLUE, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
        {isMaterial ? (
          <MaterialCommunityIcons name={icon as any} size={50} color={BLUE} />
        ) : (
          <Ionicons name={icon as any} size={50} color={BLUE} />
        )}
        <Text style={{ color: TEXT, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 8 }} numberOfLines={1}>
          {category.name}
        </Text>
      </View>
    </Pressable>
  );
}
