import LogoutRounded from '@mui/icons-material/LogoutRounded'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppLogo } from '../components/ui/AppLogo'
import { pageVariants } from '../components/ui/motionPresets'
import { getErrorMessage } from '../lib/errors'
import { tokens } from '../theme'
import { useAuth } from '../features/auth/useAuth'

const navItems = [
  { label: 'Propiedades', to: '/' },
  { label: 'Benchmark', to: '/benchmark' },
] as const

const isActivePath = (pathname: string, to: string): boolean =>
  to === '/' ? pathname === '/' || pathname.startsWith('/properties') : pathname.startsWith(to)

export const AppLayout = () => {
  const { session, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  const email = session?.user.email ?? ''
  const initial = email.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    setMenuAnchor(null)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      setSignOutError(getErrorMessage(error))
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: alpha(tokens.bg, 0.72),
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${tokens.border}`,
          backgroundImage: 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64, gap: { xs: 1, md: 4 } }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            >
              <AppLogo />
            </Box>
            <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
              {navItems.map((item) => {
                const isActive = isActivePath(location.pathname, item.to)
                return (
                  <Box
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    sx={{
                      position: 'relative',
                      textDecoration: 'none',
                      px: { xs: 1.25, md: 1.75 },
                      py: 0.875,
                      borderRadius: 2.5,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: isActive ? 'text.primary' : 'text.secondary',
                      backgroundColor: isActive ? 'rgba(148, 163, 184, 0.09)' : 'transparent',
                      transition: 'all 160ms ease',
                      '&:hover': {
                        color: 'text.primary',
                        backgroundColor: 'rgba(148, 163, 184, 0.07)',
                      },
                    }}
                  >
                    {item.label}
                    {isActive ? (
                      <Box
                        component={motion.span}
                        layoutId="nav-indicator"
                        sx={{
                          position: 'absolute',
                          left: 14,
                          right: 14,
                          bottom: -1,
                          height: 2,
                          borderRadius: 99,
                          backgroundColor: tokens.accentBright,
                        }}
                      />
                    ) : null}
                  </Box>
                )
              })}
            </Stack>
            <IconButton
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              aria-label="Menú de usuario"
              sx={{ p: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  backgroundColor: alpha(tokens.accent, 0.18),
                  color: tokens.accentBright,
                  border: `1px solid ${alpha(tokens.accent, 0.35)}`,
                }}
              >
                {initial}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Sesión iniciada como
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {email}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={() => void handleSignOut()}>
                <ListItemIcon>
                  <LogoutRounded fontSize="small" />
                </ListItemIcon>
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
        {signOutError ? (
          <Typography variant="body2" sx={{ color: tokens.dangerBright, mb: 2 }}>
            {signOutError}
          </Typography>
        ) : null}
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          <Outlet />
        </motion.div>
      </Container>
    </Box>
  )
}
