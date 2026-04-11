import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const envBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

function getExpoHostBaseUrl(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri
    ?? (Constants as any).manifest2?.extra?.expoClient?.hostUri
    ?? (Constants as any).manifest?.debuggerHost
    ?? '';

  if (!hostUri) return null;

  const host = hostUri.split(':')[0]?.trim();
  if (!host) return null;

  return `http://${host}:8000`;
}

const platformFallbackBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const expoHostBaseUrl = getExpoHostBaseUrl();

if (!envBaseUrl) {
  console.warn(
    `EXPO_PUBLIC_API_URL is not set. Using detected fallback: ${expoHostBaseUrl || platformFallbackBaseUrl}`,
  );
}

const BASE_URL = (envBaseUrl || expoHostBaseUrl || platformFallbackBaseUrl).replace(/\/+$/, '');
const API_URL = `${BASE_URL}/api`;

const TOKEN_KEY = 'gawein_access_token';
const REFRESH_KEY = 'gawein_refresh_token';

export const API_BASE_URL = BASE_URL;

// ── Token Management ───────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_KEY);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

// ── API Error ──────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>) {
    let message = (data?.detail as string) || `Request failed with status ${status}`;
    if (typeof message === 'string' && (message.trim().toLowerCase().startsWith('<!doctype html>') || message.trim().toLowerCase().startsWith('<html'))) {
      message = `Server Error HTTP ${status}: Terjadi masalah pada server.`;
    }
    
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  url: string;

  constructor(url: string, cause?: unknown) {
    super(`Tidak dapat terhubung ke server (${url}). Pastikan Django berjalan dan bisa diakses dari device Expo.`);
    this.name = 'NetworkError';
    this.url = url;
    if (cause) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

// ── Base Fetch Wrapper ─────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown>;
  authenticated?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, authenticated = true, params } = options;

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Execute request
  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new NetworkError(url, error);
  }

  // Handle no-content responses
  if (response.status === 204) {
    return undefined as T;
  }

  const rawText = await response.text();
  let data: unknown = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { detail: rawText };
    }
  }

  if (!response.ok) {
    const errorData =
      typeof data === 'object' && data !== null
        ? (data as Record<string, unknown>)
        : { detail: String(data) };
    throw new ApiError(response.status, errorData);
  }

  return data as T;
}
