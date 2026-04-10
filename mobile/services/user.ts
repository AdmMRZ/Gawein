import { api } from './api';
import type { ProfileResponse } from '@/types';

export const userService = {
  async getProfile(): Promise<ProfileResponse> {
    return api<ProfileResponse>('/profile/');
  },

  async updateProfile(data: Record<string, unknown>): Promise<ProfileResponse> {
    return api<ProfileResponse>('/profile/', { method: 'PATCH', body: data });
  },
};
