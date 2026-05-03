import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Select({ label, value, options, onSelect, placeholder = 'Pilih...', disabled = false }: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={{ gap: Spacing.xs }}>
      {label ? (
        <Text
          style={{
            fontSize: FontSize.sm,
            fontWeight: FontWeight.medium,
            color: Colors.textSecondary,
          }}
        >
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => !disabled && setModalVisible(true)}
        style={[
          styles.container,
          disabled && styles.disabled,
        ]}
      >
        <Text style={{ 
          fontSize: FontSize.md, 
          color: selectedOption ? Colors.textPrimary : Colors.textMuted 
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || placeholder}</Text>
              <Pressable onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}>
              {options.length === 0 ? (
                <Text style={{ textAlign: 'center', color: Colors.textMuted, padding: Spacing.xl }}>
                  Tidak ada data tersedia
                </Text>
              ) : (
                options.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.optionItem,
                      opt.value === value && styles.optionSelected
                    ]}
                    onPress={() => {
                      onSelect(opt.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      opt.value === value && styles.optionTextSelected
                    ]}>
                      {opt.label}
                    </Text>
                    {opt.value === value && (
                      <Ionicons name="checkmark" size={20} color={Colors.navy} />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: Radius.md,
    height: 48,
    paddingHorizontal: Spacing.md,
  },
  disabled: {
    backgroundColor: Colors.cream,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '80%',
    minHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  optionSelected: {
    backgroundColor: Colors.navy + '10',
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
  },
});
