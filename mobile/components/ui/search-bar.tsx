import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, Spacing } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Cari jasa...',
  onSubmit,
  onClear,
}: SearchBarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: Radius.md,
        borderCurve: 'continuous' as const,
        borderWidth: 1,
        borderColor: Colors.grayLight,
        paddingHorizontal: Spacing.md,
        height: 44,
        gap: Spacing.sm,
      } as any}
    >
      <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={{
          flex: 1,
          fontSize: FontSize.md,
          color: Colors.textPrimary,
          paddingVertical: 0,
        }}
      />
      {value.length > 0 && (
        <Pressable onPress={() => { onChangeText(''); onClear?.(); }}>
          <Ionicons name="close-circle" size={18} color={Colors.grayMed} />
        </Pressable>
      )}
    </View>
  );
}
