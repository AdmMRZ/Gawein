import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { providerService } from '@/services/provider';
import { categoryService } from '@/services/category';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { ApiError } from '@/services/api';
import type { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#315BE8';
const YELLOW = '#FFD45A';

export default function CreateServiceScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // Location States
  const [cityId, setCityId] = useState<number | null>(null);
  const [cityName, setCityName] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const [scope, setScope] = useState('');
  const [limitations, setLimitations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
    api<any[]>('/cities/').then(setCities).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !price || !cityId) {
      setError('Harap isi judul, deskripsi, harga, dan lokasi kota');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await providerService.createService({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        location: cityName, // Legacy compatibility if needed
        city_id: cityId,
        category: selectedCategory,
        service_scope: scope.trim(),
        service_limitations: limitations.trim(),
      } as any);
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
      <Stack.Screen options={{ 
        title: 'Buat Layanan Baru',
        headerStyle: { backgroundColor: BLUE },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '800' }
      }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ backgroundColor: '#F8F9FA', padding: 20, borderRadius: 24, gap: 16 }}>
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
          
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#111' }}>Lokasi Kota *</Text>
            <Pressable 
              onPress={() => setCityModalVisible(true)}
              style={{ height: 56, borderWidth: 1.5, borderColor: '#D9D9D9', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#FFF' }}>
              <Text style={{ color: cityName ? '#111' : '#777' }}>{cityName || 'Pilih Area Layanan...'}</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Category Picker ─────────────────────── */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: BLUE }}>
            Pilih Kategori
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: selectedCategory === cat.id ? BLUE : '#F0F4FF',
                  borderWidth: 1.5,
                  borderColor: selectedCategory === cat.id ? BLUE : '#DDE5FF',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: selectedCategory === cat.id ? '#FFF' : BLUE,
                  }}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ backgroundColor: '#F8F9FA', padding: 20, borderRadius: 24, gap: 16 }}>
          <Input label="Cakupan Layanan" value={scope} onChangeText={setScope} placeholder="Apa saja yang termasuk" multiline style={{ height: 60, textAlignVertical: 'top', paddingTop: 12 }} />
          <Input label="Batasan" value={limitations} onChangeText={setLimitations} placeholder="Apa yang tidak termasuk" multiline style={{ height: 60, textAlignVertical: 'top', paddingTop: 12 }} />
        </View>

        {error ? (
          <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12 }}>
            <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '600' }}>{error}</Text>
          </View>
        ) : null}

        <Button 
          title="Buat Layanan Sekarang" 
          onPress={handleCreate} 
          loading={loading} 
          style={{ backgroundColor: YELLOW, height: 56, borderRadius: 16 }} 
          textStyle={{ color: '#111', fontWeight: '800' }}
        />
      </ScrollView>

      {/* Modal Kota */}
      <Modal visible={cityModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', height: '70%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: BLUE }}>Pilih Kota</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {cities.map(c => (
                <Pressable key={c.id} style={{ paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#EEE' }}
                  onPress={() => { setCityId(c.id); setCityName(c.name); setCityModalVisible(false); }}>
                  <Text style={{ fontSize: 16, color: '#111' }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{c.province_name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title="Batal" onPress={() => setCityModalVisible(false)} variant="outline" style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </>
  );
}
