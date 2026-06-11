import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { tokens } from '../../theme'
import { easeOutExpo } from './motionPresets'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: easeOutExpo }}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      py: { xs: 8, md: 12 },
      px: 3,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 5,
      border: `1px dashed ${tokens.borderStrong}`,
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(420px 220px at 50% 0%, ${alpha(tokens.accent, 0.08)}, transparent 70%)`,
        pointerEvents: 'none',
      },
    }}
  >
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
        boxShadow: `0 0 0 8px ${alpha(tokens.accent, 0.04)}, 0 0 48px ${alpha(tokens.accent, 0.15)}`,
        mb: 3,
        '& svg': { fontSize: 34 },
      }}
    >
      {icon}
    </Box>
    <Typography variant="h3" component="p" sx={{ mb: 1.25 }}>
      {title}
    </Typography>
    <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 440, mb: action ? 3.5 : 0 }}>
      {description}
    </Typography>
    {action}
  </Box>
)
