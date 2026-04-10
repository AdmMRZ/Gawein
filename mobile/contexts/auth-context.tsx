import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getAccessToken, clearTokens } from '@/services/api';
import { authService } from '@/services/auth';
import { userService } from '@/services/user';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // ── Bootstrap: check tokens on mount ──────────────────
  const bootstrap = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const profileRes = await userService.getProfile();
        setState({
          user: profileRes.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      await clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // ── Actions ───────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    setState({
      user: result.user,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const register = useCallback(async (data: Record<string, unknown>) => {
    const result = await authService.register(data as any);
    setState({
      user: result.user,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshProfile = useCallback(async () => {
    const profileRes = await userService.getProfile();
    setState((prev) => ({
      ...prev,
      user: profileRes.user,
    }));
  }, []);

  return (
    <AuthContext value={{
      ...state,
      login,
      register,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext>
  );
}
