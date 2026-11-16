import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

function BaseToast({ text1, text2, accent }) {
  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      {text1 ? <Text style={styles.title}>{text1}</Text> : null}
      {text2 ? <Text style={styles.message}>{text2}</Text> : null}
    </View>
  );
}

export const toastConfig = {
  success: (props) => <BaseToast {...props} accent={COLORS.success} />,
  error: (props) => <BaseToast {...props} accent={COLORS.error} />,
  info: (props) => <BaseToast {...props} accent={COLORS.info} />,
};

const styles = StyleSheet.create({
  card: {
    minHeight: 56,
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.gray900,
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    color: COLORS.gray600,
    fontSize: 13,
    marginTop: 2,
  },
});
