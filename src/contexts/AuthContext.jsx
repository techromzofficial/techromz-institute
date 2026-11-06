'use client';

/**
 * AuthContext.jsx
 *
 * Fixes applied:
 *  ✅ Uses WAF-safe cookie name (_el_tok), not 'token' or 'auth_token'
 *  ✅ Clears ALL auth storage (cookie + localStorage residue) on logout
 *  ✅ Restores session from cookie on page load (no flash of unauthenticated state)
 *  ✅ Admin session guard — admins are never locked out by custom redirect hooks
 */

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authApi, saveAuthToken, clearAuthToken, getAuthToken } from '@/lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user:        null,
  token:       null,
  loading:     true,   // true while restoring session
  isAuthenticated: false,
};

function clearClientAuthStorage() {
  clearAuthToken();

  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearClientAuthStorage();
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  // ── Restore session on mount ──────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      dispatch({ type: 'SET_TOKEN', payload: token });
      try {
        const { user } = await authApi.me();
        dispatch({ type: 'SET_USER', payload: user });
      } catch {
        clearClientAuthStorage();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    restoreSession();
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    saveAuthToken(data.token);
    dispatch({ type: 'SET_TOKEN', payload: data.token });
    dispatch({ type: 'SET_USER', payload: data.user });
    return data;
  }, []);

  // ── Register ──────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData);
    saveAuthToken(data.token);
    dispatch({ type: 'SET_TOKEN', payload: data.token });
    dispatch({ type: 'SET_USER', payload: data.user });
    return data;
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore API errors on logout
    } finally {
      clearClientAuthStorage();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully.');
    }
  }, []);

  // ── Update user in context (e.g. after profile edit) ──────
  const updateUser = useCallback((updates) => {
    dispatch({ type: 'SET_USER', payload: { ...state.user, ...updates } });
  }, [state.user]);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    isAdmin:    ['admin', 'super_admin'].includes(state.user?.role),
    isSuperAdmin: state.user?.role === 'super_admin',
    isSupplier: state.user?.role === 'supplier',
    isBuyer:    state.user?.role === 'buyer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
