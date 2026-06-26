import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreatePost } from '@/hooks/usePosts';
import { createPostSchema, CreatePostFormData } from '@/utils/validation';
import { storageService } from '@/services/storage';
import { Button } from '@/components/common/Button';
import { CommunitiesStackParamList } from '@/navigation/MainNavigator';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

type RouteProps = RouteProp<CommunitiesStackParamList, 'CreatePost'>;
type NavigationProp = NativeStackNavigationProp<CommunitiesStackParamList, 'CreatePost'>;

let isPostSubmitting = false;

export function CreatePostScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { communityId, communityName } = route.params;
  const createPost = useCreatePost();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      body: '',
    },
    mode: 'onSubmit',
  });

  const titleValue = watch('title');
  const bodyValue = watch('body');

  useEffect(() => {
    isPostSubmitting = false;
    return () => {
      isPostSubmitting = false;
    };
  }, []);

  useEffect(() => {
    async function loadDraft() {
      const draft = await storageService.getPostDraft();
      if (draft) {
        setValue('title', draft.title);
        setValue('body', draft.body);
      }
    }
    loadDraft();
  }, [setValue]);

  useEffect(() => {
    if (titleValue || bodyValue) {
      storageService.setPostDraft({ title: titleValue, body: bodyValue });
    }
  }, [titleValue, bodyValue]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSubmit = useCallback(
    async (data: CreatePostFormData) => {
      if (isPostSubmitting) return;
      isPostSubmitting = true;
      try {
        await createPost.mutateAsync({
          communityId,
          title: data.title,
          body: data.body,
        });
        await storageService.clearPostDraft();
        reset();
        isPostSubmitting = false;
        navigation.goBack();
      } catch (error: unknown) {
        isPostSubmitting = false;
        const apiError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (apiError?.response?.status === 409) {
          setError('title', {
            type: 'manual',
            message:
              apiError.response.data?.message ??
              'A post with this title already exists in this community',
          });
        }
      }
    },
    [createPost, communityId, reset, setError, navigation]
  );

  const titleLength = titleValue?.length ?? 0;
  const bodyLength = bodyValue?.length ?? 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.headerButton}
          accessibilityLabel="Close create post"
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>New Post</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {communityName}
          </Text>
        </View>
        <Button
          label="Post"
          onPress={handleSubmit(onSubmit)}
          loading={createPost.isPending}
          disabled={createPost.isPending}
          size="sm"
          style={styles.postButton}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.communityBadge}>
          <Ionicons name="people-outline" size={14} color={colors.primary} />
          <Text style={styles.communityBadgeText}>Posting to {communityName}</Text>
        </View>

        <View style={styles.formCard}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.titleSection}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Post title"
                  placeholderTextColor={colors.textMuted}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  maxLength={150}
                  returnKeyType="next"
                  keyboardType="default"
                  autoCapitalize="sentences"
                  autoCorrect
                  autoFocus
                />
                {errors.title && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                    <Text style={styles.errorText}>{errors.title.message}</Text>
                  </View>
                )}
                <Text style={styles.charCount}>{titleLength}/150</Text>
              </View>
            )}
          />

          <View style={styles.divider} />

          <Controller
            control={control}
            name="body"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.bodySection}>
                <TextInput
                  style={styles.bodyInput}
                  placeholder="Share your thoughts, questions or insights..."
                  placeholderTextColor={colors.textMuted}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  maxLength={5000}
                  returnKeyType="default"
                  keyboardType="default"
                  autoCapitalize="sentences"
                  autoCorrect
                  multiline
                  textAlignVertical="top"
                  scrollEnabled
                />
                {errors.body && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                    <Text style={styles.errorText}>{errors.body.message}</Text>
                  </View>
                )}
                <Text style={styles.charCount}>{bodyLength}/5000</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={16} color={colors.warning} />
            <Text style={styles.tipsTitle}>Posting Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
              <Text style={styles.tipText}>Be clear and specific in your title</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
              <Text style={styles.tipText}>Provide enough context in the body</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
              <Text style={styles.tipText}>Follow community rules before posting</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
    ...shadows.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  postButton: {
    minWidth: 64,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  communityBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  titleSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    includeFontPadding: false,
    paddingVertical: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  bodySection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  bodyInput: {
    fontSize: 15,
    color: colors.textPrimary,
    includeFontPadding: false,
    lineHeight: 22,
    minHeight: 100,
    maxHeight: 200,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    ...shadows.sm,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
});
