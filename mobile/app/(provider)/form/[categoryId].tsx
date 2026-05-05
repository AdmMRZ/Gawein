import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services/user';
import { providerService } from '@/services/provider';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfirmPopup, SuccessPopup } from '@/components/ui/form-popups';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REGIONAL_API_BASE = 'https://api-regional-indonesia.vercel.app/api';

export default function ProviderFormScreen() {
  const { categoryId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Form State
  const [form, setForm] = useState({
    fullName: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    phone: '',
    gender: '',
    email: user?.email || '',
    fullAddress: '',
    provinceId: '',
    provinceName: '',
    cityId: '',
    cityName: '',
    districtId: '',
    districtName: '',
    villageId: '',
    villageName: '',
    bio: '',
    experienceYears: '',
    price: '',
  });

  // Regional Data State
  const [provinces, setProvinces] = useState<{label: string, value: string}[]>([]);
  const [cities, setCities] = useState<{label: string, value: string}[]>([]);
  const [districts, setDistricts] = useState<{label: string, value: string}[]>([]);
  const [villages, setVillages] = useState<{label: string, value: string}[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load initial user profile
  useEffect(() => {
    async function init() {
      try {
        const { profile } = await userService.getProfile();
        if (profile) {
          setForm(prev => ({
            ...prev,
            phone: profile.phone || '',
            gender: 'gender' in profile ? profile.gender : '',
            bio: 'bio' in profile ? profile.bio : '',
            experienceYears: 'years_of_experience' in profile && profile.years_of_experience ? profile.years_of_experience.toString() : '',
          }));
        }
      } catch (e) {
        console.log('Error loading profile', e);
      }
    }
    init();
    fetchProvinces();
  }, []);

  // Fetch Regions
  const fetchProvinces = async () => {
    try {
      const res = await fetch(`${REGIONAL_API_BASE}/provinces?sort=name`);
      const json = await res.json();
      if (json.status) {
        setProvinces(json.data.map((item: any) => ({ label: item.name, value: item.id })));
      }
    } catch (e) {
      console.log('Error fetching provinces', e);
    }
  };

  const fetchCities = async (provId: string) => {
    try {
      const res = await fetch(`${REGIONAL_API_BASE}/cities/${provId}?sort=name`);
      const json = await res.json();
      if (json.status) {
        setCities(json.data.map((item: any) => ({ label: item.name, value: item.id })));
      }
    } catch (e) {
      console.log('Error fetching cities', e);
    }
  };

  const fetchDistricts = async (cityId: string) => {
    try {
      const res = await fetch(`${REGIONAL_API_BASE}/districts/${cityId}?sort=name`);
      const json = await res.json();
      if (json.status) {
        setDistricts(json.data.map((item: any) => ({ label: item.name, value: item.id })));
      }
    } catch (e) {
      console.log('Error fetching districts', e);
    }
  };

  const fetchVillages = async (distId: string) => {
    try {
      const res = await fetch(`${REGIONAL_API_BASE}/villages/${distId}?sort=name`);
      const json = await res.json();
      if (json.status) {
        setVillages(json.data.map((item: any) => ({ label: item.name, value: item.id })));
      }
    } catch (e) {
      console.log('Error fetching villages', e);
    }
  };

  // Handle Selection
  const handleSelectProvince = (id: string) => {
    const name = provinces.find(p => p.value === id)?.label || '';
    setForm(prev => ({ ...prev, provinceId: id, provinceName: name, cityId: '', cityName: '', districtId: '', districtName: '', villageId: '', villageName: '' }));
    setCities([]); setDistricts([]); setVillages([]);
    fetchCities(id);
  };

  const handleSelectCity = (id: string) => {
    const name = cities.find(c => c.value === id)?.label || '';
    setForm(prev => ({ ...prev, cityId: id, cityName: name, districtId: '', districtName: '', villageId: '', villageName: '' }));
    setDistricts([]); setVillages([]);
    fetchDistricts(id);
  };

  const handleSelectDistrict = (id: string) => {
    const name = districts.find(d => d.value === id)?.label || '';
    setForm(prev => ({ ...prev, districtId: id, districtName: name, villageId: '', villageName: '' }));
    setVillages([]);
    fetchVillages(id);
  };

  const handleSelectVillage = (id: string) => {
    const name = villages.find(v => v.value === id)?.label || '';
    setForm(prev => ({ ...prev, villageId: id, villageName: name }));
  };

  const handleSave = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // 1. Update Profile
      const locationString = [form.fullAddress, form.villageName, form.districtName, form.cityName, form.provinceName]
        .filter(Boolean).join(', ');
      
      await userService.updateProfile({
        gender: form.gender,
        bio: form.bio,
        years_of_experience: parseInt(form.experienceYears) || 0,
        location: locationString,
        phone: form.phone,
      });

      // 2. Create Service
      await providerService.createService({
        category: parseInt(categoryId as string),
        title: `Jasa oleh ${form.fullName}`,
        description: form.bio,
        price: parseInt(form.price) || 0,
        location: locationString,
      });

      setShowConfirm(false);
      setShowSuccess(true);
    } catch (e) {
      console.log('Error submitting form', e);
      setShowConfirm(false);
      alert('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Return to provider dashboard or home
    router.replace('/(provider)/');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: Colors.cream }}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: Spacing.md,
            paddingHorizontal: Spacing.xl,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.grayLight,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
          }}
        >
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.navy} />
          </Pressable>
          <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.navy }}>
            Formulir Data Diri
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: Spacing.xxl,
            paddingBottom: insets.bottom + 100,
            gap: Spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Upload Foto */}
          <View style={{ alignItems: 'center', gap: Spacing.md }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: Colors.grayLight,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: Colors.navy,
                borderStyle: 'dashed',
              }}
            >
              <Ionicons name="camera" size={32} color={Colors.textMuted} />
            </View>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary }}>Upload foto diri</Text>
          </View>

          {/* 2-5. Data Pribadi */}
          <View style={{ gap: Spacing.lg }}>
            <Input
              label="Nama Lengkap"
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
              placeholder="Masukkan nama lengkap"
            />
            <Input
              label="Nomor Telepon"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
            />
            <Select
              label="Gender"
              value={form.gender}
              onSelect={(val) => setForm({ ...form, gender: val })}
              placeholder="Pilih Gender"
              options={[
                { label: 'Laki-laki', value: 'L' },
                { label: 'Perempuan', value: 'P' },
              ]}
            />
            <Input
              label="Alamat Email"
              value={form.email}
              onChangeText={() => {}}
              placeholder="nama@email.com"
              keyboardType="email-address"
              disabled
              helper="Email diambil dari akun Anda."
            />
          </View>

          {/* 7. Alamat */}
          <View style={{ gap: Spacing.lg }}>
            <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.navy }}>
              Alamat
            </Text>
            
            <Select
              label="Provinsi"
              value={form.provinceId}
              onSelect={handleSelectProvince}
              options={provinces}
              placeholder="Pilih Provinsi"
            />
            <Select
              label="Kota/Kab"
              value={form.cityId}
              onSelect={handleSelectCity}
              options={cities}
              placeholder="Pilih Kota/Kabupaten"
              disabled={!form.provinceId}
            />
            <Select
              label="Kecamatan"
              value={form.districtId}
              onSelect={handleSelectDistrict}
              options={districts}
              placeholder="Pilih Kecamatan"
              disabled={!form.cityId}
            />
            <Select
              label="Kelurahan/Desa"
              value={form.villageId}
              onSelect={handleSelectVillage}
              options={villages}
              placeholder="Pilih Kelurahan/Desa"
              disabled={!form.districtId}
            />

            <Input
              label="Alamat Lengkap"
              value={form.fullAddress}
              onChangeText={(text) => setForm({ ...form, fullAddress: text })}
              placeholder="Jl. Contoh No. 123, RT 01/RW 02"
              multiline
              style={{ height: 80, textAlignVertical: 'top' }}
            />
          </View>

          {/* 8-10. Pengalaman & Gaji */}
          <View style={{ gap: Spacing.lg }}>
            <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.navy }}>
              Pengalaman & Ekspektasi
            </Text>
            <Input
              label="Pengalaman (Deskripsi)"
              value={form.bio}
              onChangeText={(text) => setForm({ ...form, bio: text })}
              placeholder="Ceritakan keahlian dan pengalaman kerja Anda"
              multiline
              style={{ height: 100, textAlignVertical: 'top' }}
            />
            <Input
              label="Pengalaman (dalam tahun)"
              value={form.experienceYears}
              onChangeText={(text) => setForm({ ...form, experienceYears: text })}
              placeholder="Contoh: 3"
              keyboardType="numeric"
            />
            <Input
              label="Gaji/Harga yang diinginkan (Rp)"
              value={form.price}
              onChangeText={(text) => setForm({ ...form, price: text })}
              placeholder="Contoh: 150000"
              keyboardType="numeric"
            />
          </View>

          {/* Button Simpan */}
          <View style={{ marginTop: Spacing.md }}>
            <Button title="Simpan" size="lg" onPress={handleSave} />
          </View>

        </ScrollView>
      </View>

      <ConfirmPopup
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        loading={submitting}
      />

      <SuccessPopup
        visible={showSuccess}
        onClose={handleSuccessClose}
      />
    </KeyboardAvoidingView>
  );
}
