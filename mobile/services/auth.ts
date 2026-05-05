import { api, setTokens, clearTokens, getRefreshToken } from './api';
import type { AuthResponse } from '@/types';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  role: 'client' | 'provider';
  phone?: string;
  bio?: string;
  gender?: string;
  age?: number;
  years_of_experience?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const result = await api<AuthResponse>('/register/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
      authenticated: false,
    });
    await setTokens(result.tokens.access, result.tokens.refresh);
    return result;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const result = await api<AuthResponse>('/login/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
      authenticated: false,
    });
    await setTokens(result.tokens.access, result.tokens.refresh);
    return result;
  },

  async logout(): Promise<void> {
    const refresh = await getRefreshToken();
    try {
      await api('/logout/', {
        method: 'POST',
        body: { refresh },
      });
    } catch {
      // Logout should always clear tokens locally
    }
    await clearTokens();
  },

  async changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> {
    await api('/change-password/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    });
  },
};
