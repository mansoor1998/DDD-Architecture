import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '@models/auth.model'

export interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      isAuthenticated: false,
      setAuth: (response) => {
        localStorage.setItem('token', response.access_token)
        set({ 
          token: response.access_token, 
          email: response.user?.email ?? null,
          isAuthenticated: true 
        })
      },
      clearAuth: () => {
        localStorage.removeItem('token')
        set({ token: null, email: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

