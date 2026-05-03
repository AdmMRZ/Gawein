import { api } from './api';
import type { Availability, Booking } from '@/types';

export const schedulingService = {
  // ── Availability (Provider) ────────────────────────────
  async listAvailability(): Promise<Availability[]> {
    return api<Availability[]>('/availability/');
  },

  async createAvailability(data: {
    date: string;
    start_time: string;
    end_time: string;
  }): Promise<Availability> {
    return api<Availability>('/availability/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    });
  },

  async updateAvailability(
    id: number,
    data: Partial<{ date: string; start_time: string; end_time: string }>,
  ): Promise<Availability> {
    return api<Availability>(`/availability/${id}/`, {
      method: 'PUT',
      body: data as unknown as Record<string, unknown>,
    });
  },

  async deleteAvailability(id: number): Promise<void> {
    return api(`/availability/${id}/`, { method: 'DELETE' });
  },

  // ── Booking ────────────────────────────────────────────
  async listBookings(): Promise<Booking[]> {
    return api<Booking[]>('/bookings/');
  },

  async createBooking(data: {
    service: number;
    availability?: number;
    notes?: string;
  }, options?: { idempotencyKey?: string }): Promise<Booking> {
    return api<Booking>('/bookings/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
      idempotencyKey: options?.idempotencyKey,
    });
  },

  async getBooking(id: number): Promise<Booking> {
    return api<Booking>(`/bookings/${id}/`);
  },

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    return api<Booking>(`/bookings/${id}/`, {
      method: 'PATCH',
      body: { status },
    });
  },
};
