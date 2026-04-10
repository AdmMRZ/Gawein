import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services/user';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/ui/rating-stars';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { ProfileResponse, ProviderProfileData } from '@/types';

export default function ProviderProfileScreen() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await userService.getProfile();
      setProfileData(res);
      setFirstName(res.user.first_name);
      setLastName(res.user.last_name);
      const p = res.profile as ProviderProfileData | null;
      setBio(p?.bio || '');
      setLocation(p?.location || '');
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
        bio,
        location,
      });
      setEditing(false);
      loadProfile();
    } catch {
      Alert.alert('Gagal', 'Tidak bisa menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || '';
  const providerProfile = profileData?.profile as ProviderProfileData | null;

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
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <Badge label="Penyedia Jasa" variant="info" />
          {providerProfile?.is_verified && <Badge label="Terverifikasi" variant="success" />}
          {providerProfile?.verification_status === 'pending' && <Badge label="Menunggu Verifikasi" variant="warning" />}
        </View>
        {providerProfile && (
          <RatingStars
            rating={parseFloat(providerProfile.rating_average || '0')}
            size={18}
            totalReviews={providerProfile.total_reviews}
          />
        )}
      </View>

      {/* ── Profile Details ───────────────────────── */}
      <Card>
        {editing ? (
          <View style={{ gap: Spacing.md }}>
            <Input label="Nama Depan" value={firstName} onChangeText={setFirstName} />
            <Input label="Nama Belakang" value={lastName} onChangeText={setLastName} />
            <Input label="Lokasi" value={location} onChangeText={setLocation} />
            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }}
            />
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
            <Row label="Username" value={user?.username || '-'} />
            <Row label="Lokasi" value={providerProfile?.location || '-'} />
            <Row label="Bio" value={providerProfile?.bio || '-'} />
            <Row label="Pengalaman" value={`${providerProfile?.years_of_experience || 0} tahun`} />
            <Button title="Edit Profil" onPress={() => setEditing(true)} variant="outline" fullWidth />
          </View>
        )}
      </Card>

      <Button title="Keluar" onPress={() => {
        Alert.alert('Keluar', 'Yakin ingin keluar?', [
          { text: 'Batal', style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: logout },
        ]);
      }} variant="danger" fullWidth />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ fontSize: FontSize.md, color: Colors.textPrimary }} selectable>{value}</Text>
    </View>
  );
}
