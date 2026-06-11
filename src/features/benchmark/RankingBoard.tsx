import RestartAltRounded from '@mui/icons-material/RestartAltRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { layoutSpring } from '../../components/ui/motionPresets'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fontHeading, tabularNums, tokens } from '../../theme'
import {
  DEFAULT_WEIGHTS,
  WEIGHT_KEYS,
  WEIGHT_MAX,
  weightLabels,
  type ScoredEntry,
  type WeightKey,
  type Weights,
} from './scoring'

interface RankingBoardProps {
  ranked: ScoredEntry[]
  weights: Weights
  onWeightsChange: (weights: Weights) => void
}

export const RankingBoard = ({ ranked, weights, onWeightsChange }: RankingBoardProps) => {
  const currentEntry = ranked.find((entry) => entry.property.status === 'current')

  const handleWeightChange = (key: WeightKey, value: number) => {
    onWeightsChange({ ...weights, [key]: value })
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Typography variant="h3" component="h2">
            Ranking ponderado
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Ajusta los pesos según lo que más te importa y mira cómo cambia el orden.
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<RestartAltRounded />}
          onClick={() => onWeightsChange(DEFAULT_WEIGHTS)}
        >
          Restablecer
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
          gap: { xs: 3, md: 5 },
          alignItems: 'start',
        }}
      >
        <Stack spacing={1.5}>
          {WEIGHT_KEYS.map((key) => (
            <Box key={key}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: -0.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {weightLabels[key]}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ ...tabularNums, color: tokens.accentBright, fontWeight: 600 }}
                >
                  {weights[key]}
                </Typography>
              </Stack>
              <Slider
                size="small"
                min={0}
                max={WEIGHT_MAX}
                step={1}
                value={weights[key]}
                onChange={(_, value) => {
                  if (typeof value === 'number') {
                    handleWeightChange(key, value)
                  }
                }}
                aria-label={`Peso de ${weightLabels[key]}`}
              />
            </Box>
          ))}
        </Stack>

        <Stack spacing={1.5}>
          {ranked.map((entry, position) => {
            const score = Math.round(entry.score)
            const delta = currentEntry
              ? Math.round(entry.score - currentEntry.score)
              : null
            const isFirst = position === 0
            return (
              <Box
                key={entry.property.id}
                component={motion.div}
                layout
                transition={layoutSpring}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2.5,
                  py: 2,
                  borderRadius: 3,
                  border: `1px solid ${isFirst ? alpha(tokens.accent, 0.35) : tokens.border}`,
                  backgroundColor: isFirst
                    ? alpha(tokens.accent, 0.05)
                    : 'rgba(255, 255, 255, 0.015)',
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontFamily: fontHeading,
                    fontWeight: 700,
                    fontSize: '1.375rem',
                    letterSpacing: '-0.02em',
                    width: 36,
                    flexShrink: 0,
                    color: isFirst ? tokens.accentBright : 'text.disabled',
                    ...tabularNums,
                  }}
                >
                  {position + 1}
                </Typography>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
                  >
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
                      <Typography variant="h6" component="span" noWrap>
                        {entry.property.alias}
                      </Typography>
                      <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
                        <StatusBadge status={entry.property.status} />
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexShrink: 0 }}>
                      {delta !== null && entry.property.status !== 'current' ? (
                        <Typography
                          variant="caption"
                          sx={{
                            ...tabularNums,
                            fontWeight: 600,
                            color:
                              delta > 0
                                ? tokens.accentBright
                                : delta < 0
                                  ? tokens.dangerBright
                                  : 'text.disabled',
                          }}
                        >
                          {delta > 0 ? `+${delta}` : delta} vs actual
                        </Typography>
                      ) : null}
                      <Typography variant="h5" component="span" sx={tabularNums}>
                        {score}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        pts
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 99,
                      backgroundColor: 'rgba(148, 163, 184, 0.14)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component={motion.div}
                      initial={false}
                      animate={{ width: `${Math.max(score, 2)}%` }}
                      transition={layoutSpring}
                      sx={{
                        height: '100%',
                        borderRadius: 99,
                        background: isFirst
                          ? `linear-gradient(90deg, ${tokens.accentDeep}, ${tokens.accentBright})`
                          : `linear-gradient(90deg, ${alpha(tokens.inkSecondary, 0.5)}, ${alpha(tokens.inkSecondary, 0.8)})`,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Stack>
      </Box>
    </Paper>
  )
}
