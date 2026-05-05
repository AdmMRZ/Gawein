import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Image, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

const BLUE = '#315BE8';
const YELLOW = '#FFD45A';
const TEXT = '#111111';
const MUTED = '#777777';
const BORDER = '#D9D9D9';
const BG = '#F9F9F9';

type Option = { id: string; name: string };

export default function RegisterCategoryScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const router = useRouter();

  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // Personal Info (Pre-filled)
  const initialName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || '';
  const [nama, setNama] = useState(initialName);
  const [noTelp, setNoTelp] = useState(user?.phone || '+62');
  const [gender, setGender] = useState(user?.gender || 'Laki-laki');
  const [email, setEmail] = useState(user?.email || '');
  
  // Location
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);
  
  const [selectedProv, setSelectedProv] = useState<Option | null>(null);
  const [selectedCity, setSelectedCity] = useState<Option | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Option | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Option | null>(null);
  const [alamatLengkap, setAlamatLengkap] = useState('');

  const [pengalaman, setPengalaman] = useState('');
  const [tahunPengalaman, setTahunPengalaman] = useState('');
  const [gaji, setGaji] = useState('');

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Select Modals
  const [selectModalConfig, setSelectModalConfig] = useState<{ visible: boolean; title: string; data: Option[]; onSelect: (o: Option) => void } | null>(null);

  // Reset form when category changes
  useEffect(() => {
    setImageUri(null);
    setSelectedProv(null);
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setAlamatLengkap('');
    setPengalaman('');
    setTahunPengalaman('');
    setGaji('');
  }, [categoryId]);

  useEffect(() => {
    fetch('https://api-regional-indonesia.vercel.app/api/provinces?sort=name')
      .then(r => r.json())
      .then(res => setProvinces(res.data || []))
      .catch(console.error);
  }, []);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openSelectModal = (title: string, data: Option[], onSelect: (o: Option) => void) => {
    setSelectModalConfig({ visible: true, title, data, onSelect });
  };

  const handleSelectProv = (prov: Option) => {
    setSelectedProv(prov);
    setSelectedCity(null); setSelectedDistrict(null); setSelectedVillage(null);
    setCities([]); setDistricts([]); setVillages([]);
    fetch(`https://api-regional-indonesia.vercel.app/api/cities/${prov.id}?sort=name`)
      .then(r => r.json()).then(res => setCities(res.data || []));
  };

  const handleSelectCity = (city: Option) => {
    setSelectedCity(city);
    setSelectedDistrict(null); setSelectedVillage(null);
    setDistricts([]); setVillages([]);
    fetch(`https://api-regional-indonesia.vercel.app/api/districts/${city.id}?sort=name`)
      .then(r => r.json()).then(res => setDistricts(res.data || []));
  };

  const handleSelectDistrict = (district: Option) => {
    setSelectedDistrict(district);
    setSelectedVillage(null);
    setVillages([]);
    fetch(`https://api-regional-indonesia.vercel.app/api/villages/${district.id}?sort=name`)
      .then(r => r.json()).then(res => setVillages(res.data || []));
  };

  const handleConfirm = async () => {
    try {
      await api('/providers/registration/', {
        method: 'POST',
        body: {
          category_id: categoryId,
          foto_diri: imageUri || '',
          provinsi_id: selectedProv?.id || '',
          provinsi_name: selectedProv?.name || '',
          kota_id: selectedCity?.id || '',
          kota_name: selectedCity?.name || '',
          kecamatan_id: selectedDistrict?.id || '',
          kecamatan_name: selectedDistrict?.name || '',
          kelurahan_id: selectedVillage?.id || '',
          kelurahan_name: selectedVillage?.name || '',
          alamat_lengkap: alamatLengkap,
          pengalaman: pengalaman,
          tahun_pengalaman: parseInt(tahunPengalaman || '0', 10),
          gaji_diharapkan: gaji || '0'
        }
      });
      setShowConfirmModal(false);
      setTimeout(() => setShowSuccessModal(true), 500);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan data pendaftaran');
    }
  };

  const handleSelesai = () => {
    setShowSuccessModal(false);
    router.replace('/(provider)');
  };

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ padding: 26, paddingTop: 60, paddingBottom: 100 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4, marginLeft: -8 }}>
            <Ionicons name="arrow-back" size={26} color={TEXT} />
          </Pressable>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '700', color: TEXT }}>
              Data Diri <Text style={{ color: YELLOW }}>{categoryName || 'Kategori'}</Text>
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, color: TEXT, marginBottom: 24, marginTop: -12 }}>Masukkan data diri kamu!</Text>

        {/* Avatar Pick */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 120, height: 120 }}>
            <Pressable onPress={handlePickImage} style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: BORDER }}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Ionicons name="person" size={60} color="#AAAAAA" />
              )}
            </Pressable>
            <Pressable onPress={handlePickImage} style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: YELLOW, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 }}>
               <Ionicons name="camera" size={20} color={TEXT} />
            </Pressable>
          </View>
        </View>

        {/* Personal Info Summary (Read Only) */}
        <View style={{ backgroundColor: '#F0F4FF', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: BLUE + '33' }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: BLUE, marginBottom: 12 }}>Informasi Profil Anda</Text>
          <View style={{ gap: 8 }}>
            <InfoRow label="Nama" value={nama} icon="person-outline" />
            <InfoRow label="No. HP" value={noTelp} icon="call-outline" />
            <InfoRow label="Email" value={email} icon="mail-outline" />
            <InfoRow label="Gender" value={gender} icon="transgender-outline" />
          </View>
        </View>

        <Text style={styles.label}>Alamat</Text>
        <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 16, gap: 12, marginBottom: 20 }}>
           <Pressable style={styles.select} onPress={() => openSelectModal('Pilih Provinsi', provinces, handleSelectProv)}>
              <Text>{selectedProv ? selectedProv.name : 'Pilih Provinsi'}</Text>
              <Ionicons name="chevron-down" size={18} />
           </Pressable>
           <Pressable style={styles.select} onPress={() => selectedProv ? openSelectModal('Pilih Kota/Kab', cities, handleSelectCity) : alert('Pilih Provinsi dulu')}>
              <Text>{selectedCity ? selectedCity.name : 'Pilih Kota/Kab'}</Text>
              <Ionicons name="chevron-down" size={18} />
           </Pressable>
           <Pressable style={styles.select} onPress={() => selectedCity ? openSelectModal('Pilih Kecamatan', districts, handleSelectDistrict) : alert('Pilih Kota dulu')}>
              <Text>{selectedDistrict ? selectedDistrict.name : 'Pilih Kecamatan'}</Text>
              <Ionicons name="chevron-down" size={18} />
           </Pressable>
           <Pressable style={styles.select} onPress={() => selectedDistrict ? openSelectModal('Pilih Kelurahan/Desa', villages, setSelectedVillage) : alert('Pilih Kecamatan dulu')}>
              <Text>{selectedVillage ? selectedVillage.name : 'Pilih Kelurahan/Desa'}</Text>
              <Ionicons name="chevron-down" size={18} />
           </Pressable>
           <TextInput style={styles.input} value={alamatLengkap} onChangeText={setAlamatLengkap} placeholder="Alamat Lengkap (Jalan, No Rumah, dll)" />
        </View>

        <Field label="Pengalaman">
          <TextInput style={styles.input} value={pengalaman} onChangeText={setPengalaman} placeholder="Misal: Teknisi AC" />
        </Field>
        <Field label="Pengalaman (dalam tahun)">
          <TextInput style={styles.input} value={tahunPengalaman} onChangeText={setTahunPengalaman} keyboardType="number-pad" placeholder="Misal: 3" />
        </Field>
        <Field label="Gaji yang diinginkan per hari (Rp)">
          <TextInput style={styles.input} value={gaji} onChangeText={setGaji} keyboardType="number-pad" placeholder="Misal: 250000" />
        </Field>

        <Pressable onPress={() => setShowConfirmModal(true)} style={styles.mainBtn}>
          <Text style={styles.mainBtnText}>Simpan</Text>
        </Pressable>

      </ScrollView>

      {/* Select Modal */}
      <Modal visible={selectModalConfig?.visible || false} animationType="slide" transparent>
         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', height: '60%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                 <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{selectModalConfig?.title}</Text>
                 <Pressable onPress={() => setSelectModalConfig(null)}><Ionicons name="close" size={24} /></Pressable>
               </View>
               <ScrollView>
                 {selectModalConfig?.data.length === 0 ? <ActivityIndicator size="small" color={BLUE} /> : null}
                 {selectModalConfig?.data.map((item) => (
                   <Pressable key={item.id} style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: BORDER }} onPress={() => { selectModalConfig.onSelect(item); setSelectModalConfig(null); }}>
                     <Text style={{ fontSize: 16 }}>{item.name}</Text>
                   </Pressable>
                 ))}
               </ScrollView>
            </View>
         </View>
      </Modal>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 12 }}>Apakah kamu yakin ingin mendaftarkan diri pada kategori ini?</Text>
            <Text style={{ fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 24 }}>Pastikan data diri anda sudah benar sebelum dikonfirmasi</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={() => setShowConfirmModal(false)} style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: YELLOW, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontWeight: '800', color: TEXT }}>Batalkan</Text>
              </Pressable>
              <Pressable onPress={handleConfirm} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: YELLOW, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontWeight: '800', color: TEXT }}>Lanjutkan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 12 }}>Selamat! Pendaftaran Anda telah berhasil.</Text>
            <Text style={{ fontSize: 50, marginBottom: 20 }}>🎉</Text>
            <Text style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginBottom: 24 }}>
              Terima kasih telah mempercayakan kebutuhan layanan Anda kepada GaweIn. Kami berharap dapat membantu Anda dalam kebutuhan selanjutnya.
            </Text>
            <Pressable onPress={handleSelesai} style={{ width: '100%', height: 48, borderRadius: 12, backgroundColor: YELLOW, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: TEXT }}>Selesai</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={icon} size={16} color={BLUE} />
      <Text style={{ fontSize: 13, color: MUTED, width: 60 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: TEXT, fontWeight: '600', flex: 1 }}>{value}</Text>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = {
  label: { fontSize: 14, color: TEXT, marginBottom: 8, fontWeight: '500' as const },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    backgroundColor: BG,
    color: TEXT,
  },
  select: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    backgroundColor: BG,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  mainBtn: {
    height: 56,
    backgroundColor: YELLOW,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: 10,
  },
  mainBtnText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800' as const,
  }
};
