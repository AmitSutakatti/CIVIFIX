import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, LogOut, Mail, Phone, UserRound } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../constants/config';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme';
import { prepareComplaintImage } from '../../services/complaintImages';
import { userService } from '../../services/userService';
import BrandLogo from '../../components/branding/BrandLogo';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const name = user?.name || 'Citizen';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  const profilePhotoUrl = resolveImageUrl(user?.profilePhotoUrl);

  const chooseProfilePhoto = async () => {
    if (isUploading) return;

    setMessage('');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setMessage(permission.canAskAgain
          ? 'Photo library access is needed to choose a profile photo.'
          : 'Photo access is blocked. Enable it for CivicFix in your device settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        exif: false,
        base64: false,
      });
      const asset = result.assets?.[0];
      if (result.canceled || !asset) return;

      setIsUploading(true);
      const preparedImage = await prepareComplaintImage(asset);
      const updatedUser = await userService.updateProfilePhoto(preparedImage);
      updateUser(updatedUser);
      setMessage('Profile photo updated.');
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.userMessage ||
        error.message ||
        'The profile photo could not be updated. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeading}>
        <BrandLogo size={48} />
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your CivicFix account</Text>
        </View>
      </View>

      <View style={styles.identityCard}>
        <Pressable
          style={styles.avatarButton}
          onPress={chooseProfilePhoto}
          disabled={isUploading}
          accessibilityRole="button"
          accessibilityLabel="Choose a profile photo"
        >
          {profilePhotoUrl ? (
            <Image source={{ uri: profilePhotoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initials}>{initials || 'C'}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            {isUploading
              ? <ActivityIndicator size="small" color={COLORS.white} />
              : <Camera size={17} color={COLORS.white} />}
          </View>
        </Pressable>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email || 'No email available'}</Text>
        <Pressable
          onPress={chooseProfilePhoto}
          disabled={isUploading}
          accessibilityRole="button"
        >
          <Text style={styles.photoAction}>
            {isUploading ? 'Uploading photo…' : profilePhotoUrl ? 'Change profile photo' : 'Add a profile photo'}
          </Text>
        </Pressable>
        {message ? (
          <Text style={[styles.message, message === 'Profile photo updated.' && styles.successMessage]}>
            {message}
          </Text>
        ) : null}
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Personal information</Text>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}><UserRound size={18} color={COLORS.primary} /></View>
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Full name</Text>
            <Text style={styles.detailValue}>{name}</Text>
          </View>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}><Mail size={18} color={COLORS.primary} /></View>
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user?.email || 'Not provided'}</Text>
          </View>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}><Phone size={18} color={COLORS.primary} /></View>
          <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{user?.phone || 'Not provided'}</Text>
          </View>
        </View>
      </View>

      {Number.isFinite(user?.rewardPoints) ? (
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>CivicFix points</Text>
          <Text style={styles.pointsValue}>{user.rewardPoints}</Text>
        </View>
      ) : null}

      <Pressable style={styles.logoutButton} onPress={logout}>
        <LogOut size={18} color={COLORS.error} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
  title: { color: COLORS.gray900, fontSize: 26, fontWeight: '800' },
  pageHeading: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headingCopy: { flex: 1 },
  subtitle: { marginTop: SPACING.xs, color: COLORS.gray600 },
  identityCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  avatarButton: { width: 112, height: 112, marginBottom: SPACING.md },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.gray100,
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  initials: { color: COLORS.primary, fontSize: 34, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    backgroundColor: COLORS.primary,
  },
  name: { color: COLORS.gray900, fontSize: 20, fontWeight: '800' },
  email: { marginTop: SPACING.xs, color: COLORS.gray600 },
  photoAction: { marginTop: SPACING.md, color: COLORS.primary, fontWeight: '700' },
  message: { marginTop: SPACING.sm, color: COLORS.error, textAlign: 'center', lineHeight: 19 },
  successMessage: { color: COLORS.success },
  detailsCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  sectionTitle: { marginBottom: SPACING.sm, color: COLORS.gray900, fontSize: 16, fontWeight: '800' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  detailCopy: { flex: 1 },
  detailLabel: { color: COLORS.gray500, fontSize: 12, fontWeight: '600' },
  detailValue: { marginTop: 2, color: COLORS.gray900, fontSize: 15, fontWeight: '600' },
  separator: { height: 1, marginLeft: 50, backgroundColor: COLORS.gray100 },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
  },
  pointsLabel: { color: COLORS.primary, fontWeight: '700' },
  pointsValue: { color: COLORS.primary, fontSize: 22, fontWeight: '800' },
  logoutButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: `${COLORS.error}35`,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
  },
  logoutText: { color: COLORS.error, fontWeight: '700' },
});
