import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: colors.border,
  },
  primary: {
    backgroundColor: colors.primaryLight,
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  error: {
    backgroundColor: '#FEE2E2',
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
  defaultLabel: {
    color: colors.textSecondary,
  },
  primaryLabel: {
    color: colors.primary,
  },
  successLabel: {
    color: '#065F46',
  },
  warningLabel: {
    color: '#92400E',
  },
  errorLabel: {
    color: '#991B1B',
  },
});
