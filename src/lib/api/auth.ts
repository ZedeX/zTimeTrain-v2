import { post, setAuthToken } from './client';

export interface AuthResponse {
  userId: string;
  token: string;
}

export async function register(phone: string, password: string): Promise<AuthResponse> {
  const result = await post<AuthResponse>('/register', { phone, password }, false);
  setAuthToken(result.token);
  return result;
}

export async function login(phone: string, password: string): Promise<AuthResponse> {
  const result = await post<AuthResponse>('/login', { phone, password }, false);
  setAuthToken(result.token);
  return result;
}

export function logout() {
  setAuthToken(null);
}
