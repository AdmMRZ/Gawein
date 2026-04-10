import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services/user';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { ProfileResponse } from '@/types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userService.getProfile();
      setProfileData(res);
      setFirstName(res.user.first_name);
      setLastName(res.user.last_name);
      if (res.profile && 'phone' in res.profile) {
        setPhone((res.profile as any).phone || '');
        setLocation((res.profile as any).location || '');
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        location,
      });
      setEditing(false);
      loadProfile();
    } catch {
      Alert.alert('Gagal', 'Tidak bisa menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) return <LoadingScreen />;

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || '';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: Colors.cream }}
      contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.xxl, paddingBottom: Spacing.section }}
    >
      {/* ── Avatar + Name ─────────────────────────── */}
      <View style={{ alignItems: 'center', gap: Spacing.md }}>
        <Avatar name={fullName} size={80} backgroundColor={Colors.navy} />
        <Text
          style={{
            fontSize: FontSize.xl,
            fontWeight: FontWeight.bold,
            color: Colors.textPrimary,
            letterSpacing: -0.3,
          }}
        >
          {fullName}
        </Text>
        <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }} selectable>
          {user?.email}
        </Text>
        <Badge
          label={user?.role === 'client' ? 'Pencari Jasa' : user?.role === 'provider' ? 'Penyedia Jasa' : 'Admin'}
          variant="info"
        />
      </View>

      {/* ── Profile Details ───────────────────────── */}
      <Card>
        {editing ? (
          <View style={{ gap: Spacing.md }}>
            <Input label="Nama Depan" value={firstName} onChangeText={setFirstName} />
            <Input label="Nama Belakang" value={lastName} onChangeText={setLastName} />
            <Input label="Telepon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Input label="Lokasi" value={location} onChangeText={setLocation} />
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <Button title="Batal" onPress={() => setEditing(false)} variant="outline" fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Simpan" onPress={handleSave} loading={saving} fullWidth />
              </View>
            </View>
          </View>
        ) : (
          <View style={{ gap: Spacing.lg }}>
            <ProfileRow label="Username" value={user?.username || '-'} />
            <ProfileRow label="Email" value={user?.email || '-'} />
            <ProfileRow label="Telepon" value={phone || '-'} />
            <ProfileRow label="Lokasi" value={location || '-'} />
            <Button title="Edit Profil" onPress={() => setEditing(true)} variant="outline" fullWidth />
          </View>
        )}
      </Card>

      {/* ── Logout ────────────────────────────────── */}
      <Button title="Keluar" onPress={handleLogout} variant="danger" fullWidth />
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ fontSize: FontSize.md, color: Colors.textPrimary }} selectable>
        {value}
      </Text>
    </View>
  );
}
