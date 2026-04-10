import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '@/constants/theme';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  totalReviews?: number;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  showValue = true,
  totalReviews,
}: RatingStarsProps) {
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(numericRating);
        const halfFilled = !filled && i < Math.ceil(numericRating) && numericRating % 1 >= 0.25;
        return (
          <Ionicons
            key={i}
            name={filled ? 'star' : halfFilled ? 'star-half' : 'star-outline'}
            size={size}
            color={Colors.gold}
          />
        );
      })}
      {showValue && (
        <Text
          style={{
            fontSize: FontSize.sm,
            color: Colors.textSecondary,
            marginLeft: Spacing.xs,
            fontVariant: ['tabular-nums'],
          }}
          selectable
        >
          {numericRating.toFixed(1)}
          {totalReviews !== undefined && ` (${totalReviews})`}
        </Text>
      )}
    </View>
  );
}
