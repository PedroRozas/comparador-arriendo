import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded'
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { tokens } from '../../theme'
import { AuthShell } from './AuthShell'
import { translateAuthError } from './authErrors'
import { signupSchema, type SignupFormValues } from './authSchemas'
import { SplashScreen } from './SplashScreen'
import { useAuth } from './useAuth'

export const SignupPage = () => {
  const { session, isLoading } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  if (isLoading) {
    return <SplashScreen />
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitError(null)
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })
    if (error) {
      setSubmitError(translateAuthError(error))
      return
    }
    if (data.user && data.user.identities?.length === 0) {
      setSubmitError('Este correo ya tiene una cuenta. Inicia sesión.')
      return
    }
    setConfirmationEmail(values.email)
  }

  if (confirmationEmail) {
    return (
      <AuthShell>
        <Stack spacing={3} sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.accentBright,
              backgroundColor: alpha(tokens.accent, 0.1),
              border: `1px solid ${alpha(tokens.accent, 0.25)}`,
              boxShadow: `0 0 48px ${alpha(tokens.accent, 0.18)}`,
              '& svg': { fontSize: 34 },
            }}
          >
            <MarkEmailReadRounded />
          </Box>
          <Stack spacing={1.25}>
            <Typography variant="h2" component="h1">
              Confirma tu correo
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Enviamos un enlace de confirmación a{' '}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {confirmationEmail}
              </Box>
              . Debes verificarlo antes de poder entrar.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Si no aparece en unos minutos, revisa la carpeta de spam.
            </Typography>
          </Stack>
          <Button component={RouterLink} to="/login" variant="outlined" size="large">
            Volver al inicio de sesión
          </Button>
        </Stack>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={1}>
          <Typography variant="h2" component="h1">
            Crea tu cuenta
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Te enviaremos un correo para confirmar tu identidad.
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
          autoComplete="new-password"
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
        <TextField
          label="Repite la contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          ¿Ya tienes cuenta?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  )
}
