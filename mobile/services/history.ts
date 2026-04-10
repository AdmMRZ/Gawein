import { api } from './api';
import type { Hiring } from '@/types';

export const historyService = {
  async list(): Promise<Hiring[]> {
    return api<Hiring[]>('/history/');
  },

  async getDetail(id: number): Promise<Hiring> {
    return api<Hiring>(`/history/${id}/`);
  },
};
