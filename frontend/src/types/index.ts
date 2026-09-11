/**
 * Shared domain types mirroring the FastAPI backend's Pydantic schemas.
 * Keeping these centralized means every API call and component agrees
 * on one shape for each entity.
 */

export type UserRole = 'user' | 'manager';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  login: string;
  role: UserRole;
  created_at: string;
}

export type ListingStatus = 'pending' | 'confirmed' | 'unavailable';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  name: string;
  date: string;
  location: string;
  price: string;
  description: string | null;
  confirmation_status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  booking_id: string;
  status: ReservationStatus;
  guests: number;
  total_price: string;
  created_at: string;
  booking: Booking;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface BookingFilters {
  location?: string;
  date_from?: string;
  date_to?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  login: string;
  password: string;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface PasswordChangePayload {
  old_password: string;
  new_password: string;
}

export interface BookingCreatePayload {
  name: string;
  date: string;
  location: string;
  price: number;
  description?: string;
  confirmation_status?: ListingStatus;
}

export type BookingUpdatePayload = Partial<BookingCreatePayload>;

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  detail: string | ApiErrorDetail[];
  errors?: ApiErrorDetail[];
}
