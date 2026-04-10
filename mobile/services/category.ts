import { api } from './api';
import type { Category } from '@/types';

export const categoryService = {
  async list(): Promise<Category[]> {
    return api<Category[]>('/categories/', { authenticated: false });
  },
};
