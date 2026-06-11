import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 8

const emailField = z.email('Ingresa un correo válido')

const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export const signupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Repite la contraseña'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
