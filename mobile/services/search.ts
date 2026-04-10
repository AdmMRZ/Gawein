import { api } from './api';
import type { ProviderProfile, SearchParams } from '@/types';

export const searchService = {
  async searchProviders(params: SearchParams): Promise<ProviderProfile[]> {
    return api<ProviderProfile[]>('/search/providers/', {
      authenticated: false,
      params: params as unknown as Record<string, string | number | boolean | undefined>,
    });
  },
};
