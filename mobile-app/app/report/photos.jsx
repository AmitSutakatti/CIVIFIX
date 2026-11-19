import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Camera, Images, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import StepProgress from '../../components/report/StepProgress';
import { MAX_COMPLAINT_IMAGES, prepareComplaintImage } from '../../services/complaintImages';
import { complaintService } from '../../services/complaintService';
import {
  getComplaintDraft,
  resetComplaintDraft,
  updateComplaintDraft,
  useComplaintDraft,
} from '../../state/complaintDraft';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import BrandLogo from '../../components/branding/BrandLogo';

function imageKey(image) {
  return image.assetId ? `asset:${image.assetId}` : `uri:${image.sourceUri || image.uri}`;
}

function photoCountLabel(count) {
  return `${count} / ${MAX_COMPLAINT_IMAGES} photos selected`;
}

export default function ComplaintPhotosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const draft = useComplaintDraft();
  const photos = Array.isArray(draft.images) ? draft.images : [];
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [continueMessage, setContinueMessage] = useState('');

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/report/location');
  };

  const addAssetsToDraft = async (assets) => {
    if (!Array.isArray(assets) || !assets.length) return;

    const existing = getComplaintDraft().images || [];
    const remaining = MAX_COMPLAINT_IMAGES - existing.length;
    if (assets.length > remaining) {
      setMessage(`You can add only ${remaining} more photo${remaining === 1 ? '' : 's'}. No new photos were added.`);
      return;
    }

    const seen = new Set(existing.map(imageKey));
    const added = [];
    const failures = [];
    let duplicates = 0;

    for (const asset of assets) {
      if (!asset?.uri) {
        failures.push('A selected photo has no accessible file and was not added.');
        continue;
      }

      const key = imageKey(asset);
      if (seen.has(key)) {
        duplicates += 1;
        continue;
      }

      try {
        const prepared = await prepareComplaintImage(asset);
        seen.add(key);
        added.push(prepared);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : 'A selected photo could not be prepared.');
      }
    }

    if (added.length) {
      updateComplaintDraft({ images: [...existing, ...added] });
    }

    const messages = [];
    if (added.length) messages.push(`${added.length} photo${added.length === 1 ? '' : 's'} added.`);
    if (duplicates) messages.push(`${duplicates} duplicate photo${duplicates === 1 ? '' : 's'} skipped.`);
    if (failures.length) messages.push(failures.join(' '));
    setMessage(messages.join(' ') || 'Those photos are already in this complaint.');
    setContinueMessage('');
  };

  const takePhoto = async () => {
    if (busy || submitting) return;
    if (photos.length >= MAX_COMPLAINT_IMAGES) {
      setMessage(`You can select up to ${MAX_COMPLAINT_IMAGES} photos. Remove a photo before adding another.`);
      return;
    }

    setBusy(true);
    setMessage('');
    setContinueMessage('');
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setMessage(permission.canAskAgain
          ? 'Camera permission is needed to take a photo. Allow access when prompted.'
          : 'Camera access is blocked. Enable it for CivicFix in your device settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        exif: false,
        base64: false,
      });
      if (!result.canceled) await addAssetsToDraft(result.assets);
    } catch {
      setMessage('The camera could not be opened. Check camera access and try again.');
    } finally {
      setBusy(false);
    }
  };

  const chooseFromGallery = async () => {
    if (busy || submitting) return;
    const remaining = MAX_COMPLAINT_IMAGES - photos.length;
    if (remaining <= 0) {
      setMessage(`You can select up to ${MAX_COMPLAINT_IMAGES} photos. Remove a photo before adding another.`);
      return;
    }

    setBusy(true);
    setMessage('');
    setContinueMessage('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        orderedSelection: true,
        legacy: false,
        quality: 1,
        exif: false,
        base64: false,
      });
      if (!result.canceled) await addAssetsToDraft(result.assets);
    } catch {
      setMessage('The photo picker could not be opened. Check photo access and try again.');
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = (photo) => {
    if (submitting) return;
    updateComplaintDraft({
      images: photos.filter((item) => imageKey(item) !== imageKey(photo)),
    });
    setMessage('');
    setContinueMessage('');
  };

  const continueWithDraft = async () => {
    if (busy || submitting) return;
    const currentDraft = getComplaintDraft();
    if (
      !currentDraft.categoryId ||
      !currentDraft.title?.trim() ||
      !currentDraft.description?.trim() ||
      !Number.isFinite(currentDraft.latitude) ||
      !Number.isFinite(currentDraft.longitude)
    ) {
      setMessage('Complete the category, title, description, and location before submitting.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setContinueMessage('');
    try {
      const response = await complaintService.create({
        category: currentDraft.categoryId,
        title: currentDraft.title,
        description: currentDraft.description,
        additionalInfo: currentDraft.additionalInfo,
        latitude: currentDraft.latitude,
        longitude: currentDraft.longitude,
        address: currentDraft.address,
        images: currentDraft.images || [],
      });
      const complaint = response?.data?.complaint;
      if (!response?.success || !complaint?._id) {
        setMessage(response?.message || 'The complaint could not be submitted. Please try again.');
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['complaints', 'mine'] });
      resetComplaintDraft();
      router.replace({
        pathname: '/complaint/[id]',
        params: {
          id: complaint._id,
          notice: response.data.reviewNotice || '',
          submitted: 'true',
          emailSent: response.data.emailConfirmationSent === true ? 'true' : 'false',
        },
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.userMessage ||
        'The complaint could not be submitted. Check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.back} accessibilityLabel="Go back">
          <ArrowLeft size={20} color={COLORS.gray900} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Add Complaint Photos</Text>
          {draft.title ? <Text style={styles.headerMeta} numberOfLines={1}>{draft.title}</Text> : null}
        </View>
        <BrandLogo size={42} />
      </View>
      <StepProgress step={4} total={4} label="Photos" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>
          Photos are optional, but they help officers understand the issue and identify the right response.
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, (busy || submitting) && styles.disabled]}
            onPress={takePhoto}
            disabled={busy || submitting}
          >
            {busy ? <ActivityIndicator color={COLORS.primary} /> : <Camera size={22} color={COLORS.primary} />}
            <Text style={styles.actionText}>Take Photo</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, (busy || submitting) && styles.disabled]}
            onPress={chooseFromGallery}
            disabled={busy || submitting}
          >
            {busy ? <ActivityIndicator color={COLORS.primary} /> : <Images size={22} color={COLORS.primary} />}
            <Text style={styles.actionText}>Choose from Gallery</Text>
          </Pressable>
        </View>

        <View style={styles.countRow}>
          <Text style={styles.count}>{photoCountLabel(photos.length)}</Text>
          {busy ? <Text style={styles.processing}>Preparing photo...</Text> : null}
          {submitting ? <Text style={styles.processing}>Submitting complaint...</Text> : null}
        </View>
        {photos.length >= MAX_COMPLAINT_IMAGES ? (
          <Text style={styles.helper}>Maximum reached. Remove a photo to add another.</Text>
        ) : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {photos.length ? (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <View key={imageKey(photo)} style={styles.photoCard}>
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                  onError={() => setMessage('A photo preview could not be loaded. Remove it and select it again.')}
                />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removePhoto(photo)}
                  disabled={busy || submitting}
                  accessibilityLabel={`Remove ${photo.fileName || 'photo'}`}
                  accessibilityRole="button"
                >
                  <X size={16} color={COLORS.white} />
                </Pressable>
                <Text style={styles.fileName} numberOfLines={1}>{photo.fileName}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Images size={30} color={COLORS.gray400} />
            <Text style={styles.emptyTitle}>No photos added</Text>
            <Text style={styles.emptyBody}>You can continue without photos.</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {continueMessage ? <Text style={styles.saved}>{continueMessage}</Text> : null}
        <Pressable
          style={[styles.continueButton, (busy || submitting) && styles.disabled]}
          onPress={continueWithDraft}
          disabled={busy || submitting}
        >
          <Text style={styles.continueText}>{submitting ? 'Submitting...' : 'Submit Complaint'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  scroll: { flex: 1 },
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
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
  headerMeta: { marginTop: 2, color: COLORS.gray500, fontSize: 13 },
  content: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xl },
  instruction: { color: COLORS.gray600, lineHeight: 21, marginBottom: SPACING.md },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: {
    flex: 1,
    minHeight: 76,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  actionText: { color: COLORS.primary, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  countRow: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  count: { color: COLORS.gray900, fontWeight: '800' },
  processing: { color: COLORS.gray500, fontSize: 12 },
  helper: { color: COLORS.gray500, fontSize: 13, marginBottom: SPACING.sm },
  message: { color: COLORS.error, lineHeight: 19, marginBottom: SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: SPACING.md },
  photoCard: { width: '48%', marginBottom: SPACING.sm },
  thumbnail: { width: '100%', aspectRatio: 1, borderRadius: RADIUS.md, backgroundColor: COLORS.gray100 },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.78)',
  },
  fileName: { marginTop: 6, color: COLORS.gray600, fontSize: 12 },
  empty: {
    minHeight: 180,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderStyle: 'dashed',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  emptyTitle: { marginTop: SPACING.sm, color: COLORS.gray700, fontWeight: '700' },
  emptyBody: { marginTop: SPACING.xs, color: COLORS.gray500, fontSize: 13 },
  footer: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  saved: { color: COLORS.success, lineHeight: 19, marginBottom: SPACING.sm, textAlign: 'center' },
  continueButton: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
