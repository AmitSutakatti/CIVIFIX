import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusCircle, RefreshCw } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import RecentComplaintCard from '../../components/dashboard/RecentComplaintCard';
import { complaintService } from '../../services/complaintService';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function ComplaintsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const {
    data: complaints = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['complaints', 'mine'],
    queryFn: complaintService.getMyComplaints,
    enabled: isAuthenticated,
  });

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) refetch();
    }, [isAuthenticated, refetch])
  );

  const errorMessage =
    error?.userMessage || error?.response?.data?.message || 'Could not load your complaints.';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + SPACING.base, paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <Text style={styles.title}>My Complaints</Text>
        <Text style={styles.subtitle}>Follow the latest status of your reports.</Text>

        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.body}>Loading complaints...</Text>
          </View>
        ) : isError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Complaints unavailable</Text>
            <Text style={styles.body}>{errorMessage}</Text>
            <Pressable style={styles.action} onPress={() => refetch()}>
              <RefreshCw size={16} color={COLORS.primary} />
              <Text style={styles.actionText}>Try again</Text>
            </Pressable>
          </View>
        ) : complaints.length ? (
          complaints.map((complaint) => (
            <RecentComplaintCard
              key={complaint._id}
              complaint={complaint}
              onPress={() => router.push(`/complaint/${complaint._id}`)}
            />
          ))
        ) : (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>No complaints yet</Text>
            <Text style={styles.body}>Submit a civic issue to track it here.</Text>
            <Pressable style={styles.action} onPress={() => router.push('/(tabs)/report')}>
              <PlusCircle size={16} color={COLORS.primary} />
              <Text style={styles.actionText}>Report a Complaint</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.lg },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.gray900 },
  subtitle: { marginTop: 4, marginBottom: SPACING.lg, color: COLORS.gray600 },
  stateBox: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
  },
  stateTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gray900, textAlign: 'center' },
  body: { marginTop: 8, color: COLORS.gray600, textAlign: 'center', lineHeight: 20 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  actionText: { color: COLORS.primary, fontWeight: '700' },
});
