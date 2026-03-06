import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthState, Role } from '../types';

interface AuthContextType {
  user: AuthState | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isValidator: boolean;
  isDonor: boolean;
  isPartner: boolean;
  loginSuccess: (userData: AuthState & { token: string }) => void;
  logout: () => void;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthState | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // ─── Init from localStorage ─────────────────────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('ihsan_token');
    const savedUser = localStorage.getItem('ihsan_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('ihsan_token');
        localStorage.removeItem('ihsan_user');
      }
    }
  }, []);

  const loginSuccess = useCallback((userData: AuthState & { token: string }) => {
    const { token: tok, ...state } = userData;
    localStorage.setItem('ihsan_token', tok);
    localStorage.setItem('ihsan_user', JSON.stringify(state));
    setToken(tok);
    setUser(state);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ihsan_token');
    localStorage.removeItem('ihsan_user');
    setToken(null);
    setUser(null);
  }, []);

  const getDashboardPath = useCallback((): string => {
    switch (user?.role as Role) {
      case 'DONNEUR':    return '/catalog';
      case 'VALIDATEUR': return '/validator';
      case 'PARTENAIRE': return '/partner';
      case 'ADMIN':      return '/admin';
      default:           return '/catalog';
    }
  }, [user]);

  const isAdmin     = user?.role === 'ADMIN';
  const isValidator = user?.role === 'VALIDATEUR';
  const isDonor     = user?.role === 'DONNEUR';
  const isPartner   = user?.role === 'PARTENAIRE';

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!token,
      isAdmin, isValidator, isDonor, isPartner,
      loginSuccess, logout, getDashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
