// services/api.js
//
// Centralised Axios client for the CivicFix mobile app.
//
// ALL API calls in the app must import from this file.
// No other file should create its own axios instance or
// import axios directly for requests.
//
// Architecture:
//   • Reads the backend URL from constants/config.js (never hardcoded here)
//   • Attaches JWT from SecureStore on every authenticated request
//   • Handles token expiry (401) globally — clears token, fires event
//   • Handles account blocking (403 ACCOUNT_BLOCKED) globally
//   • Handles network timeouts
//   • Formats multipart/form-data correctly for image uploads
// ─────────────────────────────────────────────────────────────────────

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_TIMEOUT, IS_DEV } from '../constants/config';

// ── Storage key — single constant, used everywhere ───────────────────
export const TOKEN_KEY = 'civicfix_auth_token';

// ── Token helpers ─────────────────────────────────────────────────────
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const removeToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

// ── Axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,         // ← comes from EXPO_PUBLIC_API_URL in .env
  timeout: API_TIMEOUT,     // ← comes from EXPO_PUBLIC_API_TIMEOUT in .env
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor — attach JWT ─────────────────────────────────
// SecureStore.getItemAsync is async, so we must await it.
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If SecureStore fails (e.g. device not enrolled), proceed without token.
      // The request will get a 401 and the response interceptor will handle it.
    }
    if (IS_DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — global error handling ──────────────────────
api.interceptors.response.use(
  // Success — pass through
  (response) => response,

  // Error — classify and handle
  async (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    // 401 — Token expired or invalid → sign the user out
    if (status === 401) {
      await removeToken();
      // Emit a global event that AuthContext listens for.
      // This avoids a circular import between api.js and AuthContext.jsx.
      tokenExpiredListeners.forEach((cb) => cb());
    }

    // 403 ACCOUNT_BLOCKED — citizen account is frozen
    // This is NOT a logout — just an informational error.
    // The calling component should read error.response.data for details.
    if (status === 403 && code === 'ACCOUNT_BLOCKED') {
      if (IS_DEV) {
        console.warn('[API] Account blocked:', error.response.data?.message);
      }
    }

    // Network / timeout errors — enrich the error message
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.userMessage =
          'The request timed out. Please check your internet connection and try again.';
      } else {
        error.userMessage =
          'Could not reach the CivicFix server. ' +
          'Make sure the backend is running and your EXPO_PUBLIC_API_URL is correct.';
      }
    }

    if (IS_DEV) {
      console.error('[API] Error:', status, error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

// ── Token-expiry listener registry ───────────────────────────────────
// AuthContext registers a callback here so it can clear user state
// when the interceptor detects a 401, without a circular import.
//
// Usage in AuthContext:
//   import { onTokenExpired } from '../services/api';
//   useEffect(() => onTokenExpired(() => logout()), []);
//
const tokenExpiredListeners = new Set();
export function onTokenExpired(callback) {
  tokenExpiredListeners.add(callback);
  return () => tokenExpiredListeners.delete(callback); // returns unsubscribe fn
}

// ── Multipart helper — image upload ──────────────────────────────────
// Use this when submitting a complaint with images.
// Expo ImagePicker returns { uri, mimeType, fileName } objects.
//
// Usage:
//   const formData = buildComplaintFormData({ category, description,
//     latitude, longitude, address, images });
//   await complaintService.create(formData);
//
export function buildComplaintFormData({ category, description, latitude, longitude, address, images = [] }) {
  const formData = new FormData();
  formData.append('category', category);
  formData.append('description', description);
  formData.append('latitude', String(latitude));
  formData.append('longitude', String(longitude));
  if (address) formData.append('address', address);

  images.forEach((image) => {
    // image is an Expo ImagePicker asset: { uri, mimeType, fileName }
    formData.append('images', {
      uri: image.uri,
      type: image.mimeType || 'image/jpeg',
      name: image.fileName || `photo_${Date.now()}.jpg`,
    });
  });

  return formData;
}

export default api;
