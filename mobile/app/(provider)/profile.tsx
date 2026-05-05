import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { userService, type PaymentCard, type PaymentCardInput } from '@/services/user';
import { LoadingScreen } from '@/components/ui/loading-screen';
import type { ProviderProfileData } from '@/types';

type ScreenMode = 'profile' | 'edit' | 'cards' | 'add-card';
type GenderValue = 'Perempuan' | 'Laki-laki' | 'Lainnya';

const BLUE = '#315BE8';
const YELLOW = '#FFD45A';
const BORDER = '#D8D8D8';
const MUTED = '#9B9B9B';

const initialCardForm: PaymentCardInput = {
  card_number: '',
  expiry_date: '',
  cvv: '',
  cardholder_name: '',
  billing_address: '',
};

export default function ProviderProfileScreen() {
  const { user, logout, refreshProfile } = useAuth();
  const [mode, setMode] = useState<ScreenMode>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [providerProfile, setProviderProfile] = useState<ProviderProfileData | null>(null);
  
  // Card states
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [visibleCards, setVisibleCards] = useState<Record<number, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<PaymentCard | null>(null);
  const [cardForm, setCardForm] = useState<PaymentCardInput>(initialCardForm);

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<GenderValue>('Laki-laki');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const displayName = useMemo(() => {
    const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    return name || user?.username || 'Pekerja Gawein';
  }, [user]);

  useEffect(() => {
    loadData();
    loadCards();
  }, []);

  const loadData = async () => {
    try {
      const res = await userService.getProfile();
      const p = res.profile as ProviderProfileData;
      setProviderProfile(p);
      setFullName(displayName);
      setPhone(user?.phone || '');
      setGender(normalizeGender(user?.gender));
      setBio(p?.bio || '');
      setAge(p?.age?.toString() || '');
      setYearsExp(p?.years_of_experience?.toString() || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async () => {
    try {
      const result = await userService.getPaymentCards();
      setCards(result);
    } catch {
      setCards([]);
    }
  };

  const goProfile = () => {
    setMode('profile');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveProfile = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert('Nama wajib diisi', 'Masukkan nama lengkap terlebih dahulu.');
      return;
    }

    setSaving(true);
    try {
      const [firstName, ...lastNameParts] = trimmedName.split(/\s+/);
      await userService.updateProfile({
        first_name: firstName,
        last_name: lastNameParts.join(' '),
        phone,
        gender,
        bio,
        age: age ? parseInt(age, 10) : null,
        years_of_experience: yearsExp ? parseInt(yearsExp, 10) : 0,
      });

      if (newPassword) {
        await userService.changePassword({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        });
      }

      await refreshProfile();
      await loadData();
      setSuccessMessage('Profil anda telah berhasil diperbarui');
      goProfile();
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Tidak bisa menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = async () => {
    const payload = normalizeCardForm(cardForm);
    if (!payload.card_number || !payload.expiry_date || !payload.cvv || !payload.cardholder_name || !payload.billing_address) {
      Alert.alert('Data belum lengkap', 'Lengkapi semua detail kartu terlebih dahulu.');
      return;
    }

    setSaving(true);
    try {
      await userService.addPaymentCard(payload);
      setCardForm(initialCardForm);
      await loadCards();
      Alert.alert('Berhasil', 'Kartu anda telah ditambahkan.');
      setMode('cards');
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Tidak bisa menambahkan kartu.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteCard = async () => {
    if (!deleteTarget) return;
    try {
      await userService.deletePaymentCard(deleteTarget.id);
      setDeleteTarget(null);
      await loadCards();
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Tidak bisa menghapus kartu.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batalkan', style: 'cancel' },
      { text: 'Lanjutkan', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.root}>
      {mode === 'profile' && (
        <ProfileHome
          displayName={displayName}
          email={user?.email || '-'}
          gender={gender}
          kotaName={providerProfile?.kota_name || null}
          bio={bio}
          yearsExp={yearsExp}
          onCards={() => setMode('cards')}
          onEdit={() => setMode('edit')}
          onLogout={handleLogout}
        />
      )}
      {mode === 'edit' && (
        <EditProfile
          {...{
            fullName, fullNameSet: setFullName,
            phone, phoneSet: setPhone,
            gender, genderSet: setGender,
            bio, bioSet: setBio,
            age, ageSet: setAge,
            yearsExp, yearsExpSet: setYearsExp,

            oldPassword, oldPasswordSet: setOldPassword,
            newPassword, newPasswordSet: setNewPassword,
            confirmPassword, confirmPasswordSet: setConfirmPassword,
            saving, onBack: goProfile, onSave: handleSaveProfile
          }}
        />
      )}
      {mode === 'cards' && (
        <CardDetails
          cards={cards}
          visibleCards={visibleCards}
          onBack={goProfile}
          onAdd={() => setMode('add-card')}
          onToggle={(id) => setVisibleCards((prev) => ({ ...prev, [id]: !prev[id] }))}
          onDelete={setDeleteTarget}
        />
      )}
      {mode === 'add-card' && (
        <AddCard
          form={cardForm}
          saving={saving}
          onBack={() => setMode('cards')}
          onChange={(key, value) => setCardForm((prev) => ({ ...prev, [key]: value }))}
          onSubmit={handleAddCard}
        />
      )}



      {/* Delete Card Modal */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteBox}>
            <Text style={styles.modalTitle}>Hapus Kartu?</Text>
            <Text style={{ marginBottom: 20, color: '#666' }}>Yakin ingin menghapus kartu ini?</Text>
            <View style={styles.deleteActions}>
              <Pressable onPress={() => setDeleteTarget(null)} style={styles.cancelDelete}>
                <Text style={styles.deleteActionText}>Batal</Text>
              </Pressable>
              <Pressable onPress={confirmDeleteCard} style={styles.continueDelete}>
                <Text style={styles.deleteActionText}>Hapus</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <SuccessModal message={successMessage} onClose={() => setSuccessMessage('')} />
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={23} color="#FFFFFF" />
          <Text style={styles.backText}>Kembali</Text>
        </Pressable>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function ProfileHome({ displayName, email, gender, kotaName, bio, yearsExp, onCards, onEdit, onLogout }: any) {
  return (
    <>
      <Header title="Profil Saya" />
      <ScrollView contentContainerStyle={styles.profileContent}>
        <AvatarPhoto />
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileMeta}>{gender} • {kotaName || 'Lokasi belum diset'}</Text>
        
        <Pressable onPress={onCards} style={styles.smallBlueButton}>
          <Text style={styles.smallBlueButtonText}>Lihat Detail Kartu</Text>
        </Pressable>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{yearsExp || 0}</Text>
            <Text style={styles.statLabel}>Thn Pengalaman</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.infoList}>
          <InfoItem icon="mail-outline" label="Email" value={email} />
          <InfoItem icon="document-text-outline" label="Bio" value={bio || 'Belum ada bio.'} />
        </View>

        <View style={styles.actionStack}>
          <PrimaryButton title="Edit Profil" color={YELLOW} textColor="#111" onPress={onEdit} />
          <PrimaryButton title="Keluar" color={BLUE} textColor="#FFF" onPress={onLogout} />
        </View>
      </ScrollView>
    </>
  );
}

function CardDetails({ cards, visibleCards, onBack, onAdd, onToggle, onDelete }: any) {
  return (
    <>
      <Header title="Detail Kartu" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.cardsContent}>
        {cards.map((card: any, index: number) => (
          <View key={card.id} style={styles.cardItem}>
            <View style={styles.blackCard}>
              <Text style={styles.blackText}>GaweIn Card</Text>
              <Text style={styles.cardNumber}>
                {visibleCards[card.id] ? formatCardNumber(card.card_number) : '**** **** **** ' + card.card_number.slice(-4)}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <Text style={{ color: '#FFF', fontSize: 12 }}>{card.cardholder_name}</Text>
                <Text style={{ color: '#FFF', fontSize: 12 }}>{card.expiry_date}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 }}>
              <Pressable onPress={() => onToggle(card.id)}>
                <Ionicons name={visibleCards[card.id] ? "eye-off-outline" : "eye-outline"} size={24} color={BLUE} />
              </Pressable>
              <Pressable onPress={() => onDelete(card)}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        ))}
        {cards.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#999' }}>Belum ada kartu tersimpan.</Text>
          </View>
        )}
        <Pressable onPress={onAdd} style={styles.addCardButton}>
          <Ionicons name="add" size={32} color={BLUE} />
          <Text style={{ color: BLUE, fontWeight: '700' }}>Tambah Kartu Baru</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

function AddCard({ form, saving, onBack, onChange, onSubmit }: any) {
  return (
    <>
      <Header title="Tambah Kartu" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.formContent}>
        <FormInput label="Nomor Kartu" value={form.card_number} onChangeText={(v: string) => onChange('card_number', v.replace(/\D/g, '').slice(0, 16))} keyboardType="number-pad" placeholder="1234 5678 1234 5678" />
        <View style={styles.splitRow}>
          <View style={styles.splitCell}>
            <FormInput label="Masa Berlaku" value={form.expiry_date} onChangeText={(v: string) => onChange('expiry_date', v)} placeholder="MM/YY" />
          </View>
          <View style={styles.splitCell}>
            <FormInput label="CVV" value={form.cvv} onChangeText={(v: string) => onChange('cvv', v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry placeholder="123" />
          </View>
        </View>
        <FormInput label="Nama di Kartu" value={form.cardholder_name} onChangeText={(v: string) => onChange('cardholder_name', v)} placeholder="NAMA LENGKAP" />
        <FormInput label="Alamat Penagihan" value={form.billing_address} onChangeText={(v: string) => onChange('billing_address', v)} placeholder="Alamat lengkap..." />
        <PrimaryButton title={saving ? "Menyimpan..." : "Simpan Kartu"} color={BLUE} textColor="#FFF" onPress={onSubmit} />
      </ScrollView>
    </>
  );
}

function EditProfile(props: any) {
  return (
    <>
      <Header title="Edit Profil" onBack={props.onBack} />
      <ScrollView contentContainerStyle={styles.formContent}>
        <View style={styles.editAvatarWrap}>
          <AvatarPhoto size={96} />
          <View style={styles.cameraBadge}><Ionicons name="camera-outline" size={15} color="#FFF" /></View>
        </View>

        <FormInput label="Nama Lengkap" value={props.fullName} onChangeText={props.fullNameSet} icon="person-outline" />
        <FormInput label="Nomor HP" value={props.phone} onChangeText={props.phoneSet} keyboardType="phone-pad" icon="call-outline" />
        <GenderPicker value={props.gender} onChange={props.genderSet} />
        
        <View style={styles.splitRow}>
          <View style={styles.splitCell}>
            <FormInput label="Umur" value={props.age} onChangeText={props.ageSet} keyboardType="number-pad" icon="calendar-outline" />
          </View>
          <View style={styles.splitCell}>
            <FormInput label="Pengalaman (Thn)" value={props.yearsExp} onChangeText={props.yearsExpSet} keyboardType="number-pad" icon="briefcase-outline" />
          </View>
        </View>


        <FormInput label="Bio" value={props.bio} onChangeText={props.bioSet} multiline style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }} />

        <View style={{ height: 20 }} />
        <Text style={[styles.inputLabel, { color: BLUE }]}>Keamanan</Text>
        <FormInput label="Password Lama" value={props.oldPassword} onChangeText={props.oldPasswordSet} secureTextEntry icon="lock-closed-outline" />
        <FormInput label="Password Baru" value={props.newPassword} onChangeText={props.newPasswordSet} secureTextEntry icon="lock-closed-outline" />
        <FormInput label="Konfirmasi Password" value={props.confirmPassword} onChangeText={props.confirmPasswordSet} secureTextEntry icon="lock-closed-outline" />

        <PrimaryButton title={props.saving ? 'Menyimpan...' : 'Simpan Perubahan'} color={BLUE} textColor="#FFF" onPress={props.onSave} />
      </ScrollView>
    </>
  );
}

function FormInput({ label, value, onChangeText, icon, ...rest }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput value={value} onChangeText={onChangeText} placeholderTextColor="#BDBDBD" style={styles.input} {...rest} />
        {icon && <Ionicons name={icon} size={22} color="#AFAFAF" />}
      </View>
    </View>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={24} color={BLUE} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function PrimaryButton({ title, color, textColor, onPress, loading }: any) {
  return (
    <Pressable onPress={onPress} style={[styles.primaryButton, { backgroundColor: color }]}>
      <Text style={[styles.primaryButtonText, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

function GenderPicker({ value, onChange }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Gender</Text>
      <View style={styles.genderRow}>
        {['Perempuan', 'Laki-laki', 'Lainnya'].map((g) => (
          <Pressable key={g} onPress={() => onChange(g)} style={[styles.genderPill, value === g && styles.genderPillActive]}>
            <Text style={[styles.genderText, value === g && styles.genderTextActive]}>{g}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AvatarPhoto({ size = 112 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="person" size={size * 0.6} color="#FFF" />
    </View>
  );
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

function normalizeCardForm(form: PaymentCardInput): PaymentCardInput {
  return {
    card_number: form.card_number.replace(/\D/g, ''),
    expiry_date: form.expiry_date.trim(),
    cvv: form.cvv.replace(/\D/g, ''),
    cardholder_name: form.cardholder_name.trim(),
    billing_address: form.billing_address.trim(),
  };
}

function normalizeGender(value?: string): GenderValue {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'male' || normalized === 'laki-laki') return 'Laki-laki';
  if (normalized === 'other' || normalized === 'lainnya') return 'Lainnya';
  return 'Perempuan';
}

function SuccessModal({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <Modal transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.successBox}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-sharp" size={40} color={BLUE} />
          </View>
          <Text style={styles.successTitle}>Berhasil!</Text>
          <Text style={styles.successMessage}>{message}</Text>
          <Pressable onPress={onClose} style={[styles.primaryButton, { backgroundColor: YELLOW, width: '100%', marginTop: 10 }]}>
            <Text style={[styles.primaryButtonText, { color: '#111' }]}>Siap!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  header: { height: 140, backgroundColor: BLUE, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 25 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  backButton: { position: 'absolute', left: 20, bottom: 30, flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  profileContent: { alignItems: 'center', paddingTop: 30, paddingHorizontal: 30, paddingBottom: 120 },
  avatar: { backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  profileName: { marginTop: 15, fontSize: 22, fontWeight: '900', color: '#111' },
  profileMeta: { color: MUTED, fontSize: 14, fontWeight: '600', marginTop: 4 },
  smallBlueButton: { marginTop: 10, backgroundColor: BLUE, borderRadius: 15, paddingHorizontal: 20, paddingVertical: 8 },
  smallBlueButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  statsRow: { flexDirection: 'row', width: '100%', marginTop: 25, backgroundColor: '#F0F4FF', borderRadius: 20, padding: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: BLUE },
  statLabel: { fontSize: 11, color: '#777', marginTop: 2 },
  infoList: { width: '100%', marginTop: 30, gap: 20 },
  infoItem: { flexDirection: 'row', gap: 15, alignItems: 'flex-start' },
  infoLabel: { fontSize: 12, fontWeight: '800', color: '#111' },
  infoValue: { fontSize: 13, color: '#444', marginTop: 2 },
  actionStack: { width: '100%', marginTop: 40, gap: 15 },
  primaryButton: { height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontSize: 16, fontWeight: '900' },
  formContent: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 120 },
  editAvatarWrap: { alignSelf: 'center', marginBottom: 20 },
  cameraBadge: { position: 'absolute', right: 0, bottom: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: '#111', borderWidth: 2, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  inputGroup: { marginBottom: 15 },
  inputLabel: { marginBottom: 8, color: '#111', fontSize: 14, fontWeight: '700' },
  inputShell: { minHeight: 52, borderRadius: 15, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF' },
  input: { flex: 1, color: '#111', fontSize: 15 },
  splitRow: { flexDirection: 'row', gap: 12 },
  splitCell: { flex: 1 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderPill: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  genderPillActive: { backgroundColor: BLUE, borderColor: BLUE },
  genderText: { color: '#777', fontWeight: '600' },
  genderTextActive: { color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  cityBox: { backgroundColor: '#FFF', width: '100%', height: '70%', borderRadius: 25, padding: 25, position: 'absolute', bottom: 0 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#111', marginBottom: 10 },
  cityItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cityText: { fontSize: 16, color: '#111', fontWeight: '600' },
  provinceText: { fontSize: 12, color: '#999', marginTop: 2 },
  cardsContent: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 100 },
  cardItem: { marginBottom: 20 },
  blackCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, height: 160, justifyContent: 'space-between' },
  blackText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  cardNumber: { color: '#FFF', fontSize: 20, letterSpacing: 2, marginTop: 20 },
  addCardButton: { marginTop: 10, height: 100, borderStyle: 'dashed', borderWidth: 2, borderColor: BLUE, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 5 },
  deleteBox: { backgroundColor: '#FFF', width: '80%', padding: 25, borderRadius: 20, alignItems: 'center' },
  deleteActions: { flexDirection: 'row', gap: 15, width: '100%' },
  cancelDelete: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#EEE', alignItems: 'center', justifyContent: 'center' },
  continueDelete: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  deleteActionText: { fontWeight: '700', color: '#111' },
  successBox: { backgroundColor: '#FFF', width: '85%', padding: 30, borderRadius: 30, alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#111', marginBottom: 10 },
  successMessage: { fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 25, lineHeight: 20 },
});
