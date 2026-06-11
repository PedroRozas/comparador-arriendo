import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { tokens } from '../../theme'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  size?: 'page' | 'section'
}

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  action,
  size = 'section',
}: SectionHeaderProps) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={2}
    sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
  >
    <Box>
      {eyebrow ? (
        <Typography
          variant="overline"
          sx={{ color: tokens.accentBright, display: 'block', mb: 0.5 }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography variant={size === 'page' ? 'h1' : 'h3'} component={size === 'page' ? 'h1' : 'h2'}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, maxWidth: 560 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
    {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
  </Stack>
)
