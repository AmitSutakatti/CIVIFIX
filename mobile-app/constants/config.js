// constants/config.js
//
// SINGLE SOURCE OF TRUTH for all app-wide configuration.
//
// HOW IT WORKS
// ─────────────────────────────────────────────────────────
// Expo SDK 49+ automatically reads .env files at startup.
// Only variables prefixed with EXPO_PUBLIC_ are embedded
// into the app bundle — they are safe for client-side use.
//
// File loading priority (highest → lowest):
//   .env.local
//   .env.<NODE_ENV>.local  (e.g. .env.development.local)
//   .env.<NODE_ENV>        (e.g. .env.development)
//   .env
//
// NEVER import this file in backend code.
// NEVER put secrets (JWT_SECRET, DB passwords, API keys)
// in EXPO_PUBLIC_ variables — they end up in the app bundle.
//
// TO CHANGE THE BACKEND URL
// ─────────────────────────────────────────────────────────
// Edit EXPO_PUBLIC_API_URL in your .env file.
// Then restart the Metro bundler with cache clear:
//   npx expo start --clear
// ─────────────────────────────────────────────────────────

// ── Core API URL ──────────────────────────────────────────
// Set in .env   →   EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api
// Set in .env.production  →  EXPO_PUBLIC_API_URL=https://api.yourcivicfix.com/api
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ── Uploads base URL ──────────────────────────────────────
// Used ONLY for relative image paths (/uploads/filename.jpg).
// Full CDN URLs (https://ik.imagekit.io/...) do not use this.
// Set in .env  →  EXPO_PUBLIC_UPLOADS_BASE_URL=http://192.168.x.x:5000
export const UPLOADS_BASE_URL = process.env.EXPO_PUBLIC_UPLOADS_BASE_URL;

// ── App environment ───────────────────────────────────────
// 'development' | 'production'
export const APP_ENV = process.env.EXPO_PUBLIC_ENV || 'development';

// ── Request timeout (ms) ─────────────────────────────────
// Default: 15 000 ms (15 s). Increase on slow/mobile networks.
export const API_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000;

// ── Derived flags ─────────────────────────────────────────
export const IS_DEV = APP_ENV === 'development';
export const IS_PROD = APP_ENV === 'production';

// ── Guard — fail fast if API_URL is missing ───────────────
// This surfaces a clear error during development rather than
// a cryptic network failure deep inside a component.
if (!API_URL) {
  throw new Error(
    '[CivicFix Config] EXPO_PUBLIC_API_URL is not set.\n' +
    'Open mobile-app/.env and set:\n' +
    '  EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api\n' +
    'Then restart the Metro bundler: npx expo start --clear'
  );
}

// ── Helper — resolve image URLs ───────────────────────────
// The backend stores images in two patterns:
//   1. Full CDN URL:    "https://ik.imagekit.io/egsx9gcvr/..."
//   2. Relative path:  "/uploads/filename.jpg"
//
// This function normalises both into a usable absolute URL.
//
// Usage:
//   <Image source={{ uri: resolveImageUrl(image.url) }} />
//
export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  // Already an absolute URL (CDN or external)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Relative path — prefix with the uploads base URL
  const base = UPLOADS_BASE_URL || API_URL.replace('/api', '');
  return `${base}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

// ── Complaint categories ───────────────────────────────────
// Exact enum values from backend/models/Complaint.js
// Defined here so the mobile app never guesses or hardcodes them.
export const COMPLAINT_CATEGORIES = [
  { value: 'road',        label: 'Road Issues',         icon: '🛣️',  priority: 'medium' },
  { value: 'drainage',    label: 'Drainage Problems',   icon: '🌊',  priority: 'high'   },
  { value: 'electricity', label: 'Electricity Issues',  icon: '⚡',  priority: 'high'   },
  { value: 'garbage',     label: 'Garbage Collection',  icon: '🗑️',  priority: 'medium' },
  { value: 'water',       label: 'Water Supply',        icon: '💧',  priority: 'high'   },
  { value: 'streetlight', label: 'Street Light',        icon: '💡',  priority: 'medium' },
  { value: 'parks',       label: 'Parks & Recreation',  icon: '🌳',  priority: 'low'    },
  { value: 'other',       label: 'Other',               icon: '📋',  priority: 'low'    },
];

// ── Complaint statuses ────────────────────────────────────
// Exact enum values + display metadata from Complaint.js
export const COMPLAINT_STATUSES = [
  { value: 'Submitted',         label: 'Submitted',          color: '#3B82F6', step: 1 },
  { value: 'Verified',          label: 'Verified',           color: '#8B5CF6', step: 2 },
  { value: 'Assigned',          label: 'Assigned',           color: '#F59E0B', step: 3 },
  { value: 'In-progress',       label: 'In Progress',        color: '#F97316', step: 4 },
  { value: 'Field-verification',label: 'Field Verification', color: '#6366F1', step: 3 },
  { value: 'Completed',         label: 'Completed',          color: '#10B981', step: 5 },
  { value: 'Closed',            label: 'Closed',             color: '#6B7280', step: 6 },
];

export function getStatusMeta(statusValue) {
  return (
    COMPLAINT_STATUSES.find((s) => s.value === statusValue) || {
      value: statusValue,
      label: statusValue,
      color: '#6B7280',
      step: 0,
    }
  );
}

export function getCategoryMeta(categoryValue) {
  return (
    COMPLAINT_CATEGORIES.find((c) => c.value === categoryValue) || {
      value: categoryValue,
      label: categoryValue,
      icon: '📋',
      priority: 'medium',
    }
  );
}

// ── Reward / demerit thresholds ───────────────────────────
// Mirror of REVIEW_CONFIG in backend/utils/complaintReview.js
// Used ONLY for display purposes — never for calculation.
// All actual calculations happen server-side.
export const REWARD_CONFIG = {
  registrationBonus: 20,     // points on first registration
  verifiedReward:    5,      // points when complaint is verified
  fakeRewardPenalty: 3,      // points deducted per fake complaint
  demeritsPerFake:   3,      // demerit points per fake complaint
  blockThreshold:    3,      // fakeComplaintCount that triggers account block
  blockDays:         7,      // days account is blocked
};

// ── Pagination defaults ───────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;

// ── Notification polling interval (ms) ───────────────────
// How often the app checks for new notifications.
// 30 seconds in development, 60 seconds in production.
export const NOTIFICATION_POLL_INTERVAL = IS_DEV ? 30_000 : 60_000;
