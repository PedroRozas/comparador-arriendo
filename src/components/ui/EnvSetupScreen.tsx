import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { EnvKey } from '../../lib/env'
import { tokens } from '../../theme'
import { AppLogo } from './AppLogo'

const monoFont = "'SF Mono', 'Fira Code', ui-monospace, monospace"

const steps = [
  'Copia el archivo de ejemplo: cp .env.example .env',
  'Completa la URL y la anon key de tu proyecto Supabase (Settings → API)',
  'Reinicia el servidor: npm run dev',
] as const

interface EnvSetupScreenProps {
  missingKeys: readonly EnvKey[]
}

export const EnvSetupScreen = ({ missingKeys }: EnvSetupScreenProps) => (
  <Box
    sx={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      p: 3,
    }}
  >
    <AppLogo size="large" />
    <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, borderRadius: 5, maxWidth: 560 }}>
      <Typography variant="overline" sx={{ color: tokens.amberBright }}>
        Configuración pendiente
      </Typography>
      <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 1.5 }}>
        Falta conectar Supabase
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        La app no encontró estas variables de entorno:
      </Typography>
      <Stack spacing={1} sx={{ mb: 3.5 }}>
        {missingKeys.map((key) => (
          <Box
            key={key}
            sx={{
              fontFamily: monoFont,
              fontSize: '0.8125rem',
              px: 2,
              py: 1.25,
              borderRadius: 2,
              color: tokens.amberBright,
              backgroundColor: alpha(tokens.amber, 0.08),
              border: `1px solid ${alpha(tokens.amber, 0.25)}`,
            }}
          >
            {key}
          </Box>
        ))}
      </Stack>
      <Stack spacing={1.5}>
        {steps.map((step, index) => (
          <Stack key={step} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: tokens.accentBright,
                backgroundColor: alpha(tokens.accent, 0.12),
                border: `1px solid ${alpha(tokens.accent, 0.3)}`,
              }}
            >
              {index + 1}
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', pt: 0.25 }}>
              {step}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  </Box>
)
