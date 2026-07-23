import { apiClient } from './http.client'
import type { RegisterPayload, AuthResponse, LoginPayload } from '@models/auth.model'

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/register", payload);
    return data;
  },
  
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const params = new URLSearchParams()
    params.append('username', payload.email)
    params.append('password', payload.password)

    const { data } = await apiClient.post<AuthResponse>("/login/access-token", params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return data;
  },

  getCurrentUser: async (): Promise<{ email: string }> => {
    const { data } = await apiClient.get("/users/me");
    return data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const { data } = await apiClient.get(`/verify-email?token=${token}`);
    return data;
  }
};
