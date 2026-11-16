import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { getCategoryMeta, getStatusMeta } from '../../constants/config';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme';
import { complaintTitle, formatComplaintDate } from '../../utils/dashboardStats';

export default function RecentComplaintCard({ complaint, onPress }) {
  const status = getStatusMeta(complaint.status);
  const category = getCategoryMeta(complaint.category);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <Text style={styles.title} numberOfLines={2}>{complaintTitle(complaint)}</Text>
        <ChevronRight size={18} color={COLORS.gray400} />
      </View>
      <Text style={styles.meta}>{category.label} · {formatComplaintDate(complaint.createdAt)}</Text>
      <View style={[styles.badge, { backgroundColor: `${status.color}18` }]}>
        <View style={[styles.dot, { backgroundColor: status.color }]} />
        <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
    lineHeight: 21,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.gray500,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
