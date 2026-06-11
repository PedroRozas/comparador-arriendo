import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { ChangeEvent } from 'react'
import { tokens } from '../../theme'

interface PhotoFieldProps {
  previewUrl: string | null
  isLoadingExisting: boolean
  onSelect: (file: File) => void
  onRemove: () => void
}

const inputId = 'property-photo-input'

export const PhotoField = ({ previewUrl, isLoadingExisting, onSelect, onRemove }: PhotoFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onSelect(file)
    }
    event.target.value = ''
  }

  if (isLoadingExisting) {
    return <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
  }

  return (
    <Box>
      <Box
        component="input"
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleChange}
        sx={{ display: 'none' }}
      />
      {previewUrl ? (
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${tokens.border}`,
            height: 220,
          }}
        >
          <Box
            component="img"
            src={previewUrl}
            alt="Foto de la propiedad"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              gap: 1,
              p: 1.5,
              background: `linear-gradient(180deg, transparent 55%, ${alpha(tokens.bg, 0.75)})`,
            }}
          >
            <Button
              component="label"
              htmlFor={inputId}
              size="small"
              variant="outlined"
              sx={{ backdropFilter: 'blur(6px)', backgroundColor: alpha(tokens.bg, 0.5) }}
            >
              Cambiar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRounded />}
              onClick={onRemove}
              sx={{ backdropFilter: 'blur(6px)', backgroundColor: alpha(tokens.bg, 0.5) }}
            >
              Quitar
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          component="label"
          htmlFor={inputId}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            height: 180,
            borderRadius: 3,
            border: `1.5px dashed ${tokens.borderStrong}`,
            cursor: 'pointer',
            transition: 'all 180ms ease',
            color: 'text.secondary',
            '&:hover': {
              borderColor: alpha(tokens.accent, 0.5),
              backgroundColor: alpha(tokens.accent, 0.04),
              color: tokens.accentBright,
            },
          }}
        >
          <AddPhotoAlternateRounded sx={{ fontSize: 30 }} />
          <Typography variant="subtitle2">Subir foto</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Se guarda en tu bucket privado
          </Typography>
        </Box>
      )}
    </Box>
  )
}
