// ── User & Auth ────────────────────────────────────────────

export type UserRole = 'admin' | 'client' | 'provider';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  gender?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ClientProfile {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfile {
  id: number;
  user: User;
  bio: string;
  age: number | null;
  years_of_experience: number;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating_average: string;
  total_reviews: number;
  kota_id: string | null;
  kota_name: string | null;
  provinsi_name: string | null;
  registrations: ProviderRegistration[];
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  user: User;
  profile: ClientProfile | ProviderProfileData | null;
}

export interface ProviderProfileData {
  id: number;
  bio: string;
  age: number | null;
  years_of_experience: number;
  is_verified: boolean;
  verification_status: string;
  rating_average: string;
  total_reviews: number;
  kota_id: string | null;
  kota_name: string | null;
  provinsi_name: string | null;
}

// ── Category ───────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  description: string;
  icon_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderRegistration {
  id: number;
  category: number | null;
  category_name: string | null;
  provinsi_id: string;
  kota_id: string;
  provinsi_name: string;
  kota_name: string;
  pengalaman: string;
  tahun_pengalaman: number;
  gaji_diharapkan: string;
  created_at: string;
  updated_at: string;
}

// ── Availability ───────────────────────────────────────────

export interface Availability {
  id: number;
  provider: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// ── Booking ────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: number;
  client: number;
  client_email: string;
  provider: number;
  provider_name: string;
  registration: number;
  category_name: string;
  availability: number | null;
  status: BookingStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ── Hiring ─────────────────────────────────────────────────

export type HiringStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Hiring {
  id: number;
  client: number;
  client_email: string;
  client_name: string;
  provider: number;
  provider_name: string;
  registration: number;
  category_name: string | null;
  booking: number | null;
  agreed_price: string;
  work_date: string;
  location: string;
  notes: string;
  status: HiringStatus;
  has_review: boolean;
  created_at: string;
  updated_at: string;
}

// ── Review ─────────────────────────────────────────────────

export interface Review {
  id: number;
  hiring: number;
  client: number;
  client_email: string;
  client_name: string;
  provider: number;
  provider_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// ── Search Params ──────────────────────────────────────────

export interface SearchParams {
  keyword?: string;
  category?: number;
  kota_id?: string;
  provinsi_id?: string;
  min_price?: number;
  max_price?: number;
  gender?: string;
  min_age?: number;
  max_age?: number;
  experience?: number;
  rating?: number;
  verified_only?: boolean;
  ordering?: string;
}
