import { View, StyleSheet, ViewStyle } from 'react-native';

import { borderRadius, colors, shadows, spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'flat';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, variant === 'flat' ? styles.flat : styles.elevated, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  elevated: {
    ...shadows.md,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
