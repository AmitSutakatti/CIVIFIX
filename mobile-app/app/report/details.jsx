import { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Pencil } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { CATEGORY_GROUPS, getComplaintCategory } from '../../constants/complaintCategories';
import { complaintDetailsSchema, trimmedComplaintDetails } from '../../constants/complaintFormSchema';
import StepProgress from '../../components/report/StepProgress';
import CategoryIcon from '../../components/report/CategoryIcon';
import { getComplaintDraft, updateComplaintDraft, useComplaintDraft } from '../../state/complaintDraft';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import BrandLogo from '../../components/branding/BrandLogo';

function firstParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ComplaintDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const draft = useComplaintDraft();

  useEffect(() => {
    const category = getComplaintCategory(firstParam(params.id));
    if (!category) return;
    updateComplaintDraft({
      categoryId: category.id,
      categoryName: category.name,
      group: category.group,
      routingType: category.routingType,
    });
  }, [params.id]);

  const saved = getComplaintDraft();
  const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(complaintDetailsSchema),
    mode: 'all',
    defaultValues: {
      title: saved.title,
      description: saved.description,
      additionalInfo: saved.additionalInfo,
    },
  });

  useEffect(() => {
    const subscription = watch((values) => {
      updateComplaintDraft({
        title: values.title ?? '',
        description: values.description ?? '',
        additionalInfo: values.additionalInfo ?? '',
      });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const description = watch('description') || '';
  const additionalInfo = watch('additionalInfo') || '';
  const category = getComplaintCategory(draft.categoryId);
  const group = CATEGORY_GROUPS[draft.group];

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/report');
  };

  const onContinue = handleSubmit((values) => {
    const text = trimmedComplaintDetails(values);
    const next = updateComplaintDraft(text);
    router.push({
      pathname: '/report/location',
      params: {
        id: next.categoryId,
        name: next.categoryName,
        group: next.group,
        routingType: next.routingType,
        title: next.title,
        description: next.description,
        additionalInfo: next.additionalInfo,
      },
    });
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={goBack} style={styles.back} accessibilityLabel="Go back">
          <ArrowLeft size={20} color={COLORS.gray900} />
        </Pressable>
        <Text style={styles.headerTitle}>Describe the issue</Text>
        <BrandLogo size={42} />
      </View>
      <StepProgress step={2} total={4} label="Title and description" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.fieldLabel}>Selected category</Text>
        {category ? (
          <View style={styles.categoryCard}>
            <View style={styles.categoryIcon}>
              <CategoryIcon name={category.icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.categoryCopy}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryGroup}>{group?.name}</Text>
            </View>
            <Pressable onPress={goBack} style={styles.edit} accessibilityLabel="Edit category">
              <Pencil size={14} color={COLORS.primary} />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.missing} onPress={goBack}>
            <Text style={styles.missingText}>Choose a category before writing the complaint.</Text>
          </Pressable>
        )}

        <Field label="Complaint title" error={errors.title}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={100}
                placeholder="Short summary, such as Overflowing bin on MG Road"
                placeholderTextColor={COLORS.gray400}
                style={[styles.input, errors.title && styles.inputError]}
                returnKeyType="next"
              />
            )}
          />
        </Field>

        <Field
          label="Complaint description"
          error={errors.description}
          counter={`${description.length}/500`}
        >
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={500}
                multiline
                textAlignVertical="top"
                placeholder="What is wrong, who is affected, and how long it has been happening?"
                placeholderTextColor={COLORS.gray400}
                style={[styles.input, styles.multiline, errors.description && styles.inputError]}
              />
            )}
          />
        </Field>

        <Field
          label="Additional information"
          optional
          error={errors.additionalInfo}
          counter={`${additionalInfo.length}/300`}
        >
          <Controller
            control={control}
            name="additionalInfo"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={300}
                multiline
                textAlignVertical="top"
                placeholder="Optional details, such as a landmark or the best time to inspect"
                placeholderTextColor={COLORS.gray400}
                style={[styles.input, styles.additional, errors.additionalInfo && styles.inputError]}
              />
            )}
          />
        </Field>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          style={[styles.continueButton, !isValid && styles.continueDisabled]}
          disabled={!isValid}
          onPress={onContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, optional, error, counter, children }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>
          {label}
          {optional ? <Text style={styles.optional}>  Optional</Text> : null}
        </Text>
        {counter ? <Text style={styles.counter}>{counter}</Text> : null}
      </View>
      {children}
      {error ? <Text style={styles.error}>{error.message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
  content: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.lg },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: SPACING.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCopy: { flex: 1 },
  categoryName: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  categoryGroup: { marginTop: 2, fontSize: 12, color: COLORS.gray500 },
  edit: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  editText: { color: COLORS.primary, fontWeight: '700' },
  missing: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  missingText: { color: COLORS.gray600, lineHeight: 20 },
  field: { marginTop: SPACING.lg },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray700, marginBottom: 6 },
  optional: { color: COLORS.gray400, fontWeight: '600' },
  counter: { fontSize: 12, color: COLORS.gray400, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.gray900,
  },
  multiline: { minHeight: 140 },
  additional: { minHeight: 96 },
  inputError: { borderColor: COLORS.error },
  error: { marginTop: 4, color: COLORS.error, fontSize: 12 },
  footer: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  continueButton: {
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueDisabled: { opacity: 0.45 },
  continueText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
