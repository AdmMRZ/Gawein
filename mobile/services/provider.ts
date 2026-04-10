import { api } from './api';
import type { ProviderProfile, Service, ServiceCreateData } from '@/types';

export const providerService = {
  async list(): Promise<ProviderProfile[]> {
    return api<ProviderProfile[]>('/providers/', { authenticated: false });
  },

  async getDetail(id: number): Promise<ProviderProfile> {
    return api<ProviderProfile>(`/providers/${id}/`, { authenticated: false });
  },

  // ── Provider's own services ────────────────────────────
  async listMyServices(): Promise<Service[]> {
    return api<Service[]>('/providers/services/');
  },

  async getService(id: number): Promise<Service> {
    return api<Service>(`/providers/services/${id}/`);
  },

  async createService(data: ServiceCreateData): Promise<Service> {
    return api<Service>('/providers/services/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    });
  },

  async updateService(id: number, data: Partial<ServiceCreateData>): Promise<Service> {
    return api<Service>(`/providers/services/${id}/`, {
      method: 'PATCH',
      body: data as unknown as Record<string, unknown>,
    });
  },

  async deleteService(id: number): Promise<void> {
    return api(`/providers/services/${id}/`, { method: 'DELETE' });
  },
};
