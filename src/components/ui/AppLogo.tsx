import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { fontHeading, tokens } from '../../theme'

interface AppLogoProps {
  size?: 'medium' | 'large'
}

export const AppLogo = ({ size = 'medium' }: AppLogoProps) => {
  const markSize = size === 'large' ? 34 : 26
  const fontSize = size === 'large' ? '1.5rem' : '1.1875rem'

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        component="svg"
        viewBox="0 0 64 64"
        sx={{ width: markSize, height: markSize, flexShrink: 0 }}
      >
        <rect width="64" height="64" rx="16" fill={tokens.surfaceOverlay} />
        <path
          d="M16 35 32 19 48 35"
          stroke={tokens.accent}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="45" r="5" fill={tokens.accentBright} />
      </Box>
      <Typography
        component="span"
        sx={{
          fontFamily: fontHeading,
          fontWeight: 700,
          fontSize,
          letterSpacing: '-0.03em',
          color: 'text.primary',
          lineHeight: 1,
        }}
      >
        llave
        <Box component="span" sx={{ color: tokens.accentBright }}>
          .
        </Box>
      </Typography>
    </Box>
  )
}
