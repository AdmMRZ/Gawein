import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { ApiError, API_BASE_URL, NetworkError } from '@/services/api';
import {
  extractApiErrorMessage,
  getTouchedFieldErrors,
  hasErrors,
  mapLoginApiErrors,
  type LoginFieldName,
  type LoginFormValues,
  validateLoginForm,
} from '@/utils/auth-validation';

const BLUE = '#3F5FDF';
const BORDER = '#D8D8D8';

const initialFormValues: LoginFormValues = { email: '', password: '' };
const allLoginTouched: Partial<Record<LoginFieldName, boolean>> = { email: true, password: true };

export default function LoginScreen() {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormValues>(initialFormValues);
  const [touched, setTouched] = useState<Partial<Record<LoginFieldName, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LoginFieldName, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: LoginFieldName, value: string) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    if (submitError) setSubmitError('');
    if (touched[field]) setFieldErrors(getTouchedFieldErrors(validateLoginForm(nextForm), touched));
  };

  const handleBlurField = (field: LoginFieldName) => {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    setFieldErrors(getTouchedFieldErrors(validateLoginForm(form), nextTouched));
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
      } else if (e instanceof ApiError) {
        const mappedErrors = mapLoginApiErrors(e.data);
        if (hasErrors(mappedErrors)) setFieldErrors(mappedErrors);
        setSubmitError(extractApiErrorMessage(e.data, e.message));
      } else {
        setSubmitError('Gagal masuk. Periksa koneksi lalu coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ alignItems: 'center', minHeight: 820, paddingBottom: 18 }}
      >
        <View style={{ width: '100%', maxWidth: 430, minHeight: 820, backgroundColor: '#FFFFFF' }}>
          <View style={{ height: 322, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20 }}>
            <Image source={require('../../assets/images/Gambar_Pekerja.png')} style={{ width: '100%', height: 260, resizeMode: 'contain' }} />
          </View>

          <View
            style={{
              minHeight: 498,
              marginTop: -45,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 46,
              borderTopRightRadius: 46,
              paddingHorizontal: 31,
              paddingTop: 50,
            }}
          >
            <Text style={{ color: '#050505', fontSize: 40, lineHeight: 48, fontWeight: '900', textAlign: 'center', marginBottom: 50 }}>
              Login
            </Text>

            <AuthField
              label="Email"
              placeholder="Masukkan Email"
              value={form.email}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(value) => handleChange('email', value)}
              onBlur={() => handleBlurField('email')}
            />
            <AuthField
              label="Password"
              placeholder="Masukkan Password"
              value={form.password}
              error={fieldErrors.password}
              secureTextEntry
              onChangeText={(value) => handleChange('password', value)}
              onBlur={() => handleBlurField('password')}
            />

            {submitError ? <Text style={{ color: '#D62828', fontSize: 12, marginBottom: 10 }}>{submitError}</Text> : null}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                height: 64,
                borderRadius: 16,
                backgroundColor: BLUE,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 16,
                opacity: pressed || loading ? 0.75 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>{loading ? 'Memproses...' : 'Login'}</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 42 }}>
              <Text style={{ color: '#222222', fontSize: 16 }}>Belum punya akun?</Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={{ color: BLUE, fontSize: 16, fontWeight: '900' }}>Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AuthField(props: React.ComponentProps<typeof TextInput> & { label: string; error?: string }) {
  const { label, error, style, ...inputProps } = props;
  return (
    <View style={{ marginBottom: 23 }}>
      <Text style={{ color: '#111111', fontSize: 15, fontWeight: '900', marginBottom: 9 }}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor="#BDBDBD"
        style={[
          {
            height: 54,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: error ? '#D62828' : BORDER,
            paddingHorizontal: 18,
            color: '#111111',
            fontSize: 16,
            backgroundColor: '#FFFFFF',
          },
          style,
        ]}
      />
      {error ? <Text style={{ color: '#D62828', fontSize: 11, marginTop: 5 }}>{error}</Text> : null}
    </View>
  );
}
