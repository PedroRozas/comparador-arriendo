import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { AuthShell } from './AuthShell'
import { translateAuthError } from './authErrors'
import { loginSchema, type LoginFormValues } from './authSchemas'
import { SplashScreen } from './SplashScreen'
import { useAuth } from './useAuth'

export const LoginPage = () => {
  const { session, isLoading } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isLoading) {
    return <SplashScreen />
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      setSubmitError(translateAuthError(error))
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <AuthShell>
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={1}>
          <Typography variant="h2" component="h1">
            Bienvenido de vuelta
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Entra para seguir comparando tus opciones.
          </Typography>
        </Stack>
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          autoFocus
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowPassword((value) => !value)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...register('password')}
        />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}
          <Link component={RouterLink} to="/signup" underline="hover" sx={{ fontWeight: 600 }}>
            Crear cuenta
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  )
}
