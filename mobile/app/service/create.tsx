import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { providerService } from '@/services/provider';
import { categoryService } from '@/services/category';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { ApiError } from '@/services/api';
import type { Category } from '@/types';
import { Pressable } from 'react-native';

export default function CreateServiceScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [scope, setScope] = useState('');
  const [limitations, setLimitations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !price) {
      setError('Harap isi judul, deskripsi, dan harga');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await providerService.createService({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        location: location.trim(),
        category: selectedCategory,
        service_scope: scope.trim(),
        service_limitations: limitations.trim(),
      });
      Alert.alert('Berhasil', 'Layanan berhasil dibuat.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal membuat layanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Buat Layanan Baru' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.lg, paddingBottom: Spacing.section }}
        keyboardShouldPersistTaps="handled"
      >
        <Input label="Judul Layanan *" value={title} onChangeText={setTitle} placeholder="Contoh: Tukang Kebun Profesional" />
        <Input
          label="Deskripsi *"
          value={description}
          onChangeText={setDescription}
          placeholder="Jelaskan layanan yang ditawarkan..."
          multiline
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }}
        />
        <Input label="Harga (Rp) *" value={price} onChangeText={setPrice} placeholder="150000" keyboardType="numeric" />
        <Input label="Lokasi" value={location} onChangeText={setLocation} placeholder="Area layanan" />

        {/* ── Category Picker ─────────────────────── */}
        {categories.length > 0 && (
          <View style={{ gap: Spacing.xs }}>
            <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary }}>
              Kategori
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                  style={{
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.xs,
                    borderRadius: Radius.pill,
                    backgroundColor: selectedCategory === cat.id ? Colors.navy : Colors.white,
                    borderWidth: 1,
                    borderColor: selectedCategory === cat.id ? Colors.navy : Colors.grayLight,
                  }}
                >
                  <Text
                    style={{
                      fontSize: FontSize.sm,
                      color: selectedCategory === cat.id ? Colors.textInverse : Colors.textSecondary,
                    }}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <Input label="Cakupan Layanan" value={scope} onChangeText={setScope} placeholder="Apa saja yang termasuk" multiline style={{ height: 60, textAlignVertical: 'top', paddingTop: 12 }} />
        <Input label="Batasan" value={limitations} onChangeText={setLimitations} placeholder="Apa yang tidak termasuk" multiline style={{ height: 60, textAlignVertical: 'top', paddingTop: 12 }} />

        {error ? <Text style={{ fontSize: FontSize.sm, color: Colors.error }} selectable>{error}</Text> : null}

        <Button title="Buat Layanan" onPress={handleCreate} loading={loading} fullWidth size="lg" variant="secondary" />
      </ScrollView>
    </>
  );
}
