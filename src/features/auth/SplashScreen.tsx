import Box from '@mui/material/Box'
import { motion } from 'framer-motion'
import { AppLogo } from '../../components/ui/AppLogo'

export const SplashScreen = () => (
  <Box
    sx={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <motion.div
      initial={{ opacity: 0.4, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
    >
      <AppLogo size="large" />
    </motion.div>
  </Box>
)
