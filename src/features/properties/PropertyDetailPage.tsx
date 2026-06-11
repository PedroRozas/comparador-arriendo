import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import BathtubRounded from '@mui/icons-material/BathtubRounded'
import BedRounded from '@mui/icons-material/BedRounded'
import CheckRounded from '@mui/icons-material/CheckRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import HomeRounded from '@mui/icons-material/HomeRounded'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'
import PlaceRounded from '@mui/icons-material/PlaceRounded'
import RemoveRounded from '@mui/icons-material/RemoveRounded'
import ShowerRounded from '@mui/icons-material/ShowerRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { fadeUpItem, staggerContainer } from '../../components/ui/motionPresets'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { getErrorMessage } from '../../lib/errors'
import { tabularNums, tokens } from '../../theme'
import { deleteProperty } from './api'
import { computeMetrics, rectArea } from './calculations'
import { formatArea, formatCLP, formatDimensions, formatMonths } from './format'
import { kitchenTypeLabels, patioSurfaceLabels } from './labels'
import type { PropertyWithRelations } from './types'
import { usePhotoUrl } from './usePhotoUrl'
import { useProperty } from './useProperty'

const DetailSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton width={180} height={32} />
    <Skeleton variant="rounded" height={340} sx={{ borderRadius: 5 }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={92} sx={{ borderRadius: 3 }} />
      ))}
    </Box>
    <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
  </Stack>
)

interface FeatureItem {
  label: string
  active: boolean
  detail?: string
}

const buildFeatures = (
  property: PropertyWithRelations,
  patioArea: number | null,
): FeatureItem[] => [
  { label: 'Logia', active: property.has_laundry },
  {
    label: 'Patio',
    active: property.has_patio,
    detail: patioArea !== null ? formatArea(patioArea) : undefined,
  },
  { label: 'Patio techado', active: property.has_patio && property.patio_covered },
  { label: 'Quincho', active: property.has_quincho },
  { label: 'Living/comedor separados', active: property.living_dining_separated },
  { label: 'Condominio', active: property.in_condo },
  { label: 'Guardias', active: property.has_guards },
  { label: 'Termopanel', active: property.has_thermopane },
  { label: 'Walk-in clóset', active: property.master_walkin_closet },
]

const DimensionsText = ({
  length,
  width,
}: {
  length: number | null
  width: number | null
}) => {
  const area = rectArea(length, width)
  if (area === null || length === null || width === null) {
    return (
      <Typography variant="body2" sx={{ color: 'text.disabled', minWidth: 110, textAlign: 'right' }}>
        —
      </Typography>
    )
  }
  return (
    <Stack sx={{ minWidth: 110, alignItems: 'flex-end' }}>
      <Typography variant="body2" sx={tabularNums}>
        {formatArea(area)}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', ...tabularNums }}>
        {formatDimensions(length, width)}
      </Typography>
    </Stack>
  )
}

const Hero = ({ property }: { property: PropertyWithRelations }) => {
  const { url, isLoading } = usePhotoUrl(property.photo_path)

  if (!property.photo_path) {
    return null
  }

  if (isLoading) {
    return <Skeleton variant="rounded" height={360} sx={{ borderRadius: 5 }} />
  }

  if (!url) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 5,
        overflow: 'hidden',
        border: `1px solid ${tokens.border}`,
        height: { xs: 240, md: 380 },
      }}
    >
      <Box
        component="img"
        src={url}
        alt={`Foto de ${property.alias}`}
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(200deg, transparent 40%, ${alpha(tokens.bg, 0.88)})`,
        }}
      />
      <Box sx={{ position: 'absolute', left: { xs: 2.5, md: 4 }, bottom: { xs: 2.5, md: 3.5 }, px: 1 }}>
        <StatusBadge status={property.status} floating />
        <Typography variant="h1" sx={{ mt: 1, fontSize: { xs: '2rem', md: '2.75rem' } }}>
          {property.alias}
        </Typography>
        {property.address ? (
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {property.address}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}

export const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { property, isLoading, error } = useProperty(id)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (error || !property) {
    return (
      <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Alert severity="error">{error ?? 'No se encontró esta propiedad.'}</Alert>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackRounded />}>
          Volver al listado
        </Button>
      </Stack>
    )
  }

  const metrics = computeMetrics(property)
  const isCurrent = property.status === 'current'
  const deposit = property.monthly_rent * property.deposit_months
  const brokerage = property.has_brokerage ? (property.brokerage_amount ?? 0) : 0

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteProperty(property)
      navigate('/')
    } catch (deleteFailure) {
      setDeleteError(getErrorMessage(deleteFailure))
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }

  const kpis: Array<{ label: string; value: string; detail?: string }> = [
    { label: 'Arriendo mensual', value: formatCLP(property.monthly_rent) },
    { label: 'Costo de entrada', value: isCurrent ? '$0' : formatCLP(metrics.entryCost) },
    {
      label: 'Superficie útil',
      value: metrics.usableArea > 0 ? formatArea(metrics.usableArea) : '—',
      detail: metrics.patioArea ? `+ ${formatArea(metrics.patioArea)} de patio` : undefined,
    },
    {
      label: 'Precio por m² útil',
      value: metrics.pricePerM2 ? `${formatCLP(Math.round(metrics.pricePerM2))}` : '—',
    },
  ]

  return (
    <Stack
      component={motion.div}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      spacing={3.5}
    >
      <motion.div variants={fadeUpItem}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackRounded />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Propiedades
          </Button>
          <Stack direction="row" spacing={1.5}>
            {property.listing_url ? (
              <Button
                href={property.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<OpenInNewRounded />}
              >
                Ver publicación
              </Button>
            ) : null}
            <Button
              component={RouterLink}
              to={`/properties/${property.id}/edit`}
              variant="contained"
              startIcon={<EditRounded />}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setIsDeleteOpen(true)}
              aria-label="Eliminar propiedad"
              sx={{ minWidth: 0, px: 1.5 }}
            >
              <DeleteOutlineRounded fontSize="small" />
            </Button>
          </Stack>
        </Stack>
      </motion.div>

      {deleteError ? <Alert severity="error">{deleteError}</Alert> : null}

      <motion.div variants={fadeUpItem}>
        <Hero property={property} />
        {!property.photo_path ? (
          <Box>
            <StatusBadge status={property.status} />
            <Typography variant="h1" sx={{ mt: 1.5 }}>
              {property.alias}
            </Typography>
            {property.address ? (
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {property.address}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </motion.div>

      <Box
        component={motion.div}
        variants={fadeUpItem}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {kpis.map((kpi) => (
          <Paper
            key={kpi.label}
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.015)' }}
          >
            <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
              {kpi.label}
            </Typography>
            <Typography variant="h3" component="p" sx={{ ...tabularNums, mt: 0.5 }}>
              {kpi.value}
            </Typography>
            {kpi.detail ? (
              <Typography
                variant="caption"
                sx={{ color: tokens.accentBright, fontWeight: 600, ...tabularNums }}
              >
                {kpi.detail}
              </Typography>
            ) : null}
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={3}>
          <Paper
            component={motion.div}
            variants={fadeUpItem}
            variant="outlined"
            sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}
          >
            <Typography variant="h4" component="h2" sx={{ mb: 2.5 }}>
              Distribución
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
              {property.floors ? (
                <Chip
                  label={`${property.floors} ${property.floors === 1 ? 'piso' : 'pisos'}`}
                  variant="outlined"
                />
              ) : null}
              {property.kitchen_type ? (
                <Chip
                  label={`Cocina ${kitchenTypeLabels[property.kitchen_type].toLowerCase()}${metrics.kitchenArea ? ` · ${formatArea(metrics.kitchenArea)}` : ''}`}
                  variant="outlined"
                />
              ) : null}
              {metrics.livingDiningArea ? (
                <Chip
                  label={`Living-comedor ${formatArea(metrics.livingDiningArea)}${property.living_dining_separated ? ' · separados' : ''}`}
                  variant="outlined"
                />
              ) : null}
            </Stack>
            {property.rooms.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sin piezas registradas.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {property.rooms.map((room) => (
                  <Stack
                    key={room.id}
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: 'center',
                      px: 2,
                      py: 1.5,
                      borderRadius: 2.5,
                      border: `1px solid ${tokens.border}`,
                      backgroundColor: 'rgba(255, 255, 255, 0.015)',
                    }}
                  >
                    <BedRounded sx={{ fontSize: 18, color: 'text.disabled' }} />
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {room.name}
                    </Typography>
                    {room.is_master ? (
                      <Chip
                        icon={<StarRounded sx={{ fontSize: 14 }} />}
                        label="Principal"
                        size="small"
                        sx={{
                          backgroundColor: alpha(tokens.amber, 0.12),
                          color: tokens.amberBright,
                          border: `1px solid ${alpha(tokens.amber, 0.3)}`,
                        }}
                      />
                    ) : null}
                    {room.has_closet ? <Chip label="Clóset" size="small" variant="outlined" /> : null}
                    <DimensionsText length={room.length} width={room.width} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>

          <Paper
            component={motion.div}
            variants={fadeUpItem}
            variant="outlined"
            sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}
          >
            <Typography variant="h4" component="h2" sx={{ mb: 2.5 }}>
              Baños
            </Typography>
            {property.bathrooms.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sin baños registrados.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {property.bathrooms.map((bathroom, index) => (
                  <Stack
                    key={bathroom.id}
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: 'center',
                      px: 2,
                      py: 1.5,
                      borderRadius: 2.5,
                      border: `1px solid ${tokens.border}`,
                      backgroundColor: 'rgba(255, 255, 255, 0.015)',
                    }}
                  >
                    {bathroom.type === 'tub' ? (
                      <BathtubRounded sx={{ fontSize: 18, color: 'text.disabled' }} />
                    ) : (
                      <ShowerRounded sx={{ fontSize: 18, color: 'text.disabled' }} />
                    )}
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {bathroom.name ?? `Baño ${index + 1}`}
                    </Typography>
                    <Chip
                      label={bathroom.type === 'tub' ? 'Tina' : 'Ducha'}
                      size="small"
                      sx={{
                        backgroundColor: alpha(tokens.sky, 0.1),
                        color: tokens.sky,
                        border: `1px solid ${alpha(tokens.sky, 0.25)}`,
                      }}
                    />
                    <DimensionsText length={bathroom.length} width={bathroom.width} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>

          {property.has_patio || property.notes ? (
            <Paper
              component={motion.div}
              variants={fadeUpItem}
              variant="outlined"
              sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}
            >
              {property.has_patio ? (
                <Box sx={{ mb: property.notes ? 3 : 0 }}>
                  <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                    Exterior
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={`Patio${metrics.patioArea ? ` · ${formatArea(metrics.patioArea)}` : ''}`}
                      variant="outlined"
                    />
                    {property.patio_surface ? (
                      <Chip label={patioSurfaceLabels[property.patio_surface]} variant="outlined" />
                    ) : null}
                    <Chip label={property.patio_covered ? 'Techado' : 'Sin techo'} variant="outlined" />
                    {property.has_quincho ? <Chip label="Quincho" variant="outlined" /> : null}
                  </Stack>
                </Box>
              ) : null}
              {property.notes ? (
                <Box>
                  <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
                    Notas
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                    {property.notes}
                  </Typography>
                </Box>
              ) : null}
            </Paper>
          ) : null}

          {property.address ? (
            <Paper
              component={motion.div}
              variants={fadeUpItem}
              variant="outlined"
              sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
              >
                <Typography variant="h4" component="h2">
                  Ubicación
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PlaceRounded />}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir en Google Maps
                </Button>
              </Stack>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `1px solid ${tokens.border}`,
                  filter: 'invert(0.9) hue-rotate(180deg) saturate(0.7)',
                }}
              >
                <Box
                  component="iframe"
                  title={`Mapa de ${property.address}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&z=15&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sx={{ width: '100%', height: 280, border: 0, display: 'block' }}
                />
              </Box>
            </Paper>
          ) : null}
        </Stack>

        <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
          {isCurrent ? (
            <Paper
              component={motion.div}
              variants={fadeUpItem}
              variant="outlined"
              sx={{ p: 3, borderRadius: 4, borderColor: alpha(tokens.accent, 0.3) }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <HomeRounded sx={{ color: tokens.accentBright }} />
                <Box>
                  <Typography variant="h5" component="h2">
                    Tu línea base
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Esta es tu casa actual: sin costos de entrada, sirve como referencia en el
                    benchmark.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ) : (
            <Paper
              component={motion.div}
              variants={fadeUpItem}
              variant="outlined"
              sx={{ p: 3, borderRadius: 4 }}
            >
              <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                Costo de entrada
              </Typography>
              <Stack spacing={1.5}>
                {[
                  { label: 'Primer mes', value: property.monthly_rent },
                  { label: `Garantía (${formatMonths(property.deposit_months)})`, value: deposit },
                  { label: 'Corretaje', value: brokerage },
                  { label: 'Salida anticipada (casa actual)', value: property.exit_penalty },
                ].map((row) => (
                  <Stack key={row.label} direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {row.label}
                    </Typography>
                    <Typography variant="body2" sx={tabularNums}>
                      {formatCLP(row.value)}
                    </Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">Total</Typography>
                  <Typography
                    variant="h4"
                    component="span"
                    sx={{ ...tabularNums, color: tokens.accentBright }}
                  >
                    {formatCLP(metrics.entryCost)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          )}

          <Paper
            component={motion.div}
            variants={fadeUpItem}
            variant="outlined"
            sx={{ p: 3, borderRadius: 4 }}
          >
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Características
            </Typography>
            <Stack spacing={1.25}>
              {buildFeatures(property, metrics.patioArea).map((feature) => (
                <Stack key={feature.label} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {feature.active ? (
                    <CheckRounded sx={{ fontSize: 18, color: tokens.accentBright }} />
                  ) : (
                    <RemoveRounded sx={{ fontSize: 18, color: 'text.disabled' }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{ color: feature.active ? 'text.primary' : 'text.disabled', flexGrow: 1 }}
                  >
                    {feature.label}
                  </Typography>
                  {feature.detail ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary', ...tabularNums }}>
                      {feature.detail}
                    </Typography>
                  ) : null}
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Box>

      <ConfirmDialog
        open={isDeleteOpen}
        title="Eliminar propiedad"
        description={`Se eliminará "${property.alias}" junto a sus piezas, baños y foto. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setIsDeleteOpen(false)}
      />
    </Stack>
  )
}
