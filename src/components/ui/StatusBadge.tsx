import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import type { PropertyStatus } from '../../lib/database.types'
import { tokens } from '../../theme'

interface StatusBadgeProps {
  status: PropertyStatus
  floating?: boolean
}

const statusConfig: Record<
  PropertyStatus,
  { label: string; color: string; background: string; border: string }
> = {
  current: {
    label: 'Casa actual',
    color: tokens.accentBright,
    background: alpha(tokens.accent, 0.14),
    border: alpha(tokens.accent, 0.35),
  },
  candidate: {
    label: 'Candidata',
    color: tokens.sky,
    background: alpha(tokens.sky, 0.12),
    border: alpha(tokens.sky, 0.3),
  },
}

export const StatusBadge = ({ status, floating = false }: StatusBadgeProps) => {
  const config = statusConfig[status]

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: 99,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.background,
        border: `1px solid ${config.border}`,
        ...(floating && {
          backdropFilter: 'blur(8px)',
          backgroundColor: alpha(tokens.bg, 0.65),
        }),
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.color,
          boxShadow: `0 0 8px ${alpha(config.color, 0.8)}`,
        }}
      />
      {config.label}
    </Box>
  )
}
