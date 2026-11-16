import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.body}>{user?.name || 'Citizen'}</Text>
      <Text style={styles.meta}>{user?.email || ''}</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.xl, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.gray900 },
  body: { color: COLORS.gray900, marginTop: 12, fontSize: 18, fontWeight: '600' },
  meta: { color: COLORS.gray600, marginTop: 4 },
  button: {
    marginTop: 28,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: COLORS.white, fontWeight: '700' },
});
