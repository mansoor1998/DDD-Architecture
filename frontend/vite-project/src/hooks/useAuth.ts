import { useMutation } from '@tanstack/react-query'
import { authService } from '@services/auth.service'
import { useAuthStore } from '@store/auth.store'
import type { RegisterPayload, LoginPayload } from '@models/auth.model'

export function useRegister() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setAuth(data)
    },
  })
}

export function useLogin() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      // 1. Get token
      const authData = await authService.login(payload)
      
      // 2. Temporarily set token in localStorage for the next call to work
      localStorage.setItem('token', authData.access_token)
      
      // 3. Get user details (email)
      const userData = await authService.getCurrentUser()
      
      return { ...authData, user: userData }
    },
    onSuccess: (data) => {
      setAuth(data)
    },
  })
}

export function useVerifyEmail() {
  const { updateIsActive } = useAuthStore()

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      updateIsActive(true)
    },
  })
}
