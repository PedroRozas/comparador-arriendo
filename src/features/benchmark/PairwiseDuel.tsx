import AddRounded from '@mui/icons-material/AddRounded'
import SwapHorizRounded from '@mui/icons-material/SwapHorizRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'
import { fontHeading, tabularNums, tokens } from '../../theme'
import { buildAdvantages } from './advantages'
import type { ScoredEntry } from './scoring'

interface PairwiseDuelProps {
  ranked: ScoredEntry[]
}

const AdvantageColumn = ({ entry, rival }: { entry: ScoredEntry; rival: ScoredEntry }) => {
  const advantages = buildAdvantages(entry, rival)

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${tokens.border}`,
        backgroundColor: 'rgba(255, 255, 255, 0.015)',
        height: '100%',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
        <Typography variant="h5" component="h3" noWrap>
          {entry.property.alias}
        </Typography>
        <Typography variant="body2" sx={{ ...tabularNums, color: 'text.secondary' }}>
          {Math.round(entry.score)} pts
        </Typography>
      </Stack>
      {advantages.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
          Sin ventajas claras frente a {rival.property.alias}.
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          {advantages.map((advantage) => (
            <Stack key={advantage} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(tokens.accent, 0.14),
                  color: tokens.accentBright,
                  flexShrink: 0,
                }}
              >
                <AddRounded sx={{ fontSize: 13 }} />
              </Box>
              <Typography variant="body2" sx={tabularNums}>
                {advantage}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  )
}

export const PairwiseDuel = ({ ranked }: PairwiseDuelProps) => {
  const [selectedAId, setSelectedAId] = useState<string | null>(null)
  const [selectedBId, setSelectedBId] = useState<string | null>(null)

  const validIds = new Set(ranked.map((entry) => entry.property.id))

  const fallbackAId =
    ranked.find((entry) => entry.property.status === 'current')?.property.id ??
    ranked[0]?.property.id ??
    null
  const effectiveAId = selectedAId && validIds.has(selectedAId) ? selectedAId : fallbackAId

  const fallbackBId =
    ranked.find((entry) => entry.property.id !== effectiveAId)?.property.id ?? null
  const effectiveBId =
    selectedBId && validIds.has(selectedBId) && selectedBId !== effectiveAId
      ? selectedBId
      : fallbackBId

  const entryA = ranked.find((entry) => entry.property.id === effectiveAId)
  const entryB = ranked.find((entry) => entry.property.id === effectiveBId)

  if (!entryA || !entryB) {
    return null
  }

  const handleSwap = () => {
    setSelectedAId(entryB.property.id)
    setSelectedBId(entryA.property.id)
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}>
      <Typography variant="h3" component="h2">
        Frente a frente
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 3 }}>
        Ventajas concretas de una casa sobre la otra.
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: 'center', mb: 3 }}
      >
        <TextField
          select
          fullWidth
          label="Casa A"
          value={entryA.property.id}
          onChange={(event) => setSelectedAId(event.target.value)}
        >
          {ranked.map((entry) => (
            <MenuItem key={entry.property.id} value={entry.property.id}>
              {entry.property.alias}
            </MenuItem>
          ))}
        </TextField>
        <Tooltip title="Intercambiar">
          <IconButton onClick={handleSwap} aria-label="Intercambiar casas" sx={{ flexShrink: 0 }}>
            <SwapHorizRounded />
          </IconButton>
        </Tooltip>
        <TextField
          select
          fullWidth
          label="Casa B"
          value={entryB.property.id}
          onChange={(event) => setSelectedBId(event.target.value)}
        >
          {ranked
            .filter((entry) => entry.property.id !== entryA.property.id)
            .map((entry) => (
              <MenuItem key={entry.property.id} value={entry.property.id}>
                {entry.property.alias}
              </MenuItem>
            ))}
        </TextField>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
          gap: 2.5,
          alignItems: 'stretch',
        }}
      >
        <AdvantageColumn entry={entryA} rival={entryB} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${tokens.borderStrong}`,
              backgroundColor: tokens.surfaceRaised,
              fontFamily: fontHeading,
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: 'text.secondary',
              letterSpacing: '0.05em',
            }}
          >
            VS
          </Box>
        </Box>
        <AdvantageColumn entry={entryB} rival={entryA} />
      </Box>
    </Paper>
  )
}
