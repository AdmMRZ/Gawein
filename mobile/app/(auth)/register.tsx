import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { ApiError, API_BASE_URL, NetworkError } from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  buildRegisterPayload,
  extractApiErrorMessage,
  getTouchedFieldErrors,
  hasErrors,
  mapRegisterApiErrors,
  type RegisterFieldName,
  type RegisterFormValues,
  validateRegisterForm,
} from '@/utils/auth-validation';

type SelectedRole = 'client' | 'provider';

const initialFormValues: RegisterFormValues = {
  role: 'client',
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  location: '',
  bio: '',
};

const registerFields: RegisterFieldName[] = [
  'role',
  'email',
  'username',
  'firstName',
  'lastName',
  'password',
  'passwordConfirm',
  'phone',
  'location',
  'bio',
];

const allRegisterTouched = registerFields.reduce((acc, key) => ({
  ...acc,
  [key]: true,
}), {} as Partial<Record<RegisterFieldName, boolean>>);

export default function RegisterScreen() {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<RegisterFormValues>(initialFormValues);
  const [touched, setTouched] = useState<Partial<Record<RegisterFieldName, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterFieldName, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: RegisterFieldName, value: string | SelectedRole) => {
    const nextForm = {
      ...form,
      [field]: value,
    } as RegisterFormValues;

    setForm(nextForm);
    if (submitError) setSubmitError('');

    if (touched[field]) {
      const validationErrors = validateRegisterForm(nextForm);
      setFieldErrors(getTouchedFieldErrors(validationErrors, touched));
    }
  };

  const handleBlurField = (field: RegisterFieldName) => {
    const nextTouched = {
      ...touched,
      [field]: true,
    };

    setTouched(nextTouched);
    const validationErrors = validateRegisterForm(form);
    setFieldErrors(getTouchedFieldErrors(validationErrors, nextTouched));
  };

  const handleRegister = async () => {
    const validationErrors = validateRegisterForm(form);
    setTouched(allRegisterTouched);

    if (hasErrors(validationErrors)) {
      setFieldErrors(getTouchedFieldErrors(validationErrors, allRegisterTouched));
      return;
    }

    setFieldErrors({});
    setSubmitError('');
    setLoading(true);

    try {
      await register(buildRegisterPayload(form));
    } catch (e) {
      if (e instanceof NetworkError) {
        setSubmitError(`${e.message} Endpoint saat ini: ${API_BASE_URL}/api`);
        return;
      }

      if (e instanceof ApiError) {
        const mappedErrors = mapRegisterApiErrors(e.data);
        if (hasErrors(mappedErrors)) {
          setFieldErrors((prev) => ({
            ...prev,
            ...mappedErrors,
          }));
        }
        setSubmitError(extractApiErrorMessage(e.data, e.message));
      } else {
        setSubmitError('Gagal mendaftar. Periksa koneksi lalu coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, backgroundColor: Colors.cream }}>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Spacing.xxl,
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: Math.max(insets.bottom + Spacing.xxl, Spacing.section),
            gap: Spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              width: '100%',
              maxWidth: 620,
              alignSelf: 'center',
              gap: Spacing.lg,
            }}
          >
            <View style={{ gap: Spacing.sm }}>
              <Text
                style={{
                  fontSize: FontSize.display,
                  color: Colors.navy,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.8,
                }}
              >
                Buat Akun GaweIn
              </Text>
              <Text
                style={{
                  fontSize: FontSize.md,
                  color: Colors.textSecondary,
                  lineHeight: 22,
                  maxWidth: 500,
                }}
              >
                Lengkapi data profil agar proses booking dan komunikasi berjalan lebih cepat.
              </Text>
            </View>

            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: Radius.xl,
                borderCurve: 'continuous' as const,
                borderWidth: 1,
                borderColor: Colors.grayLight,
                padding: Spacing.xxl,
                gap: Spacing.xl,
                shadowColor: Colors.navy,
                shadowOpacity: 0.05,
                shadowRadius: 40,
                shadowOffset: { width: 0, height: 20 },
                elevation: 4,
              }}
            >
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
                  {(['client', 'provider'] as SelectedRole[]).map((roleOption) => (
                    <Pressable
                      key={roleOption}
                      onPress={() => handleChange('role', roleOption)}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: Radius.md,
                        borderCurve: 'continuous' as const,
                        borderWidth: 1.5,
                        borderColor: form.role === roleOption ? Colors.navy : Colors.grayLight,
                        backgroundColor: form.role === roleOption ? Colors.navy : Colors.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                      } as any}
                    >
                      <Text
                        style={{
                          fontSize: FontSize.md,
                          fontWeight: FontWeight.semibold,
                          color:
                            form.role === roleOption
                              ? Colors.textInverse
                              : Colors.textSecondary,
                        }}
                      >
                        {roleOption === 'client' ? 'Pencari Jasa' : 'Penyedia Jasa'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Nama Depan"
                    value={form.firstName}
                    onChangeText={(value) => handleChange('firstName', value)}
                    onBlur={() => handleBlurField('firstName')}
                    placeholder="Nama depan"
                    error={fieldErrors.firstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Nama Belakang"
                    value={form.lastName}
                    onChangeText={(value) => handleChange('lastName', value)}
                    onBlur={() => handleBlurField('lastName')}
                    placeholder="Nama belakang"
                    error={fieldErrors.lastName}
                  />
                </View>
              </View>

              <Input
                label="Username"
                value={form.username}
                onChangeText={(value) => handleChange('username', value)}
                onBlur={() => handleBlurField('username')}
                placeholder="username_anda"
                autoCapitalize="none"
                error={fieldErrors.username}
                helper={fieldErrors.username ? undefined : 'Gunakan 4-30 karakter.'}
              />

              <Input
                label="Email"
                value={form.email}
                onChangeText={(value) => handleChange('email', value)}
                onBlur={() => handleBlurField('email')}
                placeholder="nama@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={fieldErrors.email}
              />

              <Input
                label="No. Telepon"
                value={form.phone}
                onChangeText={(value) => handleChange('phone', value)}
                onBlur={() => handleBlurField('phone')}
                placeholder="08xxxxxxxxxx"
                keyboardType="phone-pad"
                error={fieldErrors.phone}
                helper={fieldErrors.phone ? undefined : 'Opsional, 9-15 digit.'}
              />

              <Input
                label="Lokasi"
                value={form.location}
                onChangeText={(value) => handleChange('location', value)}
                onBlur={() => handleBlurField('location')}
                placeholder="Kota atau daerah"
                error={fieldErrors.location}
              />

              {form.role === 'provider' ? (
                <Input
                  label="Bio / Deskripsi"
                  value={form.bio}
                  onChangeText={(value) => handleChange('bio', value)}
                  onBlur={() => handleBlurField('bio')}
                  placeholder="Ceritakan keahlian dan pengalaman Anda"
                  multiline
                  numberOfLines={4}
                  error={fieldErrors.bio}
                  helper={fieldErrors.bio ? undefined : 'Minimal 20 karakter.'}
                  style={{
                    height: 112,
                    textAlignVertical: 'top',
                    paddingTop: 12,
                  }}
                />
              ) : null}

              <Input
                label="Password"
                value={form.password}
                onChangeText={(value) => handleChange('password', value)}
                onBlur={() => handleBlurField('password')}
                placeholder="Minimal 8 karakter"
                secureTextEntry
                autoComplete="password"
                error={fieldErrors.password}
                helper={fieldErrors.password ? undefined : 'Harus mengandung huruf dan angka.'}
              />

              <Input
                label="Konfirmasi Password"
                value={form.passwordConfirm}
                onChangeText={(value) => handleChange('passwordConfirm', value)}
                onBlur={() => handleBlurField('passwordConfirm')}
                placeholder="Ulangi password"
                secureTextEntry
                autoComplete="password"
                error={fieldErrors.passwordConfirm}
              />

              {submitError ? (
                <View
                  style={{
                    backgroundColor: Colors.errorSoft,
                    borderColor: Colors.redLight,
                    borderWidth: 1,
                    borderRadius: Radius.md,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: FontSize.sm,
                      color: Colors.error,
                      lineHeight: 20,
                    }}
                    selectable
                  >
                    {submitError}
                  </Text>
                </View>
              ) : null}

              <Button
                title="Buat Akun"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                fullWidth
                size="lg"
                variant="secondary"
              />

              <Text
                style={{
                  fontSize: FontSize.sm,
                  color: Colors.textMuted,
                  lineHeight: 20,
                }}
              >
                Data profil bisa dilengkapi lagi setelah proses pendaftaran selesai.
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: Spacing.xs,
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

            {__DEV__ ? (
              <Text
                style={{
                  fontSize: FontSize.xs,
                  color: Colors.textMuted,
                  textAlign: 'center',
                }}
              >
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
