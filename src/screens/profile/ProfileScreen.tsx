import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common/Avatar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useOfflineStore } from '@/store/offlineStore';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isOnline, queue } = useOfflineStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileCard}>
        <Avatar name={user.username} size="lg" />
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
          <View
            style={[styles.statusDot, isOnline ? styles.statusDotOnline : styles.statusDotOffline]}
          />
          <Text
            style={[
              styles.statusText,
              isOnline ? styles.statusTextOnline : styles.statusTextOffline,
            ]}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {queue.length > 0 && (
        <View style={styles.queueCard}>
          <Ionicons name="time-outline" size={18} color={colors.warning} />
          <View style={styles.queueInfo}>
            <Text style={styles.queueTitle}>Pending Actions</Text>
            <Text style={styles.queueSubtitle}>
              {queue.length} action{queue.length > 1 ? 's' : ''} will sync when you're back online
            </Text>
          </View>
        </View>
      )}

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color={colors.textMuted} />
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user.username}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setShowLogoutModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Communify v1.0.0</Text>

      <ConfirmModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        confirmVariant="danger"
        icon="log-out-outline"
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  username: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textTransform: 'capitalize',
  },
  email: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  statusOnline: {
    backgroundColor: '#D1FAE5',
  },
  statusOffline: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotOnline: {
    backgroundColor: colors.success,
  },
  statusDotOffline: {
    backgroundColor: colors.warning,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  statusTextOnline: {
    color: '#065F46',
  },
  statusTextOffline: {
    color: '#92400E',
  },
  queueCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  queueInfo: {
    flex: 1,
  },
  queueTitle: {
    ...typography.body2,
    fontWeight: '600',
    color: '#92400E',
  },
  queueSubtitle: {
    ...typography.caption,
    color: '#B45309',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
