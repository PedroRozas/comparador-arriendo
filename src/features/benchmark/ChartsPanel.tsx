import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fontBody, tokens } from '../../theme'
import { WEIGHT_KEYS, weightLabels, type ScoredEntry } from './scoring'

const SERIES_COLORS: readonly string[] = [
  tokens.accent,
  tokens.sky,
  tokens.violet,
  tokens.amberBright,
  tokens.rose,
]

const buildColorMap = (entries: ScoredEntry[]): Map<string, string> =>
  new Map(
    entries.map((entry, index) => [
      entry.property.id,
      SERIES_COLORS[index % SERIES_COLORS.length] ?? tokens.accent,
    ]),
  )

const tooltipStyles = {
  contentStyle: {
    backgroundColor: tokens.surfaceOverlay,
    border: `1px solid ${tokens.border}`,
    borderRadius: 10,
    fontFamily: fontBody,
    fontSize: 12,
    color: tokens.ink,
  },
  labelStyle: { color: tokens.inkSecondary, fontWeight: 600 },
  itemStyle: { color: tokens.ink },
} as const

const SeriesLegend = ({
  entries,
  colorMap,
}: {
  entries: ScoredEntry[]
  colorMap: Map<string, string>
}) => (
  <Stack
    direction="row"
    spacing={2}
    sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}
  >
    {entries.map((entry) => (
      <Stack key={entry.property.id} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: colorMap.get(entry.property.id) ?? tokens.accent,
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {entry.property.alias}
        </Typography>
      </Stack>
    ))}
  </Stack>
)

interface ChartsPanelProps {
  entries: ScoredEntry[]
  ranked: ScoredEntry[]
}

export const ChartsPanel = ({ entries, ranked }: ChartsPanelProps) => {
  const colorMap = buildColorMap(entries)

  const radarData = WEIGHT_KEYS.map((key) => {
    const row: Record<string, string | number> = { dimension: weightLabels[key] }
    for (const entry of entries) {
      row[entry.property.alias] = Math.round(entry.normalized[key])
    }
    return row
  })

  const barData = ranked.map((entry) => ({
    id: entry.property.id,
    alias: entry.property.alias,
    score: Math.round(entry.score),
  }))

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
      }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4 }}>
        <Typography variant="h4" component="h3" sx={{ mb: 0.5 }}>
          Perfil por dimensión
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Cada eje normalizado de 0 a 100, donde más alto es mejor.
        </Typography>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke={tokens.border} />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: tokens.inkSecondary, fontSize: 12, fontFamily: fontBody }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              {entries.map((entry) => (
                <Radar
                  key={entry.property.id}
                  name={entry.property.alias}
                  dataKey={entry.property.alias}
                  stroke={colorMap.get(entry.property.id) ?? tokens.accent}
                  fill={colorMap.get(entry.property.id) ?? tokens.accent}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Tooltip {...tooltipStyles} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
        <SeriesLegend entries={entries} colorMap={colorMap} />
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4 }}>
        <Typography variant="h4" component="h3" sx={{ mb: 0.5 }}>
          Score total
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Resultado ponderado con los pesos actuales.
        </Typography>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={alpha(tokens.inkSecondary, 0.12)} />
              <XAxis
                dataKey="alias"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fill: tokens.inkSecondary, fontSize: 12, fontFamily: fontBody }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: tokens.inkTertiary, fontSize: 11, fontFamily: fontBody }}
              />
              <Tooltip {...tooltipStyles} cursor={{ fill: alpha(tokens.inkSecondary, 0.06) }} />
              <Bar dataKey="score" name="Score" radius={[8, 8, 2, 2]} maxBarSize={56}>
                {barData.map((bar) => (
                  <Cell key={bar.id} fill={colorMap.get(bar.id) ?? tokens.accent} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <SeriesLegend entries={ranked} colorMap={colorMap} />
      </Paper>
    </Box>
  )
}
