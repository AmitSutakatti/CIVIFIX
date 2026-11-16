import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme';

export default function StatCard({ label, value, color, icon }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOW.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gray900,
  },
  label: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray500,
  },
});
