import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { ApiError } from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Harap isi email dan password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('Gagal masuk. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: Spacing.xxl,
          paddingTop: insets.top + Spacing.section,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Brand Header ────────────────────────── */}
        <View style={{ marginBottom: Spacing.section }}>
          <Text
            style={{
              fontSize: FontSize.hero,
              fontWeight: FontWeight.bold,
              color: Colors.navy,
              letterSpacing: -1,
            }}
          >
            GaweIn
          </Text>
          <Text
            style={{
              fontSize: FontSize.lg,
              color: Colors.textSecondary,
              marginTop: Spacing.xs,
              letterSpacing: -0.3,
            }}
          >
            Temukan jasa terbaik di sekitarmu
          </Text>
        </View>

        {/* ── Form ────────────────────────────────── */}
        <View style={{ gap: Spacing.lg }}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="nama@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Masukkan password"
            secureTextEntry
            autoComplete="password"
          />

          {error ? (
            <Text
              style={{ fontSize: FontSize.sm, color: Colors.error }}
              selectable
            >
              {error}
            </Text>
          ) : null}

          <Button
            title="Masuk"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        {/* ── Register Link ───────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: Spacing.xxl,
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
                Daftar
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
