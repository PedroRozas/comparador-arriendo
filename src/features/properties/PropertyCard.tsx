import BathtubRounded from '@mui/icons-material/BathtubRounded'
import BedRounded from '@mui/icons-material/BedRounded'
import HomeWorkRounded from '@mui/icons-material/HomeWorkRounded'
import SquareFootRounded from '@mui/icons-material/SquareFootRounded'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'
import { fadeUpItem, hoverLift } from '../../components/ui/motionPresets'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { cardHoverShadow, cardShadow, tabularNums, tokens } from '../../theme'
import { computeMetrics } from './calculations'
import { formatArea, formatCLP } from './format'
import type { PropertyWithRelations } from './types'
import { usePhotoUrl } from './usePhotoUrl'

interface PropertyCardProps {
  property: PropertyWithRelations
}

const PhotoArea = ({ property }: PropertyCardProps) => {
  const { url, isLoading } = usePhotoUrl(property.photo_path)

  if (isLoading) {
    return <Skeleton variant="rectangular" height="100%" />
  }

  if (url) {
    return (
      <Box
        component="img"
        src={url}
        alt={`Foto de ${property.alias}`}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 400ms ease',
        }}
      />
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(280px 160px at 50% 0%, ${alpha(tokens.accent, 0.1)}, transparent 70%), linear-gradient(180deg, ${tokens.surfaceRaised}, ${tokens.surface})`,
      }}
    >
      <HomeWorkRounded sx={{ fontSize: 56, color: alpha(tokens.inkSecondary, 0.25) }} />
    </Box>
  )
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const metrics = computeMetrics(property)

  return (
    <Box
      component={motion.div}
      variants={fadeUpItem}
      whileHover={hoverLift}
      sx={{ height: '100%' }}
    >
      <Box
        component={RouterLink}
        to={`/properties/${property.id}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          textDecoration: 'none',
          color: 'inherit',
          borderRadius: 4,
          overflow: 'hidden',
          border: `1px solid ${tokens.border}`,
          backgroundColor: tokens.surface,
          boxShadow: cardShadow,
          transition: 'box-shadow 250ms ease, border-color 250ms ease',
          '&:hover': {
            boxShadow: cardHoverShadow,
            borderColor: alpha(tokens.accent, 0.3),
            '& img': { transform: 'scale(1.04)' },
          },
        }}
      >
        <Box sx={{ position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0 }}>
          <PhotoArea property={property} />
          <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
            <StatusBadge status={property.status} floating />
          </Box>
        </Box>
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Typography variant="h5" component="h3" noWrap>
            {property.alias}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5 }} noWrap>
            {property.address ?? 'Sin dirección registrada'}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', mb: 2 }}>
            <Typography variant="h4" component="span" sx={tabularNums}>
              {formatCLP(property.monthly_rent)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              /mes
            </Typography>
          </Stack>
          <Divider sx={{ mt: 'auto', mb: 1.5 }} />
          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <SquareFootRounded sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', ...tabularNums }}>
                {metrics.usableArea > 0 ? formatArea(metrics.usableArea) : '—'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <BedRounded sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', ...tabularNums }}>
                {metrics.bedroomCount}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <BathtubRounded sx={{ fontSize: 16, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', ...tabularNums }}>
                {metrics.bathroomCount}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
