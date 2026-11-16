import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export default function NotificationsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Alerts</Text>
      <Text style={styles.body}>Notification updates will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.xl, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.gray900 },
  body: { color: COLORS.gray600, marginTop: 8 },
});
