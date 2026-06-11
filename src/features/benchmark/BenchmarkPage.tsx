import AddRounded from '@mui/icons-material/AddRounded'
import InsightsRounded from '@mui/icons-material/InsightsRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { fadeUpItem, staggerContainer } from '../../components/ui/motionPresets'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { computeMetrics } from '../properties/calculations'
import { useProperties } from '../properties/useProperties'
import { ChartsPanel } from './ChartsPanel'
import { ComparisonTable } from './ComparisonTable'
import { PairwiseDuel } from './PairwiseDuel'
import { PropertyPicker } from './PropertyPicker'
import { RankingBoard } from './RankingBoard'
import { DEFAULT_WEIGHTS, scoreEntries, sortByScore, type Weights } from './scoring'

const BenchmarkSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={72} sx={{ borderRadius: 4 }} />
    <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
    <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
  </Stack>
)

export const BenchmarkPage = () => {
  const { properties, isLoading, error } = useProperties()
  const [excludedIds, setExcludedIds] = useState<ReadonlySet<string>>(new Set())
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS)

  const selectedIds = useMemo(() => {
    const selected = new Set<string>()
    for (const property of properties) {
      if (property.status === 'current' || !excludedIds.has(property.id)) {
        selected.add(property.id)
      }
    }
    return selected
  }, [properties, excludedIds])

  const handleToggle = (id: string) => {
    setExcludedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const scored = useMemo(() => {
    const entries = properties
      .filter((property) => selectedIds.has(property.id))
      .map((property) => ({ property, metrics: computeMetrics(property) }))
    return scoreEntries(entries, weights)
  }, [properties, selectedIds, weights])

  const ranked = useMemo(() => sortByScore(scored), [scored])

  if (isLoading) {
    return (
      <Stack spacing={4}>
        <SectionHeader size="page" eyebrow="Comparación" title="Benchmark" />
        <BenchmarkSkeleton />
      </Stack>
    )
  }

  return (
    <Stack spacing={4}>
      <SectionHeader
        size="page"
        eyebrow="Comparación"
        title="Benchmark"
        description="Todas tus opciones lado a lado: heatmap, ranking ponderado y ventajas concretas."
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {properties.length < 2 ? (
        <EmptyState
          icon={<InsightsRounded />}
          title="Necesitas al menos dos casas"
          description="Agrega tu casa actual y al menos una candidata para empezar a comparar de verdad."
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
      ) : (
        <Stack
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          spacing={3.5}
        >
          <motion.div variants={fadeUpItem}>
            <PropertyPicker
              properties={properties}
              selectedIds={selectedIds}
              onToggle={handleToggle}
            />
          </motion.div>

          {scored.length < 2 ? (
            <Alert severity="info">
              Selecciona al menos dos casas para ver la comparación completa.
            </Alert>
          ) : (
            <>
              <motion.div variants={fadeUpItem}>
                <ComparisonTable entries={scored} />
              </motion.div>
              <motion.div variants={fadeUpItem}>
                <RankingBoard ranked={ranked} weights={weights} onWeightsChange={setWeights} />
              </motion.div>
              <Box component={motion.div} variants={fadeUpItem}>
                <ChartsPanel entries={scored} ranked={ranked} />
              </Box>
              <motion.div variants={fadeUpItem}>
                <PairwiseDuel ranked={ranked} />
              </motion.div>
            </>
          )}
        </Stack>
      )}
    </Stack>
  )
}
