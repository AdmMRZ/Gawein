import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/button';

interface ConfirmPopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmPopup({ visible, onClose, onConfirm, loading }: ConfirmPopupProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: Radius.xl,
            padding: Spacing.xxl,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
            gap: Spacing.xl,
          }}
        >
          <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: FontSize.lg,
                fontWeight: FontWeight.bold,
                color: Colors.navy,
                textAlign: 'center',
              }}
            >
              Apakah anda yakin?
            </Text>
            <Text
              style={{
                fontSize: FontSize.md,
                color: Colors.textSecondary,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              pastikan semua jawaban anda telah di isi dengan benar.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.md, width: '100%' }}>
            <View style={{ flex: 1 }}>
              <Button
                title="Kembali"
                variant="outline"
                onPress={onClose}
                disabled={loading}
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Lanjutkan"
                onPress={onConfirm}
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface SuccessPopupProps {
  visible: boolean;
  onClose: () => void;
}

export function SuccessPopup({ visible, onClose }: SuccessPopupProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: Radius.xl,
            padding: Spacing.xxl,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
            gap: Spacing.xl,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.success + '15',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
          </View>

          <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: FontSize.lg,
                fontWeight: FontWeight.bold,
                color: Colors.navy,
                textAlign: 'center',
              }}
            >
              Berhasil!
            </Text>
            <Text
              style={{
                fontSize: FontSize.md,
                color: Colors.textSecondary,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              Formulir ini telah di simpan pada history anda
            </Text>
          </View>

          <Button
            title="Lanjutkan"
            onPress={onClose}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}
