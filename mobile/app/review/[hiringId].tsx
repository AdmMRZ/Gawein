import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reviewService } from '@/services/review';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { ApiError } from '@/services/api';

export default function ReviewScreen() {
  const { hiringId } = useLocalSearchParams<{ hiringId: string }>();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Pilih rating terlebih dahulu');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await reviewService.create({
        hiring_id: Number(hiringId),
        rating,
        comment: comment.trim(),
      });
      Alert.alert('Terima kasih', 'Review kamu telah dikirim.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal mengirim review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tulis Review' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={{ padding: Spacing.xxl, gap: Spacing.xxl, paddingBottom: Spacing.section }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Star Picker ─────────────────────────── */}
        <Card>
          <View style={{ alignItems: 'center', gap: Spacing.lg }}>
            <Text
              style={{
                fontSize: FontSize.lg,
                fontWeight: FontWeight.semibold,
                color: Colors.textPrimary,
              }}
            >
              Beri Rating
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={Colors.gold}
                  />
                </Pressable>
              ))}
            </View>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted }}>
              {rating === 0 ? 'Ketuk bintang untuk memberi rating' :
                rating <= 2 ? 'Kurang memuaskan' :
                rating <= 3 ? 'Cukup baik' :
                rating <= 4 ? 'Bagus' : 'Sangat memuaskan'}
            </Text>
          </View>
        </Card>

        {/* ── Comment ─────────────────────────────── */}
        <Input
          label="Komentar (opsional)"
          value={comment}
          onChangeText={setComment}
          placeholder="Ceritakan pengalamanmu..."
          multiline
          style={{ height: 120, textAlignVertical: 'top', paddingTop: 12 }}
        />

        {error ? (
          <Text style={{ fontSize: FontSize.sm, color: Colors.error }} selectable>{error}</Text>
        ) : null}

        <Button
          title="Kirim Review"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
          variant="secondary"
        />
      </ScrollView>
    </>
  );
}
