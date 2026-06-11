import { alpha, createTheme } from '@mui/material/styles'

export const tokens = {
  bg: '#0B0E14',
  surface: '#11151F',
  surfaceRaised: '#151B28',
  surfaceOverlay: '#1B2231',
  border: 'rgba(148, 163, 184, 0.14)',
  borderStrong: 'rgba(148, 163, 184, 0.28)',
  accent: '#10B981',
  accentBright: '#34D399',
  accentDeep: '#0E9F6E',
  accentSoft: 'rgba(16, 185, 129, 0.12)',
  ink: '#EDF1F7',
  inkSecondary: '#94A3B8',
  inkTertiary: '#5E6B81',
  danger: '#EF4444',
  dangerBright: '#F87171',
  amber: '#F59E0B',
  amberBright: '#FBBF24',
  sky: '#38BDF8',
  violet: '#A78BFA',
  rose: '#FB7185',
} as const

export const fontHeading = "'Sora Variable', 'Inter Variable', sans-serif"
export const fontBody = "'Inter Variable', -apple-system, 'Segoe UI', sans-serif"

export const tabularNums = { fontVariantNumeric: 'tabular-nums' } as const

export const cardShadow =
  '0 1px 2px rgba(0, 0, 0, 0.35), 0 12px 32px -16px rgba(0, 0, 0, 0.55)'

export const cardHoverShadow =
  '0 2px 4px rgba(0, 0, 0, 0.4), 0 24px 48px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.22)'

export const overlayShadow =
  '0 4px 8px rgba(0, 0, 0, 0.45), 0 24px 64px -16px rgba(0, 0, 0, 0.75)'

const noiseLayer =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")"

const glowLayers = [
  'radial-gradient(1100px 700px at 85% -10%, rgba(16, 185, 129, 0.07), transparent 60%)',
  'radial-gradient(900px 600px at -10% 5%, rgba(56, 189, 248, 0.05), transparent 55%)',
].join(', ')

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: tokens.bg, paper: tokens.surface },
    primary: {
      main: tokens.accent,
      light: tokens.accentBright,
      dark: tokens.accentDeep,
      contrastText: '#062A1F',
    },
    secondary: { main: tokens.sky },
    error: { main: tokens.danger, light: tokens.dangerBright },
    warning: { main: tokens.amber, light: tokens.amberBright },
    info: { main: tokens.sky },
    success: { main: tokens.accent, light: tokens.accentBright },
    divider: tokens.border,
    text: {
      primary: tokens.ink,
      secondary: tokens.inkSecondary,
      disabled: tokens.inkTertiary,
    },
    action: {
      hover: 'rgba(148, 163, 184, 0.07)',
      selected: alpha(tokens.accent, 0.14),
      disabledBackground: 'rgba(148, 163, 184, 0.08)',
      disabled: tokens.inkTertiary,
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: fontBody,
    h1: {
      fontFamily: fontHeading,
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '-0.03em',
      lineHeight: 1.08,
    },
    h2: {
      fontFamily: fontHeading,
      fontWeight: 700,
      fontSize: '2.125rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.12,
    },
    h3: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.015em',
      lineHeight: 1.25,
    },
    h5: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '1.0625rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h6: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '0.9375rem',
      letterSpacing: '-0.005em',
    },
    subtitle1: { fontWeight: 500, fontSize: '0.9375rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.14em',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: {
          minHeight: '100%',
          backgroundColor: tokens.bg,
          backgroundImage: `${noiseLayer}, ${glowLayers}`,
          backgroundAttachment: 'fixed',
          backgroundSize: '160px 160px, auto, auto',
        },
        '::selection': {
          backgroundColor: alpha(tokens.accent, 0.32),
          color: tokens.ink,
        },
        '*:focus-visible': {
          outline: `2px solid ${alpha(tokens.accent, 0.7)}`,
          outlineOffset: 2,
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(148, 163, 184, 0.18)',
          borderRadius: 8,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(148, 163, 184, 0.3)',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
          padding: '8px 18px',
          transition: 'all 160ms ease',
        },
        sizeLarge: { padding: '11px 24px', fontSize: '0.9375rem' },
        sizeSmall: { padding: '5px 12px', fontSize: '0.8125rem' },
        text: {
          color: tokens.inkSecondary,
          '&:hover': {
            color: tokens.ink,
            backgroundColor: 'rgba(148, 163, 184, 0.07)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundImage: `linear-gradient(180deg, ${tokens.accentBright}, ${tokens.accent})`,
            boxShadow: `0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 ${alpha('#FFFFFF', 0.18)}`,
            '&:hover': {
              backgroundImage: `linear-gradient(180deg, ${tokens.accentBright}, ${tokens.accentDeep})`,
              boxShadow: `0 0 0 1px ${alpha(tokens.accent, 0.4)}, 0 8px 24px -8px ${alpha(tokens.accent, 0.55)}`,
            },
          },
        },
        {
          props: { variant: 'contained', color: 'error' },
          style: {
            backgroundImage: `linear-gradient(180deg, ${tokens.dangerBright}, ${tokens.danger})`,
            color: '#2D0808',
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            borderColor: tokens.border,
            color: tokens.ink,
            '&:hover': {
              borderColor: tokens.borderStrong,
              backgroundColor: 'rgba(148, 163, 184, 0.06)',
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'error' },
          style: {
            borderColor: alpha(tokens.danger, 0.4),
            color: tokens.dangerBright,
            '&:hover': {
              borderColor: alpha(tokens.danger, 0.7),
              backgroundColor: alpha(tokens.danger, 0.08),
            },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 160ms ease',
          '&:hover': { backgroundColor: 'rgba(148, 163, 184, 0.08)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          transition: 'box-shadow 160ms ease',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.border },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.borderStrong,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.accent,
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(tokens.accent, 0.16)}`,
          },
          '&.Mui-error.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(tokens.danger, 0.16)}`,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          '&.Mui-focused': { color: tokens.accentBright },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { marginLeft: 2 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: tokens.border },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: 16,
          boxShadow: cardShadow,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { height: 4, padding: '14px 0' },
        rail: { backgroundColor: 'rgba(148, 163, 184, 0.2)', opacity: 1 },
        track: { border: 'none' },
        thumb: {
          width: 16,
          height: 16,
          backgroundColor: tokens.accentBright,
          border: `3px solid ${tokens.surfaceRaised}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 6px ${alpha(tokens.accent, 0.16)}`,
          },
          '&.Mui-active': {
            boxShadow: `0 0 0 9px ${alpha(tokens.accent, 0.2)}`,
          },
        },
        valueLabel: {
          backgroundColor: tokens.surfaceOverlay,
          borderRadius: 6,
          fontSize: '0.6875rem',
          fontWeight: 600,
          padding: '2px 8px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { width: 40, height: 24, padding: 0 },
        switchBase: {
          padding: 3,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            '& + .MuiSwitch-track': {
              backgroundColor: tokens.accent,
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 18,
          height: 18,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
        },
        track: {
          borderRadius: 12,
          backgroundColor: 'rgba(148, 163, 184, 0.25)',
          opacity: 1,
          transition: 'background-color 160ms ease',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderColor: tokens.border,
          color: tokens.inkSecondary,
          padding: '7px 16px',
          '&.Mui-selected': {
            backgroundColor: tokens.accentSoft,
            color: tokens.accentBright,
            borderColor: alpha(tokens.accent, 0.4),
            '&:hover': { backgroundColor: alpha(tokens.accent, 0.18) },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surfaceRaised,
          border: `1px solid ${tokens.border}`,
          borderRadius: 20,
          boxShadow: overlayShadow,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surfaceOverlay,
          border: `1px solid ${tokens.border}`,
          borderRadius: 12,
          boxShadow: overlayShadow,
          marginTop: 6,
        },
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
          padding: '8px 12px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surfaceOverlay,
          border: `1px solid ${tokens.border}`,
          borderRadius: 8,
          fontSize: '0.75rem',
          padding: '6px 10px',
          boxShadow: cardShadow,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${tokens.border}`,
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          color: tokens.inkSecondary,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(148, 163, 184, 0.09)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, fontSize: '0.875rem' },
      },
      variants: [
        {
          props: { severity: 'error', variant: 'standard' },
          style: {
            backgroundColor: alpha(tokens.danger, 0.12),
            border: `1px solid ${alpha(tokens.danger, 0.3)}`,
            color: tokens.dangerBright,
          },
        },
        {
          props: { severity: 'success', variant: 'standard' },
          style: {
            backgroundColor: alpha(tokens.accent, 0.12),
            border: `1px solid ${alpha(tokens.accent, 0.3)}`,
            color: tokens.accentBright,
          },
        },
        {
          props: { severity: 'info', variant: 'standard' },
          style: {
            backgroundColor: alpha(tokens.sky, 0.1),
            border: `1px solid ${alpha(tokens.sky, 0.28)}`,
            color: tokens.sky,
          },
        },
      ],
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 99,
          backgroundColor: 'rgba(148, 163, 184, 0.14)',
        },
        bar: { borderRadius: 99 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: tokens.border },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: tokens.accentBright,
          textDecorationColor: alpha(tokens.accentBright, 0.4),
          '&:hover': { textDecorationColor: tokens.accentBright },
        },
      },
    },
  },
})
