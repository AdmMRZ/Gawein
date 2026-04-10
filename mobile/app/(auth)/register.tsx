import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { ApiError } from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SelectedRole = 'client' | 'provider';

export default function RegisterScreen() {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<SelectedRole>('client');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || !password || !passwordConfirm) {
      setError('Harap isi semua field yang wajib');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Password tidak cocok');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
        password_confirm: passwordConfirm,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role,
        phone: phone.trim(),
        location: location.trim(),
        ...(role === 'provider' ? { bio: bio.trim() } : {}),
      });
    } catch (e) {
      if (e instanceof ApiError) {
        const msgs = Object.values(e.data).flat();
        setError(Array.isArray(msgs) ? msgs.join('. ') : e.message);
      } else {
        setError('Gagal mendaftar. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.xxl,
          paddingTop: insets.top + Spacing.xxl,
          paddingBottom: insets.bottom + Spacing.section,
          gap: Spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ──────────────────────────────── */}
        <View style={{ marginBottom: Spacing.lg }}>
          <Text
            style={{
              fontSize: FontSize.xxl,
              fontWeight: FontWeight.bold,
              color: Colors.navy,
              letterSpacing: -0.5,
            }}
          >
            Buat Akun
          </Text>
          <Text
            style={{
              fontSize: FontSize.md,
              color: Colors.textSecondary,
              marginTop: Spacing.xs,
            }}
          >
            Bergabung dengan GaweIn
          </Text>
        </View>

        {/* ── Role Picker ─────────────────────────── */}
        <View style={{ gap: Spacing.sm }}>
          <Text
            style={{
              fontSize: FontSize.sm,
              fontWeight: FontWeight.medium,
              color: Colors.textSecondary,
            }}
          >
            Daftar sebagai
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {(['client', 'provider'] as SelectedRole[]).map((r) => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: Radius.md,
                  borderCurve: 'continuous' as const,
                  borderWidth: 1.5,
                  borderColor: role === r ? Colors.navy : Colors.grayLight,
                  backgroundColor: role === r ? Colors.navy : Colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                } as any}
              >
                <Text
                  style={{
                    fontSize: FontSize.md,
                    fontWeight: FontWeight.semibold,
                    color: role === r ? Colors.textInverse : Colors.textSecondary,
                  }}
                >
                  {r === 'client' ? 'Pencari Jasa' : 'Penyedia Jasa'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Form Fields ─────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input label="Nama Depan" value={firstName} onChangeText={setFirstName} placeholder="Nama" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Nama Belakang" value={lastName} onChangeText={setLastName} placeholder="Belakang" />
          </View>
        </View>

        <Input
          label="Username *"
          value={username}
          onChangeText={setUsername}
          placeholder="username_anda"
          autoCapitalize="none"
        />
        <Input
          label="Email *"
          value={email}
          onChangeText={setEmail}
          placeholder="nama@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          label="No. Telepon"
          value={phone}
          onChangeText={setPhone}
          placeholder="08xxxxxxxxxx"
          keyboardType="phone-pad"
        />
        <Input
          label="Lokasi"
          value={location}
          onChangeText={setLocation}
          placeholder="Kota atau daerah"
        />

        {role === 'provider' && (
          <Input
            label="Bio / Deskripsi"
            value={bio}
            onChangeText={setBio}
            placeholder="Ceritakan keahlian Anda..."
            multiline
            style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }}
          />
        )}

        <Input
          label="Password *"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 8 karakter"
          secureTextEntry
        />
        <Input
          label="Konfirmasi Password *"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="Ulangi password"
          secureTextEntry
        />

        {error ? (
          <Text style={{ fontSize: FontSize.sm, color: Colors.error }} selectable>
            {error}
          </Text>
        ) : null}

        <Button
          title="Daftar"
          onPress={handleRegister}
          loading={loading}
          fullWidth
          size="lg"
          variant="secondary"
        />

        {/* ── Login Link ──────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: Spacing.xs,
            marginTop: Spacing.md,
          }}
        >
          <Text style={{ fontSize: FontSize.md, color: Colors.textMuted }}>
            Sudah punya akun?
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text
                style={{
                  fontSize: FontSize.md,
                  color: Colors.red,
                  fontWeight: FontWeight.semibold,
                }}
              >
                Masuk
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
