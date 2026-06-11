import CheckRounded from '@mui/icons-material/CheckRounded'
import RemoveRounded from '@mui/icons-material/RemoveRounded'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { tabularNums, tokens } from '../../theme'
import { formatArea, formatCLP, formatNumber } from '../properties/format'
import { kitchenTypeLabels } from '../properties/labels'
import { heatmapColor } from './heatmap'
import { patioScore, securityLabel, securityScore, type BenchmarkEntry } from './scoring'

interface MetricRowDef {
  kind: 'metric'
  label: string
  better: 'low' | 'high'
  getValue: (entry: BenchmarkEntry) => number | null
  format: (value: number, entry: BenchmarkEntry) => string
}

interface FlagRowDef {
  kind: 'flag'
  label: string
  getValue: (entry: BenchmarkEntry) => boolean
}

interface TextRowDef {
  kind: 'text'
  label: string
  getValue: (entry: BenchmarkEntry) => string
}

type RowDef = MetricRowDef | FlagRowDef | TextRowDef

const rows: readonly RowDef[] = [
  {
    kind: 'metric',
    label: 'Arriendo mensual',
    better: 'low',
    getValue: (entry) => entry.property.monthly_rent,
    format: (value) => formatCLP(value),
  },
  {
    kind: 'metric',
    label: 'Costo de entrada',
    better: 'low',
    getValue: (entry) => entry.metrics.entryCost,
    format: (value) => formatCLP(value),
  },
  {
    kind: 'metric',
    label: 'Superficie total',
    better: 'high',
    getValue: (entry) => (entry.metrics.totalArea > 0 ? entry.metrics.totalArea : null),
    format: (value) => formatArea(value),
  },
  {
    kind: 'metric',
    label: 'Precio por m²',
    better: 'low',
    getValue: (entry) => entry.metrics.pricePerM2,
    format: (value) => `${formatCLP(Math.round(value))}/m²`,
  },
  {
    kind: 'metric',
    label: 'Dormitorios',
    better: 'high',
    getValue: (entry) => entry.metrics.bedroomCount,
    format: (value) => formatNumber(value),
  },
  {
    kind: 'metric',
    label: 'Baños',
    better: 'high',
    getValue: (entry) => entry.metrics.bathroomCount,
    format: (value) => formatNumber(value),
  },
  {
    kind: 'text',
    label: 'Tina / Ducha',
    getValue: (entry) =>
      entry.metrics.bathroomCount === 0
        ? '—'
        : `${entry.metrics.tubCount} tina · ${entry.metrics.showerCount} ducha`,
  },
  {
    kind: 'text',
    label: 'Cocina',
    getValue: (entry) => {
      if (!entry.property.kitchen_type) {
        return entry.metrics.kitchenArea ? formatArea(entry.metrics.kitchenArea) : '—'
      }
      const typeLabel = kitchenTypeLabels[entry.property.kitchen_type]
      return entry.metrics.kitchenArea
        ? `${typeLabel} · ${formatArea(entry.metrics.kitchenArea)}`
        : typeLabel
    },
  },
  {
    kind: 'flag',
    label: 'Living/comedor separados',
    getValue: (entry) => entry.property.living_dining_separated,
  },
  {
    kind: 'metric',
    label: 'Patio',
    better: 'high',
    getValue: (entry) => patioScore(entry.property),
    format: (value, entry) => {
      if (!entry.property.has_patio) {
        return 'Sin patio'
      }
      return value > 0 ? formatArea(value) : 'Sí'
    },
  },
  {
    kind: 'flag',
    label: 'Quincho',
    getValue: (entry) => entry.property.has_quincho,
  },
  {
    kind: 'flag',
    label: 'Termopanel',
    getValue: (entry) => entry.property.has_thermopane,
  },
  {
    kind: 'metric',
    label: 'Seguridad',
    better: 'high',
    getValue: (entry) => securityScore(entry.property),
    format: (_value, entry) => securityLabel(entry.property),
  },
  {
    kind: 'flag',
    label: 'Logia',
    getValue: (entry) => entry.property.has_laundry,
  },
  {
    kind: 'flag',
    label: 'Walk-in clóset',
    getValue: (entry) => entry.property.master_walkin_closet,
  },
]

const stickyColumnStyles = {
  position: 'sticky',
  left: 0,
  backgroundColor: tokens.surface,
  borderRight: `1px solid ${tokens.border}`,
  minWidth: { xs: 132, sm: 170 },
} as const

const MetricCells = ({ row, entries }: { row: MetricRowDef; entries: BenchmarkEntry[] }) => {
  const values = entries.map(row.getValue)
  const present = values.filter((value): value is number => value !== null)
  const min = present.length > 0 ? Math.min(...present) : 0
  const max = present.length > 0 ? Math.max(...present) : 0
  const allEqual = max === min

  return (
    <>
      {entries.map((entry, index) => {
        const value = values[index] ?? null
        if (value === null) {
          return (
            <TableCell key={entry.property.id} align="center">
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                —
              </Typography>
            </TableCell>
          )
        }
        if (allEqual || present.length < 2) {
          return (
            <TableCell key={entry.property.id} align="center">
              <Typography variant="body2" sx={{ ...tabularNums, fontWeight: 600 }}>
                {row.format(value, entry)}
              </Typography>
            </TableCell>
          )
        }
        const ratio = (value - min) / (max - min)
        const t = row.better === 'high' ? ratio : 1 - ratio
        const colors = heatmapColor(t)
        return (
          <TableCell key={entry.property.id} align="center">
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: colors.background,
                color: colors.color,
                ...tabularNums,
              }}
            >
              {row.format(value, entry)}
            </Box>
          </TableCell>
        )
      })}
    </>
  )
}

export const ComparisonTable = ({ entries }: { entries: BenchmarkEntry[] }) => (
  <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
    <Box sx={{ overflow: 'auto', maxHeight: '72vh' }}>
      <Table stickyHeader sx={{ minWidth: 170 + entries.length * 180 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                ...stickyColumnStyles,
                zIndex: 4,
                backgroundColor: tokens.surfaceRaised,
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Variable
              </Typography>
            </TableCell>
            {entries.map((entry) => (
              <TableCell
                key={entry.property.id}
                align="center"
                sx={{ backgroundColor: tokens.surfaceRaised, minWidth: 180 }}
              >
                <Stack spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: 'text.primary', maxWidth: 200 }}
                    noWrap
                  >
                    {entry.property.alias}
                  </Typography>
                  <StatusBadge status={entry.property.status} />
                </Stack>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.label}
              sx={{ '&:hover td': { backgroundColor: alpha(tokens.ink, 0.02) } }}
            >
              <TableCell sx={{ ...stickyColumnStyles, zIndex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  {row.label}
                </Typography>
              </TableCell>
              {row.kind === 'metric' ? (
                <MetricCells row={row} entries={entries} />
              ) : (
                entries.map((entry) => (
                  <TableCell key={entry.property.id} align="center">
                    {row.kind === 'flag' ? (
                      row.getValue(entry) ? (
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: alpha(tokens.accent, 0.14),
                            color: tokens.accentBright,
                          }}
                        >
                          <CheckRounded sx={{ fontSize: 16 }} />
                        </Box>
                      ) : (
                        <RemoveRounded sx={{ fontSize: 18, color: 'text.disabled' }} />
                      )
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.primary', ...tabularNums }}>
                        {row.getValue(entry)}
                      </Typography>
                    )}
                  </TableCell>
                ))
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  </Paper>
)
