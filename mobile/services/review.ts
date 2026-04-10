import { api } from './api';
import type { Review } from '@/types';

export const reviewService = {
  async create(data: {
    hiring_id: number;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    return api<Review>('/reviews/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    });
  },

  async list(providerId?: number): Promise<Review[]> {
    return api<Review[]>('/reviews/', {
      authenticated: false,
      params: providerId ? { provider: providerId } : undefined,
    });
  },

  async getDetail(id: number): Promise<Review> {
    return api<Review>(`/reviews/${id}/`, { authenticated: false });
  },
};
