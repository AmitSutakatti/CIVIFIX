import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getCategoryMeta, getStatusMeta, resolveImageUrl } from '../../constants/config';
import { complaintService } from '../../services/complaintService';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { formatComplaintDate } from '../../utils/dashboardStats';
import BrandLogo from '../../components/branding/BrandLogo';

function firstParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ComplaintDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = firstParam(params.id);
  const notice = firstParam(params.notice);
  const submitted = firstParam(params.submitted) === 'true';
  const emailSent = firstParam(params.emailSent) === 'true';
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const {
    data: complaint,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintService.getComplaint(id),
    enabled: Boolean(id && isAuthenticated),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Loading complaint...</Text>
      </View>
    );
  }

  if (isError || !complaint) {
    return (
      <View style={[styles.centered, styles.errorState]}>
        <Text style={styles.title}>Complaint unavailable</Text>
        <Text style={styles.muted}>
          {error?.userMessage || error?.response?.data?.message || 'Could not load this complaint.'}
        </Text>
        <Pressable style={styles.retry} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const category = getCategoryMeta(complaint.category);
  const status = getStatusMeta(complaint.status);
  const images = Array.isArray(complaint.images) ? complaint.images : [];
  const history = Array.isArray(complaint.statusHistory) ? [...complaint.statusHistory].reverse() : [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + SPACING.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeading}>
        <BrandLogo size={42} />
        <Text style={styles.pageHeadingTitle}>Complaint Details</Text>
      </View>
      {submitted ? (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Complaint submitted successfully</Text>
          <Text style={styles.successMessage}>
            {notice || 'Your complaint has been recorded and is ready to track.'}
          </Text>
          <Text style={styles.successMessage}>
            {emailSent
              ? 'A confirmation email has been sent to your registered email address.'
              : 'Your complaint was saved successfully, but a confirmation email could not be sent.'}
          </Text>
          <Text style={styles.complaintId}>Complaint ID: {complaint._id}</Text>
          <Pressable
            style={styles.dashboardButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.dashboardButtonText}>Return to Dashboard</Text>
          </Pressable>
        </View>
      ) : notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.category}>{category.label}</Text>
        <Text style={styles.title}>{complaint.title || category.label}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${status.color}18` }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{complaint.description}</Text>
        {complaint.additionalInfo ? (
          <>
            <Text style={styles.sectionTitle}>Additional information</Text>
            <Text style={styles.body}>{complaint.additionalInfo}</Text>
          </>
        ) : null}
        <Text style={styles.sectionTitle}>Location</Text>
        {complaint.location?.address ? <Text style={styles.body}>{complaint.location.address}</Text> : null}
        <Text style={styles.muted}>
          {complaint.location?.latitude}, {complaint.location?.longitude}
        </Text>
        <Text style={styles.muted}>Submitted {formatComplaintDate(complaint.createdAt)}</Text>
      </View>

      {images.length ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Photos ({images.length})</Text>
          <View style={styles.imageGrid}>
            {images.map((image, index) => {
              const uri = resolveImageUrl(image.url);
              return uri ? (
                <Image
                  key={image._id || `${image.url}-${index}`}
                  source={{ uri }}
                  style={styles.image}
                  resizeMode="cover"
                  accessibilityLabel={`Complaint photo ${index + 1}`}
                />
              ) : null;
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status history</Text>
        {history.length ? history.map((entry, index) => {
          const itemStatus = getStatusMeta(entry.status);
          return (
            <View key={`${entry.status}-${entry.updatedAt}-${index}`} style={styles.historyRow}>
              <View style={[styles.historyDot, { backgroundColor: itemStatus.color }]} />
              <View style={styles.historyCopy}>
                <Text style={styles.historyStatus}>{itemStatus.label}</Text>
                {entry.note ? <Text style={styles.body}>{entry.note}</Text> : null}
                <Text style={styles.muted}>{formatComplaintDate(entry.updatedAt)}</Text>
              </View>
            </View>
          );
        }) : <Text style={styles.muted}>No status updates are available yet.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.base, gap: SPACING.md },
  pageHeading: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pageHeadingTitle: { color: COLORS.gray900, fontSize: 20, fontWeight: '800' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  errorState: { gap: SPACING.sm },
  card: { padding: SPACING.base, borderRadius: RADIUS.lg, backgroundColor: COLORS.white },
  successCard: { padding: SPACING.base, borderRadius: RADIUS.lg, backgroundColor: COLORS.white },
  successTitle: { color: COLORS.gray900, fontSize: 16, fontWeight: '800' },
  successMessage: { marginTop: SPACING.xs, color: COLORS.gray600, lineHeight: 20 },
  complaintId: { marginTop: SPACING.sm, color: COLORS.gray700, fontSize: 13, fontWeight: '700' },
  dashboardButton: {
    marginTop: SPACING.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  dashboardButtonText: { color: COLORS.white, fontWeight: '700' },
  notice: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    color: COLORS.primary,
    backgroundColor: COLORS.white,
    lineHeight: 20,
  },
  category: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  title: { marginTop: 4, color: COLORS.gray900, fontSize: 21, fontWeight: '800' },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: SPACING.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { marginTop: SPACING.md, marginBottom: 5, color: COLORS.gray900, fontWeight: '800' },
  body: { color: COLORS.gray700, lineHeight: 21 },
  muted: { marginTop: 6, color: COLORS.gray500, lineHeight: 19 },
  retry: { marginTop: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: 9, borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  retryText: { color: COLORS.white, fontWeight: '700' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
  image: { width: '48%', aspectRatio: 1, borderRadius: RADIUS.md, backgroundColor: COLORS.gray100 },
  historyRow: { flexDirection: 'row', gap: SPACING.sm, paddingTop: SPACING.md },
  historyDot: { width: 9, height: 9, borderRadius: 5, marginTop: 4 },
  historyCopy: { flex: 1 },
  historyStatus: { color: COLORS.gray900, fontWeight: '700' },
});
