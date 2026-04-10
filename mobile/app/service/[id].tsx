import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { providerService } from '@/services/provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { ApiError } from '@/services/api';
import type { Service } from '@/types';

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    providerService.getService(Number(id))
      .then((s) => {
        setService(s);
        setTitle(s.title);
        setDescription(s.description);
        setPrice(String(parseInt(s.price)));
        setLocation(s.location);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await providerService.updateService(Number(id), {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        location: location.trim(),
      });
      Alert.alert('Berhasil', 'Layanan diperbarui.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Stack.Screen options={{ title: `Edit: ${service?.title || ''}` }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.lg, paddingBottom: Spacing.section }}
        keyboardShouldPersistTaps="handled"
      >
        <Input label="Judul" value={title} onChangeText={setTitle} />
        <Input
          label="Deskripsi"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }}
        />
        <Input label="Harga (Rp)" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Input label="Lokasi" value={location} onChangeText={setLocation} />

        {error ? <Text style={{ fontSize: FontSize.sm, color: Colors.error }} selectable>{error}</Text> : null}

        <Button title="Simpan Perubahan" onPress={handleSave} loading={saving} fullWidth size="lg" />
      </ScrollView>
    </>
  );
}
