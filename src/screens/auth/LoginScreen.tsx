import { useRef } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, LoginFormData } from '@/utils/validation';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

export function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      enableOnAndroid
      extraScrollHeight={Platform.OS === 'android' ? 100 : 20}
      enableAutomaticScroll
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="people" size={40} color={colors.surface} />
        </View>
        <Text style={styles.appName}>Communify</Text>
        <Text style={styles.tagline}>Discover communities, share ideas</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardSubtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  leftIcon="mail-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              )}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  ref={passwordRef}
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="done"
                  leftIcon="lock-closed-outline"
                  isPassword
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            label="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Demo credentials</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.demoHint}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={styles.demoText}>Use any email and password (min 6 chars)</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.footerLinkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.footerDot}>·</Text>
        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.footerLinkText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.sm,
  },
  fieldWrapper: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body2,
    color: colors.error,
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  demoText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerLink: {
    padding: spacing.xs,
  },
  footerLinkText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  footerDot: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
});
