import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { categoryService } from '@/services/category';
import { Card } from '@/components/ui/card';
import { SkeletonCard } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import type { Category } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProviderHomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const catRes = await categoryService.list();
      setCategories(catRes);
    } catch {
      // Handle error quietly
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('bersih')) return 'sparkles-outline';
    if (lowerName.includes('listrik')) return 'flash-outline';
    if (lowerName.includes('pipa')) return 'water-outline';
    if (lowerName.includes('ac') || lowerName.includes('pendingin')) return 'snow-outline';
    if (lowerName.includes('taman')) return 'leaf-outline';
    if (lowerName.includes('cat') || lowerName.includes('bangun')) return 'color-palette-outline';
    return 'briefcase-outline';
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.cream }}
      contentContainerStyle={{ 
        paddingHorizontal: Spacing.xxl, 
        paddingTop: insets.top + Spacing.xxl,
        paddingBottom: Spacing.section 
      }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ marginBottom: Spacing.xl }}>
        <Text
          style={{
            fontSize: FontSize.md,
            color: Colors.textSecondary,
            marginBottom: Spacing.xs,
          }}
        >
          Halo, {user?.first_name || 'Pencari Kerja'}
        </Text>
        <Text
          style={{
            fontSize: FontSize.display,
            fontWeight: FontWeight.bold,
            color: Colors.navy,
            letterSpacing: -0.5,
          }}
        >
          Pilih Kategori Pekerjaan
        </Text>
        <Text
          style={{
            fontSize: FontSize.md,
            color: Colors.textMuted,
            marginTop: Spacing.sm,
            lineHeight: 22,
          }}
        >
          Daftarkan keahlian Anda untuk mulai menerima pesanan dari pencari jasa.
        </Text>
      </View>

      {loading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ width: '47%' }}>
              <SkeletonCard />
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.md }}>
          {categories.map((category) => (
            <Link key={category.id} href={`/(provider)/form/${category.id}`} asChild>
              <Pressable style={{ width: '47%', marginBottom: Spacing.sm }}>
                <Card style={{ alignItems: 'center', padding: Spacing.xl, gap: Spacing.md }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: Colors.navy + '10',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons 
                      name={getCategoryIcon(category.name)} 
                      size={28} 
                      color={Colors.navy} 
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: FontSize.md,
                      fontWeight: FontWeight.semibold,
                      color: Colors.textPrimary,
                      textAlign: 'center',
                    }}
                  >
                    {category.name}
                  </Text>
                </Card>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
