import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import BrandLogo from '../../components/branding/BrandLogo';

export default function NotificationsScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.heading}>
        <BrandLogo size={48} />
        <Text style={styles.title}>Alerts</Text>
      </View>
      <Text style={styles.body}>Notification updates will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.xl, paddingTop: 56 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.gray900 },
  body: { color: COLORS.gray600, marginTop: 8 },
});
