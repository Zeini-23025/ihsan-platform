import api from './api';

export interface LoginResponse {
  nom?: string;
  prenom?: string;
  email: string;
  role: string;
  token: string;
  refreshToken?: string;
  business_name?: string;
  business_type?: string;
  address?: string;
  description?: string;
}

export interface RegisterResponse {
  id: number;
  nom?: string;
  prenom?: string;
  email: string;
  role: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://ihsan-backend-jg2t.vercel.app/api';

// Native fetch to avoid Axios formatting issues that lead to 400 Bad Request
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const body = await response.json();
  if (!response.ok) {
    // body may be {message: "..."} or [{field, message}]
    const errMsg = body?.message || (Array.isArray(body) ? body.map((e: {message: string}) => e.message).join(', ') : 'Login failed');
    throw new Error(errMsg);
  }
  // Backend wraps response: {message: "...", data: {token, role, ...}}
  // Unwrap if necessary
  const data: LoginResponse = body?.data || body;
  return data;
};

export const register = async (
  email: string,
  password: string,
  nom: string,
  prenom: string
): Promise<RegisterResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nom, prenom })
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const refreshToken = async (token: string): Promise<{ token: string }> => {
  const response = await api.post('/auth/refresh', { token });
  return response.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (code: string, newPassword: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/reset-password', { code, newPassword });
  return response.data;
};
