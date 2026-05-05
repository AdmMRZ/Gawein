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

type ScreenMode = 'profile' | 'edit' | 'cards' | 'add-card';
type GenderValue = 'Perempuan' | 'Laki-laki' | 'Lainnya';

const BLUE = '#315BE8';
const YELLOW = '#FFD75A';
const CARD_BG = '#FFF3C9';
const BORDER = '#D8D8D8';
const MUTED = '#9B9B9B';

const initialCardForm: PaymentCardInput = {
  card_number: '',
  expiry_date: '',
  cvv: '',
  cardholder_name: '',
  billing_address: '',
};

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuth();
  const [mode, setMode] = useState<ScreenMode>('profile');
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [visibleCards, setVisibleCards] = useState<Record<number, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<PaymentCard | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<GenderValue>('Perempuan');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cardForm, setCardForm] = useState<PaymentCardInput>(initialCardForm);

  const displayName = useMemo(() => {
    const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    return name || user?.username || 'Pengguna Gawein';
  }, [user]);

  useEffect(() => {
    setFullName(displayName);
  }, [displayName]);

  useEffect(() => {
    setGender(normalizeGender(user?.gender));
    setPhone(user?.phone || '');
  }, [user?.gender, user?.phone]);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const result = await userService.getPaymentCards();
      setCards(result);
      
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
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

    if (newPassword || confirmPassword || oldPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        Alert.alert('Password belum lengkap', 'Isi password lama, password baru, dan konfirmasi password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Password tidak sama', 'Konfirmasi password harus sama dengan password baru.');
        return;
      }
      if (newPassword.length < 8) {
        Alert.alert('Password terlalu pendek', 'Password baru minimal 8 karakter.');
        return;
      }
    }

    setSaving(true);
    try {
      const [firstName, ...lastNameParts] = trimmedName.split(/\s+/);
      await userService.updateProfile({
        first_name: firstName,
        last_name: lastNameParts.join(' '),
        gender,
        phone,
      });

      if (newPassword) {
        await userService.changePassword({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        });
      }

      await refreshProfile();
      setSuccessMessage('Selamat! Profil anda telah berhasil diubah');
      goProfile();
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Tidak bisa menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batalkan', style: 'cancel' },
      { text: 'Lanjutkan', style: 'destructive', onPress: logout },
    ]);
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
      setSuccessMessage('Selamat! Kartu anda telah berhasil ditambahkan');
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

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.root}>
      {mode === 'profile' && (
        <ProfileHome
          displayName={displayName}
          email={user?.email || '-'}
          gender={normalizeGender(user?.gender)}
          onCards={() => setMode('cards')}
          onEdit={() => setMode('edit')}
          onLogout={handleLogout}
        />
      )}
      {mode === 'edit' && (
        <EditProfile
          fullName={fullName}
          gender={gender}
          oldPassword={oldPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          saving={saving}
          onBack={goProfile}
          onName={setFullName}
          phone={phone}
          onPhone={setPhone}
          onGender={setGender}


          onOldPassword={setOldPassword}
          onNewPassword={setNewPassword}
          onConfirmPassword={setConfirmPassword}
          onSave={handleSaveProfile}
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

      <SuccessModal message={successMessage} onClose={() => setSuccessMessage('')} />
      <DeleteModal card={deleteTarget} onCancel={() => setDeleteTarget(null)} onContinue={confirmDeleteCard} />


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

function ProfileHome({
  displayName,
  email,
  gender,
  onCards,
  onEdit,
  onLogout,
}: {
  displayName: string;
  email: string;
  gender: GenderValue;
  onCards: () => void;
  onEdit: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <Header title="Profil" />
      <ScrollView contentContainerStyle={styles.profileContent}>
        <AvatarPhoto />
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileMeta}>{gender}</Text>
        <Pressable onPress={onCards} style={styles.smallBlueButton}>
          <Text style={styles.smallBlueButtonText}>Lihat Detail Kartu</Text>
        </Pressable>

        <View style={styles.infoList}>
          <Ionicons name="mail-outline" size={32} color={MUTED} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
        </View>

        <View style={styles.actionStack}>
          <PrimaryButton title="Edit Profil" color={YELLOW} textColor="#111111" onPress={onEdit} />
          <PrimaryButton title="Logout" color={BLUE} textColor="#FFFFFF" onPress={onLogout} />
        </View>
      </ScrollView>
    </>
  );
}

function EditProfile(props: {
  fullName: string;
  gender: GenderValue;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  saving: boolean;
  onBack: () => void;
  onName: (value: string) => void;
  phone: string;
  onPhone: (value: string) => void;
  onGender: (value: GenderValue) => void;


  onOldPassword: (value: string) => void;
  onNewPassword: (value: string) => void;
  onConfirmPassword: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <>
      <Header title="Edit Profil" onBack={props.onBack} />
      <ScrollView contentContainerStyle={styles.formContent}>
        <View style={styles.editAvatarWrap}>
          <AvatarPhoto size={96} />
          <View style={styles.cameraBadge}>
            <Ionicons name="camera-outline" size={15} color="#FFFFFF" />
          </View>
        </View>

        <FormInput label="Nama Lengkap" value={props.fullName} onChangeText={props.onName} icon="person-outline" />
        <FormInput label="Nomor HP" value={props.phone} onChangeText={props.onPhone} keyboardType="phone-pad" icon="call-outline" />
        <GenderPicker value={props.gender} onChange={props.onGender} />
        


        <FormInput label="Old Password" value={props.oldPassword} onChangeText={props.onOldPassword} secureTextEntry icon="lock-closed-outline" />
        <View style={styles.splitRow}>
          <View style={styles.splitCell}>
            <FormInput label="New Password" value={props.newPassword} onChangeText={props.onNewPassword} secureTextEntry icon="lock-closed-outline" compact />
          </View>
          <View style={styles.splitCell}>
            <FormInput label="Confirm" value={props.confirmPassword} onChangeText={props.onConfirmPassword} secureTextEntry icon="lock-closed-outline" compact />
          </View>
        </View>
        <PrimaryButton title={props.saving ? 'Menyimpan...' : 'Simpan Perubahan'} color={BLUE} textColor="#FFFFFF" onPress={props.onSave} />
      </ScrollView>
    </>
  );
}

function CardDetails({
  cards,
  visibleCards,
  onBack,
  onAdd,
  onToggle,
  onDelete,
}: {
  cards: PaymentCard[];
  visibleCards: Record<number, boolean>;
  onBack: () => void;
  onAdd: () => void;
  onToggle: (id: number) => void;
  onDelete: (card: PaymentCard) => void;
}) {
  return (
    <>
      <Header title="Detail Kartu" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.cardsContent}>
        {cards.map((card, index) => (
          <PaymentCardPanel
            key={card.id}
            card={card}
            title={index === 0 ? 'Kartu Utama' : `Kartu ${index + 1}`}
            visible={!!visibleCards[card.id]}
            onToggle={() => onToggle(card.id)}
            onDelete={() => onDelete(card)}
          />
        ))}
        {cards.length === 0 && (
          <Text style={styles.emptyText}>Belum ada kartu tersimpan.</Text>
        )}
        <Pressable onPress={onAdd} style={styles.addCardButton}>
          <Text style={styles.addCardPlus}>+</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

function AddCard({
  form,
  saving,
  onBack,
  onChange,
  onSubmit,
}: {
  form: PaymentCardInput;
  saving: boolean;
  onBack: () => void;
  onChange: (key: keyof PaymentCardInput, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <Header title="Tambah Kartu" onBack={onBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          style={styles.addScroll}
          contentContainerStyle={styles.addContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BlackCardArt />
          <FormInput
            label="Nomor Kartu"
            value={formatCardNumber(form.card_number)}
            onChangeText={(v) => onChange('card_number', v.replace(/\D/g, '').slice(0, 19))}
            keyboardType="number-pad"
          />
          <FormInput
            label="Masa berlaku"
            value={formatExpiryInput(form.expiry_date)}
            onChangeText={(v) => onChange('expiry_date', formatExpiryInput(v))}
            placeholder="MM/YYYY"
            keyboardType="number-pad"
          />
          <FormInput
            label="Kode CVV"
            value={form.cvv}
            onChangeText={(v) => onChange('cvv', v.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
          />
          <FormInput label="Nama di Kartu" value={form.cardholder_name} onChangeText={(v) => onChange('cardholder_name', v)} />
          <FormInput label="Alamat Penagihan" value={form.billing_address} onChangeText={(v) => onChange('billing_address', v)} icon="mail-outline" />
          <PrimaryButton title={saving ? 'Menambahkan...' : 'Tambah Kartu'} color={BLUE} textColor="#FFFFFF" onPress={onSubmit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function PaymentCardPanel({
  card,
  title,
  visible,
  onToggle,
  onDelete,
}: {
  card: PaymentCard;
  title: string;
  visible: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.cardPanel}>
      <Text style={styles.cardPanelTitle}>{title}</Text>
      <BlackCardArt />
      <LabelText label="Nomor Kartu" />
      <View style={styles.cardField}>
        <Text style={styles.cardFieldText}>{visible ? formatCardNumber(card.card_number) : maskCardNumber(card.card_number)}</Text>
        <Pressable onPress={onToggle}>
          <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={22} color={MUTED} />
        </Pressable>
      </View>
      <View style={styles.cardBottomRow}>
        <View style={styles.expiryField}>
          <LabelText label="Masa Berlaku" />
          <View style={styles.cardField}>
            <Text style={styles.cardFieldText}>{card.expiry_date}</Text>
          </View>
        </View>
        <View style={styles.cvvField}>
          <LabelText label="Kode CVV" />
          <View style={styles.cardField}>
            <Text style={styles.cardFieldText}>{visible ? card.cvv : '***'}</Text>
            <Pressable onPress={onToggle}>
              <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color={MUTED} />
            </Pressable>
          </View>
        </View>
        <Pressable onPress={onDelete} style={styles.trashButton}>
          <Ionicons name="trash" size={25} color="#111111" />
        </Pressable>
      </View>
    </View>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  icon,
  compact,
  ...rest
}: React.ComponentProps<typeof TextInput> & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputShell, compact && styles.compactInputShell]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#BDBDBD"
          style={styles.input}
          {...rest}
        />
        {icon && <Ionicons name={icon} size={22} color="#AFAFAF" />}
      </View>
    </View>
  );
}

function GenderPicker({
  value,
  onChange,
}: {
  value: GenderValue;
  onChange: (value: GenderValue) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Gender</Text>
      <View style={styles.genderRow}>
        {[
          ['Perempuan', 'Perempuan'],
          ['Laki-laki', 'Laki-laki'],
          ['Lainnya', 'Lainnya'],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => onChange(key as GenderValue)}
            style={[styles.genderPill, value === key && styles.genderPillActive]}
          >
            <Text style={[styles.genderText, value === key && styles.genderTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AvatarPhoto({ size = 112 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="person" size={size * 0.58} color="#FFFFFF" />
    </View>
  );
}

function BlackCardArt() {
  return (
    <View style={styles.blackCard}>
      <Text style={styles.blackText}>Black</Text>
      <View style={styles.chip} />
      <Text style={styles.unlimited}>UNLIMITED</Text>
      <Text style={styles.visa}>VISA</Text>
      <Text style={styles.privilege}>Infinite Privilege</Text>
    </View>
  );
}

function PrimaryButton({
  title,
  color,
  textColor,
  onPress,
}: {
  title: string;
  color: string;
  textColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.primaryButton, { backgroundColor: color }]}>
      <Text style={[styles.primaryButtonText, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

function SuccessModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <Modal visible={!!message} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.successBox}>
          <Text style={styles.modalTitle}>{message}</Text>
          <View style={styles.successIcon}>
            <Ionicons name="sparkles" size={48} color={BLUE} />
          </View>
          <PrimaryButton title="Selesai" color={YELLOW} textColor="#111111" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function DeleteModal({
  card,
  onCancel,
  onContinue,
}: {
  card: PaymentCard | null;
  onCancel: () => void;
  onContinue: () => void;
}) {
  return (
    <Modal visible={!!card} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.deleteBox}>
          <Text style={styles.modalTitle}>Apakah kamu yakin ingin menghapus kartu ini?</Text>
          <View style={styles.deleteActions}>
            <Pressable onPress={onCancel} style={styles.cancelDelete}>
              <Text style={styles.deleteActionText}>Batalkan</Text>
            </Pressable>
            <Pressable onPress={onContinue} style={styles.continueDelete}>
              <Text style={styles.deleteActionText}>Lanjutkan</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function LabelText({ label }: { label: string }) {
  return <Text style={styles.cardLabel}>{label}</Text>;
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

function maskCardNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  return `${digits.slice(0, 4)} **** **** ${digits.slice(-4)}`.trim();
}

function formatExpiryInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function normalizeCardForm(form: PaymentCardInput): PaymentCardInput {
  return {
    card_number: form.card_number.replace(/\D/g, ''),
    expiry_date: formatExpiryInput(form.expiry_date),
    cvv: form.cvv.replace(/\D/g, ''),
    cardholder_name: form.cardholder_name.trim(),
    billing_address: form.billing_address.trim(),
  };
}

function normalizeGender(value?: string): GenderValue {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'male' || normalized === 'laki-laki' || normalized === 'laki laki') return 'Laki-laki';
  if (normalized === 'other' || normalized === 'lainnya') return 'Lainnya';
  return 'Perempuan';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 146,
    backgroundColor: BLUE,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 28,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    bottom: 34,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  profileContent: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 36,
    paddingBottom: 130,
  },
  avatar: {
    backgroundColor: '#56B8F3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '900',
    color: '#151515',
  },
  profileMeta: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '600',
  },
  smallBlueButton: {
    marginTop: 8,
    backgroundColor: BLUE,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  smallBlueButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  infoList: {
    width: '100%',
    marginTop: 36,
    borderBottomWidth: 1,
    borderBottomColor: '#A7A7A7',
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#222222',
  },
  infoValue: {
    marginTop: 2,
    fontSize: 12,
    color: '#222222',
  },
  actionStack: {
    width: '100%',
    marginTop: 42,
    gap: 20,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '900',
  },
  formContent: {
    paddingHorizontal: 30,
    paddingTop: 24,
    paddingBottom: 120,
  },
  editAvatarWrap: {
    alignSelf: 'center',
    marginBottom: 18,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 13,
  },
  inputLabel: {
    marginBottom: 7,
    color: '#222222',
    fontSize: 14,
    fontWeight: '700',
  },
  inputShell: {
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  compactInputShell: {
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    color: '#222222',
    fontSize: 15,
    paddingVertical: 0,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 9,
  },
  splitCell: {
    flex: 1,
  },
  genderRow: {
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 5,
    flexDirection: 'row',
    gap: 5,
  },
  genderPill: {
    flex: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillActive: {
    backgroundColor: BLUE,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '800',
    color: MUTED,
  },
  genderTextActive: {
    color: '#FFFFFF',
  },
  cardsContent: {
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 42,
    gap: 18,
  },
  cardPanel: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
  },
  cardPanelTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
  },
  blackCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 288,
    aspectRatio: 1.62,
    borderRadius: 21,
    backgroundColor: '#050808',
    marginBottom: 12,
    padding: 18,
  },
  blackText: {
    position: 'absolute',
    top: 16,
    right: 18,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  chip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#D99B4D',
    marginTop: 48,
  },
  unlimited: {
    position: 'absolute',
    left: 22,
    bottom: 15,
    color: '#FFFFFF',
    fontSize: 10,
  },
  visa: {
    position: 'absolute',
    right: 18,
    bottom: 27,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  privilege: {
    position: 'absolute',
    right: 18,
    bottom: 12,
    color: '#DADADA',
    fontSize: 11,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 6,
  },
  cardField: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardFieldText: {
    color: '#222222',
    fontSize: 14,
    flexShrink: 1,
  },
  cardBottomRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    marginTop: 12,
  },
  expiryField: {
    flex: 1.12,
  },
  cvvField: {
    flex: 1,
  },
  trashButton: {
    width: 32,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardButton: {
    height: 70,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addCardPlus: {
    color: YELLOW,
    fontSize: 32,
    fontWeight: '900',
  },
  emptyText: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 15,
    marginVertical: 16,
  },
  addContent: {
    paddingHorizontal: 32,
    paddingTop: 22,
    paddingBottom: 180,
    flexGrow: 1,
  },
  addScroll: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  successBox: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    gap: 18,
  },
  deleteBox: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 14,
  },
  modalTitle: {
    color: '#111111',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
  },
  successIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },




  deleteActions: {
    flexDirection: 'row',
    gap: 9,
  },
  cancelDelete: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueDelete: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionText: {
    fontWeight: '900',
    color: '#111111',
  },
});
