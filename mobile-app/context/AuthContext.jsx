// context/AuthContext.jsx
//
// Global authentication state for the CivicFix mobile app.
//
// Provides:
//   user          — the logged-in user object (null if not authenticated)
//   isAuthenticated — boolean
//   isLoading     — true while checking stored token on first launch
//   login()       — calls POST /api/auth/login, stores token securely
//   register()    — calls POST /api/auth/signup, stores token securely
//   logout()      — clears token from SecureStore + resets state
//   refreshUser() — re-fetches /api/auth/me (call after profile updates)
//
// Token storage: expo-secure-store (encrypted on-device keychain)
// Token is attached to every request by the Axios interceptor in services/api.js

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onTokenExpired, getToken, setToken, removeToken } from '../services/api';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true during initial token check

  // ── On mount: check for a stored token ──────────────────
  useEffect(() => {
    checkStoredSession();
  }, []);

  // ── Listen for 401 token-expiry events from Axios ───────
  useEffect(() => {
    const unsubscribe = onTokenExpired(() => {
      setUser(null);
    });
    return unsubscribe;
  }, []);

  // ── Restore session from SecureStore ────────────────────
  const checkStoredSession = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      // Token exists — verify it by fetching /api/auth/me
      const result = await authService.getMe();
      if (result.success) {
        setUser(result.user);
      } else {
        // Token is invalid/expired — clear it
        await removeToken();
      }
    } catch {
      await removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        await setToken(result.token);
        setUser(result.user);
        return { success: true, user: result.user };
      }
      // Account blocked (403)
      if (result.blocked) {
        return {
          success: false,
          blocked: true,
          message: result.message,
          blockedUntil: result.blockedUntil,
          demeritPoints: result.demeritPoints,
        };
      }
      return { success: false, message: result.message };
    } catch (error) {
      const msg = error.userMessage || error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message: msg };
    }
  }, []);

  // ── Register ─────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    try {
      const result = await authService.signup(userData);
      if (result.success) {
        await setToken(result.token);
        setUser(result.user);
        return {
          success: true,
          user: result.user,
          registrationBonus: result.registrationBonus,
          message: result.message,
        };
      }
      return { success: false, message: result.message };
    } catch (error) {
      const msg = error.userMessage || error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message: msg };
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  // ── Refresh user (call after profile edits) ──────────────
  const refreshUser = useCallback(async () => {
    try {
      const result = await authService.getMe();
      if (result.success) setUser(result.user);
    } catch {
      // Silently fail — user stays logged in with stale data
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
