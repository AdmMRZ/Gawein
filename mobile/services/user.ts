import { api } from './api';
import type { ProfileResponse } from '@/types';

export interface PaymentCard {
  id: number;
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
  billing_address: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentCardInput {
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
  billing_address: string;
}

export const userService = {
  async getProfile(): Promise<ProfileResponse> {
    return api<ProfileResponse>('/profile/');
  },

  async updateProfile(data: Record<string, unknown>): Promise<ProfileResponse> {
    return api<ProfileResponse>('/profile/', { method: 'PATCH', body: data });
  },

  async changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ detail: string }> {
    return api<{ detail: string }>('/change-password/', { method: 'POST', body: data });
  },

  async getPaymentCards(): Promise<PaymentCard[]> {
    return api<PaymentCard[]>('/payment-cards/');
  },

  async addPaymentCard(data: PaymentCardInput): Promise<PaymentCard> {
    return api<PaymentCard>('/payment-cards/', { method: 'POST', body: { ...data } });
  },

  async deletePaymentCard(id: number): Promise<void> {
    return api<void>(`/payment-cards/${id}/`, { method: 'DELETE' });
  },
};
