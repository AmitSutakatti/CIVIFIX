import * as Location from 'expo-location';

const GPS_TIMEOUT_MS = 15000;

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error('Location request timed out');
      error.code = 'TIMEOUT';
      reject(error);
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export async function readCurrentLocation() {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return {
        ok: false,
        code: 'SERVICES_DISABLED',
        message: 'Location services are turned off. Turn them on, then try again.',
      };
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      const blocked = permission.canAskAgain === false;
      return {
        ok: false,
        code: blocked ? 'PERMISSION_BLOCKED' : 'PERMISSION_DENIED',
        message: blocked
          ? 'Location permission is blocked. Enable it in system settings, then try again.'
          : 'Location permission was denied. Allow location access to get your coordinates.',
      };
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      GPS_TIMEOUT_MS
    );
    const latitude = position?.coords?.latitude;
    const longitude = position?.coords?.longitude;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return {
        ok: false,
        code: 'UNAVAILABLE',
        message: 'GPS coordinates are unavailable. Try again.',
      };
    }
    return { ok: true, coordinate: { latitude, longitude } };
  } catch (error) {
    if (error?.code === 'TIMEOUT') {
      return {
        ok: false,
        code: 'TIMEOUT',
        message: 'Finding your location took too long. Try again.',
      };
    }
    return {
      ok: false,
      code: 'UNAVAILABLE',
      message: 'Your location could not be read. Check location services and try again.',
    };
  }
}
