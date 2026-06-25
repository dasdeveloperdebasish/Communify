import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCreatePost } from '@/hooks/usePosts';
import { createPostSchema, CreatePostFormData } from '@/utils/validation';
import { storageService } from '@/services/storage';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { CommunitiesStackParamList } from '@/navigation/MainNavigator';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

type RouteProps = RouteProp<CommunitiesStackParamList, 'CreatePost'>;
type NavigationProp = NativeStackNavigationProp<CommunitiesStackParamList, 'CreatePost'>;

export function CreatePostScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { communityId, communityName } = route.params;
  const createPost = useCreatePost();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      body: '',
    },
  });

  const titleValue = watch('title');
  const bodyValue = watch('body');

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
    if (isDirty && (titleValue || bodyValue)) {
      storageService.setPostDraft({ title: titleValue, body: bodyValue });
    }
  }, [titleValue, bodyValue, isDirty]);

  const handleDiscard = useCallback(() => {
    if (isDirty && (titleValue || bodyValue)) {
      Alert.alert('Discard Post?', 'Your draft will be saved and you can continue later.', [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearPostDraft();
            reset();
            navigation.goBack();
          },
        },
      ]);
    } else {
      navigation.goBack();
    }
  }, [isDirty, titleValue, bodyValue, reset, navigation]);

  const onSubmit = useCallback(
    async (data: CreatePostFormData) => {
      if (createPost.isPending) return;
      try {
        await createPost.mutateAsync({
          communityId,
          title: data.title,
          body: data.body,
        });
        await storageService.clearPostDraft();
        reset();
        navigation.goBack();
      } catch {
        Alert.alert('Post Failed', 'Could not submit your post. Your draft has been saved.', [
          { text: 'OK' },
        ]);
      }
    },
    [createPost, communityId, reset, navigation]
  );

  const titleLength = titleValue?.length ?? 0;
  const bodyLength = bodyValue?.length ?? 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard} style={styles.headerButton}>
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
      >
        <View style={styles.communityBadge}>
          <Ionicons name="people-outline" size={14} color={colors.primary} />
          <Text style={styles.communityBadgeText}>Posting to {communityName}</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Title"
                  placeholder="Give your post a clear, descriptive title..."
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.title?.message}
                  maxLength={150}
                  returnKeyType="next"
                  autoFocus
                />
              )}
            />
            <Text style={styles.charCount}>{titleLength}/150</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="body"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Body"
                  placeholder="Share your thoughts, questions or insights..."
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.body?.message}
                  multiline
                  numberOfLines={8}
                  maxLength={5000}
                  containerStyle={styles.bodyInputContainer}
                  style={styles.bodyInput}
                  returnKeyType="default"
                  textAlignVertical="top"
                />
              )}
            />
            <Text style={styles.charCount}>{bodyLength}/5000</Text>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={16} color={colors.warning} />
            <Text style={styles.tipsTitle}>Posting Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-outline" size={14} color={colors.success} />
              <Text style={styles.tipText}>Be clear and specific in your title</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-outline" size={14} color={colors.success} />
              <Text style={styles.tipText}>Provide enough context in the body</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-outline" size={14} color={colors.success} />
              <Text style={styles.tipText}>Follow community rules before posting</Text>
            </View>
          </View>
        </View>

        {createPost.isError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={styles.errorText}>Failed to submit. Your draft is saved — try again.</Text>
          </View>
        )}
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
    paddingVertical: spacing.sm,
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
    padding: spacing.md,
    ...shadows.md,
  },
  fieldContainer: {
    position: 'relative',
  },
  bodyInputContainer: {
    marginBottom: spacing.xs,
  },
  bodyInput: {
    minHeight: 160,
    paddingTop: spacing.sm,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingRight: spacing.xs,
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
    gap: spacing.xs,
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
});
