import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOfflineStore } from '@/store/offlineStore';
import { colors, spacing, typography } from '@/theme';

export function OfflineBanner() {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const insets = useSafeAreaInsets();
  const insetsRef = useRef(insets.top);
  const translateY = useRef(new Animated.Value(-100)).current;
  const wasOffline = useRef(false);

  useEffect(() => {
    insetsRef.current = insets.top;
  }, [insets.top]);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else if (wasOffline.current) {
      wasOffline.current = false;
      Animated.timing(translateY, {
        toValue: -(100 + insetsRef.current),
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline, translateY]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          top: insets.top,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={16} color={colors.surface} />
      <Text style={styles.text}>You're offline</Text>
      <Text style={styles.subtext}>Showing cached content</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 999,
    elevation: 999,
    gap: spacing.sm,
  },
  text: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.surface,
  },
  subtext: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.9,
  },
});
