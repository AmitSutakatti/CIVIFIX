const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const REQUEST_INTERVAL_MS = 1100;
const REQUEST_TIMEOUT_MS = 12000;
const addressCache = new Map();
let nextRequestAt = 0;
let requestQueue = Promise.resolve();

function coordinateKey(latitude, longitude) {
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAddress(latitude, longitude) {
  const url = `${REVERSE_URL}?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CivicFix-Mobile/1.0',
      },
    });
    if (!response.ok) {
      return { ok: false, message: 'The address service is unavailable. Your coordinates are still available; try again.' };
    }

    const body = await response.json();
    const address = typeof body?.display_name === 'string' ? body.display_name.trim() : '';
    if (!address) {
      return { ok: false, message: 'No address was found for this location. Your coordinates are still available.' };
    }
    return { ok: true, address };
  } catch (error) {
    if (error?.name === 'AbortError') {
      return { ok: false, message: 'Finding the address took too long. Your coordinates are still available; try again.' };
    }
    return { ok: false, message: 'The address could not be retrieved. Your coordinates are still available; try again.' };
  } finally {
    clearTimeout(timeout);
  }
}

export function reverseGeocode(latitude, longitude) {
  const key = coordinateKey(latitude, longitude);
  if (addressCache.has(key)) {
    return Promise.resolve({ ok: true, address: addressCache.get(key), cached: true });
  }

  const task = requestQueue.then(async () => {
    if (addressCache.has(key)) {
      return { ok: true, address: addressCache.get(key), cached: true };
    }

    const delay = nextRequestAt - Date.now();
    if (delay > 0) await wait(delay);
    nextRequestAt = Date.now() + REQUEST_INTERVAL_MS;
    const result = await fetchAddress(latitude, longitude);
    if (result.ok) addressCache.set(key, result.address);
    return { ...result, cached: false };
  });

  requestQueue = task.then(() => undefined, () => undefined);
  return task;
}
