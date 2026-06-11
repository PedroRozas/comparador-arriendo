import AddRounded from '@mui/icons-material/AddRounded'
import HomeWorkRounded from '@mui/icons-material/HomeWorkRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { staggerContainer } from '../../components/ui/motionPresets'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { tabularNums, tokens } from '../../theme'
import { computeMetrics } from './calculations'
import { formatArea, formatCLP } from './format'
import { PropertyCard } from './PropertyCard'
import type { PropertyWithRelations } from './types'
import { useProperties } from './useProperties'

const cardsGrid = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
  gap: 3,
} as const

interface HighlightStat {
  label: string
  value: string
  detail: string
}

const buildHighlights = (properties: PropertyWithRelations[]): HighlightStat[] => {
  const withMetrics = properties.map((property) => ({
    property,
    metrics: computeMetrics(property),
  }))

  const cheapest = withMetrics.reduce((best, entry) =>
    entry.property.monthly_rent < best.property.monthly_rent ? entry : best,
  )
  const biggest = withMetrics.reduce((best, entry) =>
    entry.metrics.usableArea > best.metrics.usableArea ? entry : best,
  )
  const withPrice = withMetrics.filter((entry) => entry.metrics.pricePerM2 !== null)
  const bestValue =
    withPrice.length > 0
      ? withPrice.reduce((best, entry) =>
          (entry.metrics.pricePerM2 ?? Infinity) < (best.metrics.pricePerM2 ?? Infinity)
            ? entry
            : best,
        )
      : null

  const highlights: HighlightStat[] = [
    {
      label: 'Arriendo más bajo',
      value: formatCLP(cheapest.property.monthly_rent),
      detail: cheapest.property.alias,
    },
    {
      label: 'Mayor superficie útil',
      value: biggest.metrics.usableArea > 0 ? formatArea(biggest.metrics.usableArea) : '—',
      detail: biggest.property.alias,
    },
  ]

  if (bestValue?.metrics.pricePerM2) {
    highlights.push({
      label: 'Mejor precio por m²',
      value: `${formatCLP(Math.round(bestValue.metrics.pricePerM2))}/m²`,
      detail: bestValue.property.alias,
    })
  }

  return highlights
}

const ListSkeleton = () => (
  <Box sx={cardsGrid}>
    {Array.from({ length: 6 }, (_, index) => (
      <Paper key={index} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={180} />
        <Box sx={{ p: 2.5 }}>
          <Skeleton width="60%" height={28} />
          <Skeleton width="40%" height={18} />
          <Skeleton width="55%" height={34} sx={{ mt: 1 }} />
        </Box>
      </Paper>
    ))}
  </Box>
)

export const PropertiesListPage = () => {
  const { properties, isLoading, error } = useProperties()

  const candidateCount = properties.filter((property) => property.status === 'candidate').length
  const hasCurrent = properties.some((property) => property.status === 'current')

  return (
    <Stack spacing={4}>
      <SectionHeader
        size="page"
        eyebrow="Portafolio"
        title="Tus propiedades"
        description={
          properties.length > 0
            ? `${candidateCount} ${candidateCount === 1 ? 'candidata' : 'candidatas'} · ${hasCurrent ? 'casa actual registrada' : 'sin casa actual como base'}`
            : 'Registra las casas que estás mirando y compáralas con datos.'
        }
        action={
          <Button
            component={RouterLink}
            to="/properties/new"
            variant="contained"
            size="large"
            startIcon={<AddRounded />}
          >
            Agregar propiedad
          </Button>
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {isLoading ? (
        <ListSkeleton />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<HomeWorkRounded />}
          title="Aún no agregas propiedades"
          description="Crea tu primera ficha con arriendo, superficie y características. Después podrás compararlas en el benchmark."
          action={
            <Button
              component={RouterLink}
              to="/properties/new"
              variant="contained"
              size="large"
              startIcon={<AddRounded />}
            >
              Agregar la primera
            </Button>
          }
        />
      ) : (
        <>
          {properties.length >= 2 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {buildHighlights(properties).map((stat) => (
                <Paper
                  key={stat.label}
                  variant="outlined"
                  sx={{ p: 2.25, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.015)' }}
                >
                  <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" component="p" sx={tabularNums}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.accentBright, fontWeight: 600 }}>
                    {stat.detail}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : null}
          <Box
            component={motion.div}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            sx={cardsGrid}
          >
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </Box>
        </>
      )}
    </Stack>
  )
}
