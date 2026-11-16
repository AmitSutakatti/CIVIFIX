import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import CategoryIcon from './CategoryIcon';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function CategoryCard({ category, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <CategoryIcon name={category.icon} size={20} color={selected ? COLORS.primary : COLORS.gray600} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.description}>{category.description}</Text>
      </View>
      <View style={[styles.check, selected && styles.checkSelected]}>
        {selected ? <Check size={14} color={COLORS.white} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: COLORS.white },
  copy: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  description: { marginTop: 2, fontSize: 12, lineHeight: 17, color: COLORS.gray500 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
});
