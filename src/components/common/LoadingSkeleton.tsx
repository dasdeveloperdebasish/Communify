import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

import { borderRadius, colors, spacing } from '@/theme';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

function SkeletonBox({ width = '100%', height = 16, style }: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeleton, { width: width as number, height, opacity }, style]} />
  );
}

export function CommunityCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonBox width={48} height={48} style={styles.avatarSkeleton} />
        <View style={styles.cardHeaderText}>
          <SkeletonBox width={160} height={16} />
          <SkeletonBox width={100} height={12} style={styles.mt8} />
        </View>
      </View>
      <SkeletonBox height={12} style={styles.mt12} />
      <SkeletonBox width={'70%' as unknown as number} height={12} style={styles.mt8} />
      <View style={styles.cardFooter}>
        <SkeletonBox width={80} height={12} />
        <SkeletonBox width={80} height={12} />
      </View>
    </View>
  );
}

export function PostCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width={120} height={12} />
      <SkeletonBox height={18} style={styles.mt8} />
      <SkeletonBox width={'80%' as unknown as number} height={18} style={styles.mt4} />
      <SkeletonBox height={12} style={styles.mt12} />
      <SkeletonBox width={'60%' as unknown as number} height={12} style={styles.mt8} />
      <View style={styles.cardFooter}>
        <SkeletonBox width={60} height={12} />
        <SkeletonBox width={60} height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarSkeleton: {
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  mt4: {
    marginTop: 4,
  },
  mt8: {
    marginTop: spacing.sm,
  },
  mt12: {
    marginTop: 12,
  },
});
