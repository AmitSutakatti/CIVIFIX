import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function StepProgress({ step, total = 3, label }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.step}>Step {step} of {total}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.track}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[styles.segment, index < step ? styles.segmentDone : styles.segmentTodo]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  step: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  label: { color: COLORS.gray500, fontSize: 13, fontWeight: '600' },
  track: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: RADIUS.full },
  segmentDone: { backgroundColor: COLORS.primary },
  segmentTodo: { backgroundColor: COLORS.gray200 },
});
