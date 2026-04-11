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
  extractApiErrorMessage,
  getTouchedFieldErrors,
  hasErrors,
  mapLoginApiErrors,
  type LoginFieldName,
  type LoginFormValues,
  validateLoginForm,
} from '@/utils/auth-validation';

const initialFormValues: LoginFormValues = {
  email: '',
  password: '',
};

const allLoginTouched: Partial<Record<LoginFieldName, boolean>> = {
  email: true,
  password: true,
};

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<LoginFormValues>(initialFormValues);
  const [touched, setTouched] = useState<Partial<Record<LoginFieldName, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LoginFieldName, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: LoginFieldName, value: string) => {
    const nextForm = {
      ...form,
      [field]: value,
    };

    setForm(nextForm);
    if (submitError) setSubmitError('');

    if (touched[field]) {
      const validationErrors = validateLoginForm(nextForm);
      setFieldErrors(getTouchedFieldErrors(validationErrors, touched));
    }
  };

  const handleBlurField = (field: LoginFieldName) => {
    const nextTouched = {
      ...touched,
      [field]: true,
    };

    setTouched(nextTouched);
    const validationErrors = validateLoginForm(form);
    setFieldErrors(getTouchedFieldErrors(validationErrors, nextTouched));
  };

  const handleLogin = async () => {
    const validationErrors = validateLoginForm(form);
    setTouched(allLoginTouched);

    if (hasErrors(validationErrors)) {
      setFieldErrors(getTouchedFieldErrors(validationErrors, allLoginTouched));
      return;
    }

    setFieldErrors({});
    setSubmitError('');
    setLoading(true);

    try {
      await login(form.email.trim().toLowerCase(), form.password);
    } catch (e) {
      if (e instanceof NetworkError) {
        setSubmitError(`${e.message} Endpoint saat ini: ${API_BASE_URL}/api`);
        return;
      }

      if (e instanceof ApiError) {
        const mappedErrors = mapLoginApiErrors(e.data);
        if (hasErrors(mappedErrors)) {
          setFieldErrors(mappedErrors);
        }
        setSubmitError(extractApiErrorMessage(e.data, e.message));
      } else {
        setSubmitError('Gagal masuk. Periksa koneksi lalu coba lagi.');
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
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: Spacing.xxl,
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: Math.max(insets.bottom + Spacing.xxl, Spacing.section),
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              width: '100%',
              maxWidth: 560,
              alignSelf: 'center',
              gap: Spacing.xl,
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
                Masuk ke GaweIn
              </Text>
              <Text
                style={{
                  fontSize: FontSize.md,
                  color: Colors.textSecondary,
                  lineHeight: 22,
                  maxWidth: 420,
                }}
              >
                Cari, booking, dan pantau layanan profesional dalam satu aplikasi.
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
                helper={fieldErrors.email ? undefined : 'Gunakan email yang terdaftar.'}
              />

              <Input
                label="Password"
                value={form.password}
                onChangeText={(value) => handleChange('password', value)}
                onBlur={() => handleBlurField('password')}
                placeholder="Masukkan password"
                secureTextEntry
                autoComplete="password"
                error={fieldErrors.password}
                helper={fieldErrors.password ? undefined : 'Minimal 8 karakter.'}
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
                title="Masuk"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                fullWidth
                size="lg"
              />

              <Text
                style={{
                  fontSize: FontSize.sm,
                  color: Colors.textMuted,
                  lineHeight: 20,
                }}
              >
                Pastikan backend Django aktif sebelum login.
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
                Belum punya akun?
              </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text
                    style={{
                      fontSize: FontSize.md,
                      color: Colors.red,
                      fontWeight: FontWeight.semibold,
                    }}
                  >
                    Daftar sekarang
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
