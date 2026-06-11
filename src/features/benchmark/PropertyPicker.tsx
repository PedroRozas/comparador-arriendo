import CheckRounded from '@mui/icons-material/CheckRounded'
import LockRounded from '@mui/icons-material/LockRounded'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { tokens } from '../../theme'
import type { PropertyWithRelations } from '../properties/types'

interface PropertyPickerProps {
  properties: PropertyWithRelations[]
  selectedIds: ReadonlySet<string>
  onToggle: (id: string) => void
}

export const PropertyPicker = ({ properties, selectedIds, onToggle }: PropertyPickerProps) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
    <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
      Casas a comparar
    </Typography>
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {properties.map((property) => {
        const isCurrent = property.status === 'current'
        const isSelected = selectedIds.has(property.id)
        const chip = (
          <Chip
            key={property.id}
            label={property.alias}
            icon={
              isCurrent ? (
                <LockRounded sx={{ fontSize: 14 }} />
              ) : isSelected ? (
                <CheckRounded sx={{ fontSize: 15 }} />
              ) : undefined
            }
            onClick={isCurrent ? undefined : () => onToggle(property.id)}
            sx={{
              px: 0.5,
              py: 2.25,
              borderRadius: 2.5,
              fontSize: '0.8125rem',
              border: `1px solid ${isSelected ? alpha(tokens.accent, 0.4) : tokens.border}`,
              backgroundColor: isSelected ? alpha(tokens.accent, 0.12) : 'transparent',
              color: isSelected ? tokens.accentBright : 'text.secondary',
              '& .MuiChip-icon': { color: 'inherit' },
              ...(isCurrent
                ? {}
                : {
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: isSelected
                        ? alpha(tokens.accent, 0.18)
                        : 'rgba(148, 163, 184, 0.08)',
                    },
                  }),
            }}
          />
        )
        return isCurrent ? (
          <Tooltip key={property.id} title="La casa actual siempre se incluye como línea base">
            {chip}
          </Tooltip>
        ) : (
          chip
        )
      })}
    </Stack>
  </Paper>
)
