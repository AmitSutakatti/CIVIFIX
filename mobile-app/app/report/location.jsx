import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, LocateFixed, MapPin } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import StepProgress from '../../components/report/StepProgress';
import { readCurrentLocation } from '../../services/deviceLocation';
import { reverseGeocode } from '../../services/reverseGeocode';
import { updateComplaintDraft, useComplaintDraft } from '../../state/complaintDraft';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

function savedCoordinate(draft) {
  if (!Number.isFinite(draft.latitude) || !Number.isFinite(draft.longitude)) return null;
  return { latitude: draft.latitude, longitude: draft.longitude };
}

export default function ComplaintLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();
  const draft = useComplaintDraft();
  const restored = savedCoordinate(draft);
  const hasSavedLocation = restored != null;
  const [coordinate, setCoordinate] = useState(restored);
  const [locating, setLocating] = useState(!hasSavedLocation);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [address, setAddress] = useState(draft.address || '');
  const [addressMessage, setAddressMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    if (hasSavedLocation) return undefined;

    let active = true;
    const loadCurrentLocation = async () => {
      try {
        const result = await readCurrentLocation();
        if (!active) return;
        if (result.ok) {
          setCoordinate(result.coordinate);
        } else {
          setLocationMessage(result.message);
        }
      } catch {
        if (active) {
          setLocationMessage('Your location could not be read. Check location services and try again.');
        }
      } finally {
        if (active) setLocating(false);
      }
    };

    loadCurrentLocation();
    return () => {
      active = false;
    };
  }, [hasSavedLocation]);

  const requestCurrentLocation = async () => {
    setLocating(true);
    setLocationMessage('');
    try {
      const result = await readCurrentLocation();
      if (!result.ok) {
        setLocationMessage(result.message);
        return;
      }
      setCoordinate(result.coordinate);
      setAddress('');
      setAddressMessage('');
      updateComplaintDraft({
        latitude: result.coordinate.latitude,
        longitude: result.coordinate.longitude,
        address: null,
      });

      setResolvingAddress(true);
      const addressResult = await reverseGeocode(
        result.coordinate.latitude,
        result.coordinate.longitude
      );
      if (addressResult.ok) {
        setAddress(addressResult.address);
        updateComplaintDraft({
          latitude: result.coordinate.latitude,
          longitude: result.coordinate.longitude,
          address: addressResult.address,
        });
      } else {
        setAddressMessage(addressResult.message);
      }
    } catch {
      setAddressMessage('The address could not be retrieved. Your coordinates are still available; try again.');
    } finally {
      setLocating(false);
      setResolvingAddress(false);
    }
  };

  const confirmLocation = () => {
    if (!coordinate) return;
    updateComplaintDraft({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      address: address || null,
    });
    router.push('/report/photos');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back">
          <ArrowLeft size={20} color={COLORS.gray900} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Select Complaint Location</Text>
          {draft.title ? <Text style={styles.headerMeta} numberOfLines={1}>{draft.title}</Text> : null}
        </View>
      </View>
      <StepProgress step={3} total={4} label="Location" />

      <View style={styles.content}>
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            {locating ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <LocateFixed size={32} color={COLORS.primary} />
            )}
          </View>
          <Text style={styles.locationTitle}>
            {locating ? 'Finding your location...' : coordinate ? 'Current location found' : 'Location unavailable'}
          </Text>
          <Text style={styles.coordinates}>
            {coordinate
              ? `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`
              : 'Allow location access to get your coordinates.'}
          </Text>
          {resolvingAddress ? <Text style={styles.addressStatus}>Finding address...</Text> : null}
          {address ? <Text style={styles.address}>{address}</Text> : null}
          {locationMessage ? <Text style={styles.warning}>{locationMessage}</Text> : null}
          {addressMessage ? <Text style={styles.warning}>{addressMessage}</Text> : null}
        </View>

        <Pressable
          style={[styles.secondary, (locating || resolvingAddress) && styles.disabled]}
          onPress={requestCurrentLocation}
          disabled={locating || resolvingAddress}
        >
          <LocateFixed size={18} color={COLORS.primary} />
          <Text style={styles.secondaryText}>Use My Current Location</Text>
        </Pressable>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          style={[styles.primary, (!coordinate || locating || resolvingAddress) && styles.disabled]}
          disabled={!coordinate || locating || resolvingAddress}
          onPress={confirmLocation}
        >
          <MapPin size={18} color={COLORS.white} />
          <Text style={styles.primaryText}>Confirm Location</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
  headerMeta: { marginTop: 2, color: COLORS.gray500, fontSize: 13 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.base,
    gap: SPACING.md,
  },
  locationCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
  },
  locationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  locationTitle: { marginTop: SPACING.md, fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
  coordinates: { marginTop: SPACING.sm, color: COLORS.gray700, fontWeight: '600', textAlign: 'center' },
  addressStatus: { marginTop: SPACING.sm, color: COLORS.gray500, textAlign: 'center' },
  address: { marginTop: SPACING.sm, color: COLORS.gray700, lineHeight: 20, textAlign: 'center' },
  warning: { marginTop: SPACING.sm, color: COLORS.error, lineHeight: 20, textAlign: 'center' },
  secondary: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryText: { color: COLORS.primary, fontWeight: '700' },
  footer: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  primary: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  primaryText: { color: COLORS.white, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
