import type { RegisterData } from '@/services/auth';

export interface LoginFormValues {
  email: string;
  password: string;
}

export type LoginFieldName = keyof LoginFormValues;
export type LoginErrors = Partial<Record<LoginFieldName, string>>;

export interface RegisterFormValues {
  role: 'client' | 'provider';
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  location: string;
  bio: string;
}

export type RegisterFieldName = keyof RegisterFormValues;
export type RegisterErrors = Partial<Record<RegisterFieldName, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._]{4,30}$/;

function hasLetterAndNumber(value: string): boolean {
  return /[a-zA-Z]/.test(value) && /\d/.test(value);
}

function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const hasPlusPrefix = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  return `${hasPlusPrefix ? '+' : ''}${digitsOnly}`;
}

function isPhoneLengthValid(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

export function validateLoginForm(values: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};

  const email = values.email.trim();
  const password = values.password;

  if (!email) {
    errors.email = 'Email wajib diisi.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Format email belum valid.';
  }

  if (!password) {
    errors.password = 'Password wajib diisi.';
  }

  return errors;
}

export function validateRegisterForm(values: RegisterFormValues): RegisterErrors {
  const errors: RegisterErrors = {};

  const email = values.email.trim();
  const username = values.username.trim();
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const phone = values.phone.trim();
  const location = values.location.trim();
  const bio = values.bio.trim();

  if (!email) {
    errors.email = 'Email wajib diisi.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Format email belum valid.';
  }

  if (!username) {
    errors.username = 'Username wajib diisi.';
  } else if (!usernameRegex.test(username)) {
    errors.username = 'Gunakan 4-30 karakter: huruf, angka, titik, atau underscore.';
  }

  if (!firstName) {
    errors.firstName = 'Nama depan wajib diisi.';
  } else if (firstName.length < 2) {
    errors.firstName = 'Nama depan minimal 2 karakter.';
  }

  if (!lastName) {
    errors.lastName = 'Nama belakang wajib diisi.';
  } else if (lastName.length < 2) {
    errors.lastName = 'Nama belakang minimal 2 karakter.';
  }

  if (!values.password) {
    errors.password = 'Password wajib diisi.';
  } else if (values.password.length < 8) {
    errors.password = 'Password minimal 8 karakter.';
  } else if (!hasLetterAndNumber(values.password)) {
    errors.password = 'Password harus mengandung huruf dan angka.';
  }

  if (!values.passwordConfirm) {
    errors.passwordConfirm = 'Konfirmasi password wajib diisi.';
  } else if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = 'Konfirmasi password tidak sama.';
  }

  if (phone && !isPhoneLengthValid(phone)) {
    errors.phone = 'Nomor telepon harus 9-15 digit.';
  }

  if (location && location.length < 3) {
    errors.location = 'Lokasi minimal 3 karakter.';
  }

  if (values.role === 'provider') {
    if (!bio) {
      errors.bio = 'Bio wajib diisi untuk akun penyedia jasa.';
    } else if (bio.length < 20) {
      errors.bio = 'Bio minimal 20 karakter agar profil lebih jelas.';
    }
  }

  return errors;
}

export function getTouchedFieldErrors<T extends string>(
  allErrors: Partial<Record<T, string>>,
  touchedFields: Partial<Record<T, boolean>>,
): Partial<Record<T, string>> {
  const filtered: Partial<Record<T, string>> = {};

  (Object.keys(allErrors) as T[]).forEach((key) => {
    const error = allErrors[key];
    if (touchedFields[key] && typeof error === 'string' && error.trim()) {
      filtered[key] = error;
    }
  });

  return filtered;
}

export function extractApiErrorMessage(
  data: Record<string, unknown> | undefined,
  fallback: string,
): string {
  if (!data) return fallback;

  const detail = data.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  const segments: string[] = [];
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'detail' || value === null || value === undefined) return;

    if (Array.isArray(value)) {
      const joined = value.map((item) => String(item)).join(' ');
      if (joined.trim()) segments.push(joined);
      return;
    }

    if (typeof value === 'string' && value.trim()) {
      segments.push(value);
      return;
    }

    if (typeof value === 'object') {
      const nested = Object.values(value as Record<string, unknown>)
        .flatMap((item) => (Array.isArray(item) ? item : [item]))
        .map((item) => String(item))
        .join(' ')
        .trim();
      if (nested) segments.push(nested);
    }
  });

  return segments.length > 0 ? segments.join(' ') : fallback;
}

function firstErrorMessage(value: unknown): string | undefined {
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return undefined;
}

export function mapLoginApiErrors(data: Record<string, unknown> | undefined): LoginErrors {
  if (!data) return {};

  return {
    email: firstErrorMessage(data.email),
    password: firstErrorMessage(data.password),
  };
}

export function mapRegisterApiErrors(
  data: Record<string, unknown> | undefined,
): RegisterErrors {
  if (!data) return {};

  return {
    email: firstErrorMessage(data.email),
    username: firstErrorMessage(data.username),
    firstName: firstErrorMessage(data.first_name),
    lastName: firstErrorMessage(data.last_name),
    password: firstErrorMessage(data.password),
    passwordConfirm: firstErrorMessage(data.password_confirm),
    phone: firstErrorMessage(data.phone),
    location: firstErrorMessage(data.location),
    bio: firstErrorMessage(data.bio),
  };
}

export function buildRegisterPayload(values: RegisterFormValues): RegisterData {
  const payload: RegisterData = {
    email: values.email.trim().toLowerCase(),
    username: values.username.trim(),
    password: values.password,
    password_confirm: values.passwordConfirm,
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    role: values.role,
  };

  const phone = normalizePhoneNumber(values.phone);
  if (phone) payload.phone = phone;

  const location = values.location.trim();
  if (location) payload.location = location;

  if (values.role === 'provider') {
    const bio = values.bio.trim();
    if (bio) payload.bio = bio;
  }

  return payload;
}
