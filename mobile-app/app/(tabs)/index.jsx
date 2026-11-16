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
import { Bell, CheckCircle2, ClipboardList, Clock3, PlusCircle, RefreshCw } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { complaintService } from '../../services/complaintService';
import StatCard from '../../components/dashboard/StatCard';
import RecentComplaintCard from '../../components/dashboard/RecentComplaintCard';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme';
import { summarizeComplaints } from '../../utils/dashboardStats';

const RECENT_LIMIT = 4;

function greetingForHour(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { unreadCount } = useNotificationCount();
  const firstName = user?.name?.split(' ')[0] || 'Citizen';

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
      refreshUser();
      refetch();
    }, [refreshUser, refetch])
  );

  const stats = summarizeComplaints(complaints);
  const recent = complaints.slice(0, RECENT_LIMIT);
  const errorMessage = error?.userMessage || error?.response?.data?.message || 'Could not load your complaints.';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.base, paddingBottom: insets.bottom + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>CivicFix</Text>
            <Text style={styles.greeting}>{greetingForHour()}, {firstName}</Text>
            <Text style={styles.subtitle}>Track the issues you have reported.</Text>
          </View>
          <Pressable
            style={styles.bell}
            onPress={() => router.push('/(tabs)/notifications')}
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color={COLORS.primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Pressable style={styles.reportButton} onPress={() => router.push('/(tabs)/report')}>
          <PlusCircle size={22} color={COLORS.white} />
          <Text style={styles.reportText}>Report a Complaint</Text>
        </Pressable>

        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>Loading your dashboard…</Text>
          </View>
        ) : isError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Dashboard unavailable</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
            <Pressable style={styles.retry} onPress={() => refetch()}>
              <RefreshCw size={16} color={COLORS.primary} />
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  label="Total"
                  value={stats.total}
                  color={COLORS.primary}
                  icon={<ClipboardList size={18} color={COLORS.primary} />}
                />
                <StatCard
                  label="Pending"
                  value={stats.pending}
                  color={COLORS.info}
                  icon={<Clock3 size={18} color={COLORS.info} />}
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard
                  label="In progress"
                  value={stats.inProgress}
                  color={COLORS.statusInProgress}
                  icon={<RefreshCw size={18} color={COLORS.statusInProgress} />}
                />
                <StatCard
                  label="Completed"
                  value={stats.completed}
                  color={COLORS.success}
                  icon={<CheckCircle2 size={18} color={COLORS.success} />}
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent complaints</Text>
              <Pressable onPress={() => router.push('/(tabs)/complaints')}>
                <Text style={styles.viewAll}>View all</Text>
              </Pressable>
            </View>

            {recent.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.stateTitle}>No complaints yet</Text>
                <Text style={styles.stateText}>
                  Report a civic issue and it will show up here with its status.
                </Text>
                <Pressable style={styles.retry} onPress={() => router.push('/(tabs)/report')}>
                  <PlusCircle size={16} color={COLORS.primary} />
                  <Text style={styles.retryText}>Report a Complaint</Text>
                </Pressable>
              </View>
            ) : (
              recent.map((complaint) => (
                <RecentComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  onPress={() => router.push(`/complaint/${complaint._id}`)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.lg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerText: { flex: 1, paddingRight: SPACING.md },
  kicker: { color: COLORS.primary, fontWeight: '700', letterSpacing: 0.4, fontSize: 13 },
  greeting: { fontSize: 26, fontWeight: '800', color: COLORS.gray900, marginTop: 4 },
  subtitle: { color: COLORS.gray600, marginTop: 4, lineHeight: 20 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    height: 54,
    marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  reportText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  statsGrid: { gap: SPACING.md, marginBottom: SPACING.xl },
  statsRow: { flexDirection: 'row', gap: SPACING.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
  viewAll: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  stateBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  stateTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gray900, textAlign: 'center' },
  stateText: { marginTop: 6, color: COLORS.gray600, textAlign: 'center', lineHeight: 20 },
  retry: {
    marginTop: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
  },
  retryText: { color: COLORS.primary, fontWeight: '700' },
});
