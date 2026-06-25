import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
}

const gradientColors = [
  ['#5B4EE8', '#8B7CF6'],
  ['#10B981', '#34D399'],
  ['#F59E0B', '#FCD34D'],
  ['#EF4444', '#F87171'],
  ['#3B82F6', '#60A5FA'],
  ['#8B5CF6', '#A78BFA'],
  ['#EC4899', '#F472B6'],
  ['#06B6D4', '#22D3EE'],
];

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % gradientColors.length;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

const fontSizeMap = {
  sm: 12,
  md: 16,
  lg: 22,
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const colorIndex = getColorIndex(name);
  const bgColor = gradientColors[colorIndex][0];
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: borderRadius.full,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.button,
    color: colors.surface,
    fontWeight: '700',
  },
});
