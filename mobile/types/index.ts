// ── User & Auth ────────────────────────────────────────────

export type UserRole = 'admin' | 'client' | 'provider';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
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
  phone: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfile {
  id: number;
  user: User;
  bio: string;
  gender: string;
  age: number | null;
  location: string;
  years_of_experience: number;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating_average: string;
  total_reviews: number;
  services: Service[];
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
  gender: string;
  age: number | null;
  location: string;
  years_of_experience: number;
  is_verified: boolean;
  verification_status: string;
  rating_average: string;
  total_reviews: number;
}

// ── Category ───────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Service ────────────────────────────────────────────────

export interface Service {
  id: number;
  provider: number;
  category: number | null;
  category_name: string | null;
  provider_name: string;
  title: string;
  description: string;
  price: string;
  location: string;
  service_scope: string;
  service_limitations: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateData {
  category?: number;
  title: string;
  description: string;
  price: number;
  location: string;
  service_scope?: string;
  service_limitations?: string;
  is_active?: boolean;
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
  service: number;
  service_title: string;
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
  service: number;
  service_title: string;
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
  location?: string;
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
