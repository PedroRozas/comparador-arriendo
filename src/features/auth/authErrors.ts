import type { AuthError } from '@supabase/supabase-js'

const knownErrors: ReadonlyArray<{ match: string; message: string }> = [
  {
    match: 'Invalid login credentials',
    message: 'Correo o contraseña incorrectos.',
  },
  {
    match: 'Email not confirmed',
    message: 'Debes confirmar tu correo antes de entrar. Revisa tu bandeja de entrada.',
  },
  {
    match: 'Database error saving new user',
    message: 'Este correo no está autorizado para registrarse en esta aplicación.',
  },
  {
    match: 'User already registered',
    message: 'Este correo ya tiene una cuenta. Inicia sesión.',
  },
  {
    match: 'Email rate limit exceeded',
    message: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
  },
]

export const translateAuthError = (error: AuthError): string => {
  const known = knownErrors.find((entry) => error.message.includes(entry.match))
  return known ? known.message : `Error de autenticación: ${error.message}`
}
