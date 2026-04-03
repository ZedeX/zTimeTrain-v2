// Determine API base URL based on environment
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = isLocalhost
  ? '/api'
  : 'https://time-train.flychina2008.workers.dev/api';

// Token storage
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('timetrain_token', token);
  } else {
    localStorage.removeItem('timetrain_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('timetrain_token');
  }
  return authToken;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> {
  const url = new URL(API_BASE + path);
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && requireAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  const result = await response.json() as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }

  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

export function get<T>(path: string, requireAuth: boolean = true) {
  return request<T>(path, { method: 'GET' }, requireAuth);
}

export function post<T>(path: string, body?: unknown, requireAuth: boolean = true) {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  }, requireAuth);
}

export function put<T>(path: string, body?: unknown, requireAuth: boolean = true) {
  return request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  }, requireAuth);
}

export function del<T>(path: string, requireAuth: boolean = true) {
  return request<T>(path, { method: 'DELETE' }, requireAuth);
}
