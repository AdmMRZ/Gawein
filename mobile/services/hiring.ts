import { api } from './api';
import type { Hiring } from '@/types';

export const hiringService = {
  async create(data: {
    booking_id: number;
    agreed_price: number;
    work_date: string;
    location?: string;
    notes?: string;
  }, options?: { idempotencyKey?: string }): Promise<Hiring> {
    return api<Hiring>('/hirings/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
      idempotencyKey: options?.idempotencyKey,
    });
  },

  async list(): Promise<Hiring[]> {
    return api<Hiring[]>('/hirings/');
  },

  async getDetail(id: number): Promise<Hiring> {
    return api<Hiring>(`/hirings/${id}/`);
  },

  async updateStatus(id: number, status: string): Promise<Hiring> {
    return api<Hiring>(`/hirings/${id}/status/`, {
      method: 'PATCH',
      body: { status },
    });
  },
};
