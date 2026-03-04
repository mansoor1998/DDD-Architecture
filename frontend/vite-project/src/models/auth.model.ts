import { z } from 'zod'

export const RegisterPayloadSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>

export const LoginPayloadSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginPayload = z.infer<typeof LoginPayloadSchema>

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  user: z.object({
    email: z.string().email()
  }).optional()
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>
