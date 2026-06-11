import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import { AppLogo } from '../../components/ui/AppLogo'
import { easeOutExpo } from '../../components/ui/motionPresets'
import { fontHeading, tokens } from '../../theme'

const brandPoints = ['Compara con datos reales', 'Pondera lo que te importa', 'Decide sin dudas'] as const

const gridPattern = `linear-gradient(${alpha(tokens.ink, 0.035)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(tokens.ink, 0.035)} 1px, transparent 1px)`

export const AuthShell = ({ children }: PropsWithChildren) => (
  <Box
    sx={{
      minHeight: '100dvh',
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
    }}
  >
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 7,
        position: 'relative',
        overflow: 'hidden',
        borderRight: `1px solid ${tokens.border}`,
        backgroundImage: gridPattern,
        backgroundSize: '56px 56px',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(800px 500px at 20% 110%, ${alpha(tokens.accent, 0.12)}, transparent 60%), radial-gradient(600px 400px at 90% -10%, ${alpha(tokens.sky, 0.07)}, transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <AppLogo size="large" />
      </Box>
      <Box sx={{ position: 'relative', maxWidth: 520 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.1 }}
        >
          <Typography
            sx={{
              fontFamily: fontHeading,
              fontWeight: 700,
              fontSize: '3rem',
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
            }}
          >
            Tu próxima casa,
            <br />
            decidida con{' '}
            <Box component="span" sx={{ color: tokens.accentBright }}>
              datos
            </Box>
            .
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 2.5, fontSize: '1.0625rem', maxWidth: 420 }}>
            Registra cada casa que visites, compárala contra tu arriendo actual y deja que los
            números hablen.
          </Typography>
        </motion.div>
      </Box>
      <Stack direction="row" spacing={3} sx={{ position: 'relative' }}>
        {brandPoints.map((point, index) => (
          <motion.div
            key={point}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.3 + index * 0.1 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: tokens.accentBright,
                  boxShadow: `0 0 8px ${alpha(tokens.accentBright, 0.9)}`,
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {point}
              </Typography>
            </Stack>
          </motion.div>
        ))}
      </Stack>
    </Box>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, sm: 6 },
        position: 'relative',
      }}
    >
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 5 }}>
        <AppLogo size="large" />
      </Box>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOutExpo, delay: 0.15 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        {children}
      </motion.div>
    </Box>
  </Box>
)
