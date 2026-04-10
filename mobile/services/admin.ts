import { api } from './api';
import type { ProviderProfile } from '@/types';

export const adminService = {
  async listPendingProviders(): Promise<ProviderProfile[]> {
    return api<ProviderProfile[]>('/admin/providers/pending/');
  },

  async verifyProvider(id: number): Promise<ProviderProfile> {
    return api<ProviderProfile>(`/admin/providers/${id}/verify/`, { method: 'PATCH' });
  },

  async rejectProvider(id: number): Promise<ProviderProfile> {
    return api<ProviderProfile>(`/admin/providers/${id}/reject/`, { method: 'PATCH' });
  },
};
