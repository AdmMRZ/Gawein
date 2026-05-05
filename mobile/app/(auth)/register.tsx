import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { ApiError, API_BASE_URL, NetworkError } from '@/services/api';
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

const BLUE = '#3F5FDF';
const BORDER = '#D8D8D8';

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

const allRegisterTouched: Partial<Record<RegisterFieldName, boolean>> = {
  role: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  password: true,
  passwordConfirm: true,
  phone: true,
  bio: true,
};

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterFormValues>(initialFormValues);
  const [touched, setTouched] = useState<Partial<Record<RegisterFieldName, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterFieldName, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateUsername = (firstName: string, lastName: string) => {
    const combined = `${firstName}_${lastName}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    return combined.slice(0, 24);
  };

  const handleNamePartChange = (field: 'firstName' | 'lastName', value: string) => {
    const nextFirstName = field === 'firstName' ? value : form.firstName;
    const nextLastName = field === 'lastName' ? value : form.lastName;
    const nextUsername = updateUsername(nextFirstName, nextLastName);
    
    const nextForm = { ...form, [field]: value, username: nextUsername };
    setForm(nextForm);
    
    if (submitError) setSubmitError('');
    if (touched[field]) setFieldErrors(getTouchedFieldErrors(validateRegisterForm(nextForm), touched));
  };

  const handleChange = (field: RegisterFieldName, value: string) => {
    const nextForm = { ...form, [field]: value } as RegisterFormValues;
    setForm(nextForm);
    if (submitError) setSubmitError('');
    if (touched[field]) setFieldErrors(getTouchedFieldErrors(validateRegisterForm(nextForm), touched));
  };

  const handleBlurField = (field: RegisterFieldName) => {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    setFieldErrors(getTouchedFieldErrors(validateRegisterForm(form), nextTouched));
  };

  const handleRegister = async () => {
    const validationErrors = validateRegisterForm(form);
    setTouched(allRegisterTouched);
    if (hasErrors(validationErrors)) {
      setFieldErrors(getTouchedFieldErrors(validationErrors, allRegisterTouched));
      return;
    }

    setSubmitError('');
    setLoading(true);
    try {
      await register(buildRegisterPayload(form));
    } catch (e) {
      if (e instanceof NetworkError) {
        setSubmitError(`${e.message} Endpoint saat ini: ${API_BASE_URL}/api`);
      } else if (e instanceof ApiError) {
        const mappedErrors = mapRegisterApiErrors(e.data);
        if (hasErrors(mappedErrors)) setFieldErrors((prev) => ({ ...prev, ...mappedErrors }));
        setSubmitError(extractApiErrorMessage(e.data, e.message));
      } else {
        setSubmitError('Gagal mendaftar. Periksa koneksi lalu coba lagi.');
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
        contentContainerStyle={{ alignItems: 'center', minHeight: 860, paddingBottom: 18 }}
      >
        <View style={{ width: '100%', maxWidth: 430, minHeight: 860, backgroundColor: '#FFFFFF' }}>
          <View style={{ height: 292, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20 }}>
            <Image source={require('../../assets/images/Gambar_Pekerja.png')} style={{ width: '100%', height: 230, resizeMode: 'contain' }} />
          </View>

          <View
            style={{
              minHeight: 610,
              marginTop: -45,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 46,
              borderTopRightRadius: 46,
              paddingHorizontal: 31,
              paddingTop: 39,
            }}
          >
            <Text style={{ color: '#050505', fontSize: 40, lineHeight: 48, fontWeight: '900', textAlign: 'center', marginBottom: 28 }}>
              Sign Up
            </Text>

            <View style={{ flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 4, marginBottom: 20 }}>
              <Pressable
                onPress={() => handleChange('role', 'client')}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: form.role === 'client' ? BLUE : 'transparent', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: form.role === 'client' ? '#FFFFFF' : '#888888' }}>Pencari Jasa</Text>
              </Pressable>
              <Pressable
                onPress={() => handleChange('role', 'provider')}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: form.role === 'provider' ? BLUE : 'transparent', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: form.role === 'provider' ? '#FFFFFF' : '#888888' }}>Penyedia Jasa</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <AuthField
                  label="Nama Depan"
                  placeholder="Nama depan"
                  value={form.firstName}
                  error={fieldErrors.firstName}
                  onChangeText={(v) => handleNamePartChange('firstName', v)}
                  onBlur={() => handleBlurField('firstName')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AuthField
                  label="Nama Belakang"
                  placeholder="Nama belakang"
                  value={form.lastName}
                  error={fieldErrors.lastName}
                  onChangeText={(v) => handleNamePartChange('lastName', v)}
                  onBlur={() => handleBlurField('lastName')}
                />
              </View>
            </View>

            <AuthField
              label="Username"
              placeholder="username_anda"
              value={form.username}
              error={fieldErrors.username}
              autoCapitalize="none"
              onChangeText={(v) => handleChange('username', v)}
              onBlur={() => handleBlurField('username')}
            />

            <AuthField
              label="Nomor HP"
              placeholder="0812xxxx"
              value={form.phone}
              error={fieldErrors.phone}
              keyboardType="phone-pad"
              onChangeText={(v) => handleChange('phone', v)}
              onBlur={() => handleBlurField('phone')}
            />

            {form.role === 'provider' && (
              <AuthField
                label="Bio"
                placeholder="Ceritakan pengalaman dan keahlian Anda (min. 20 karakter)"
                value={form.bio}
                error={fieldErrors.bio}
                multiline
                numberOfLines={3}
                style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }}
                onChangeText={(v) => handleChange('bio', v)}
                onBlur={() => handleBlurField('bio')}
              />
            )}
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
            <AuthField
              label="Confirm Password"
              placeholder="Masukkan Password"
              value={form.passwordConfirm}
              error={fieldErrors.passwordConfirm}
              secureTextEntry
              onChangeText={(value) => handleChange('passwordConfirm', value)}
              onBlur={() => handleBlurField('passwordConfirm')}
            />

            {submitError ? <Text style={{ color: '#D62828', fontSize: 12, marginBottom: 10 }}>{submitError}</Text> : null}

            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => ({
                height: 64,
                borderRadius: 16,
                backgroundColor: BLUE,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 14,
                opacity: pressed || loading ? 0.75 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>{loading ? 'Memproses...' : 'Sign Up'}</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 31 }}>
              <Text style={{ color: '#222222', fontSize: 16 }}>Sudah memiliki akun?</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={{ color: BLUE, fontSize: 16, fontWeight: '900' }}>Log in</Text>
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
    <View style={{ marginBottom: 17 }}>
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
