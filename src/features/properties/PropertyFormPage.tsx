import AddRounded from '@mui/icons-material/AddRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldPath,
} from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { getErrorMessage } from '../../lib/errors'
import { tabularNums, tokens } from '../../theme'
import { useAuth } from '../auth/useAuth'
import { createProperty, updateProperty } from './api'
import { formatArea } from './format'
import { bathroomTypeLabels, kitchenTypeLabels, patioSurfaceLabels } from './labels'
import { PhotoField } from './PhotoField'
import {
  createDefaultFormValues,
  parseDimensionInput,
  propertyFormSchema,
  propertyToFormValues,
  toBathroomDrafts,
  toPropertyPayload,
  toRoomDrafts,
  type PropertyFormInput,
  type PropertyFormOutput,
} from './propertyFormSchema'
import { removePropertyPhoto, uploadPropertyPhoto } from './storage'
import { usePhotoUrl } from './usePhotoUrl'
import { useProperty } from './useProperty'

type FormControl = Control<PropertyFormInput, unknown, PropertyFormOutput>

type BooleanFieldName =
  | 'has_brokerage'
  | 'has_laundry'
  | 'has_patio'
  | 'patio_covered'
  | 'has_quincho'
  | 'in_condo'
  | 'has_guards'
  | 'has_thermopane'
  | 'master_walkin_closet'
  | 'living_dining_separated'

type MoneyFieldName = 'monthly_rent' | 'brokerage_amount' | 'exit_penalty'

const moneyDisplayFormatter = new Intl.NumberFormat('es-CL')

const formatMoneyDigits = (digits: string): string =>
  digits === '' ? '' : moneyDisplayFormatter.format(Number(digits))

interface MoneyFieldProps {
  control: FormControl
  name: MoneyFieldName
  label: string
  helperText?: string
  errorMessage?: string
}

const MoneyField = ({ control, name, label, helperText, errorMessage }: MoneyFieldProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <TextField
        label={label}
        value={formatMoneyDigits(field.value)}
        onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ''))}
        onBlur={field.onBlur}
        error={Boolean(errorMessage)}
        helperText={errorMessage ?? helperText}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: <InputAdornment position="end">CLP</InputAdornment>,
            sx: tabularNums,
          },
          htmlInput: { inputMode: 'numeric' },
        }}
      />
    )}
  />
)

interface DimensionsFieldProps {
  control: FormControl
  lengthName: FieldPath<PropertyFormInput>
  widthName: FieldPath<PropertyFormInput>
  label: string
  size?: 'small' | 'medium'
  lengthError?: string
  widthError?: string
}

const DimensionsField = ({
  control,
  lengthName,
  widthName,
  label,
  size = 'medium',
  lengthError,
  widthError,
}: DimensionsFieldProps) => {
  const lengthValue = useWatch({ control, name: lengthName })
  const widthValue = useWatch({ control, name: widthName })

  const length = parseDimensionInput(typeof lengthValue === 'string' ? lengthValue : '')
  const width = parseDimensionInput(typeof widthValue === 'string' ? widthValue : '')
  const area = length !== null && width !== null ? length * width : null

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', mb: 0.75, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Controller
          control={control}
          name={lengthName}
          render={({ field }) => (
            <TextField
              placeholder="Largo"
              size={size}
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              error={Boolean(lengthError)}
              helperText={lengthError}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  sx: tabularNums,
                },
                htmlInput: { inputMode: 'decimal', 'aria-label': `${label}: largo en metros` },
              }}
            />
          )}
        />
        <Typography sx={{ color: 'text.disabled', flexShrink: 0 }}>×</Typography>
        <Controller
          control={control}
          name={widthName}
          render={({ field }) => (
            <TextField
              placeholder="Ancho"
              size={size}
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              error={Boolean(widthError)}
              helperText={widthError}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  sx: tabularNums,
                },
                htmlInput: { inputMode: 'decimal', 'aria-label': `${label}: ancho en metros` },
              }}
            />
          )}
        />
        <Box
          component="span"
          sx={{
            flexShrink: 0,
            px: 1.25,
            py: 0.625,
            borderRadius: 2,
            fontSize: '0.8125rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            ...tabularNums,
            color: area !== null ? tokens.accentBright : 'text.disabled',
            backgroundColor:
              area !== null ? alpha(tokens.accent, 0.12) : 'rgba(148, 163, 184, 0.08)',
            border: `1px solid ${area !== null ? alpha(tokens.accent, 0.3) : tokens.border}`,
          }}
        >
          {area !== null ? `= ${formatArea(area)}` : '— m²'}
        </Box>
      </Stack>
    </Box>
  )
}

interface SwitchFieldProps {
  control: FormControl
  name: BooleanFieldName
  label: string
  hint?: string
}

const SwitchField = ({ control, name, label, hint }: SwitchFieldProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1.5,
          borderRadius: 2.5,
          border: `1px solid ${tokens.border}`,
          backgroundColor: 'rgba(255, 255, 255, 0.015)',
        }}
      >
        <Box>
          <Typography variant="subtitle2">{label}</Typography>
          {hint ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {hint}
            </Typography>
          ) : null}
        </Box>
        <Switch
          checked={field.value}
          onChange={(event) => field.onChange(event.target.checked)}
          slotProps={{ input: { 'aria-label': label } }}
        />
      </Box>
    )}
  />
)

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
}

const FormSection = ({ title, description, children }: FormSectionProps) => (
  <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}>
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h2">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
    {children}
  </Paper>
)

const fieldGrid = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
  gap: 2.5,
} as const

const FormSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={64} sx={{ borderRadius: 3, maxWidth: 420 }} />
    <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
    <Skeleton variant="rounded" height={280} sx={{ borderRadius: 4 }} />
  </Stack>
)

export const PropertyFormPage = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { session } = useAuth()
  const { property, isLoading: isLoadingProperty, error: loadError } = useProperty(id)

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput, unknown, PropertyFormOutput>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: createDefaultFormValues(),
  })

  const roomsArray = useFieldArray({ control, name: 'rooms' })
  const bathroomsArray = useFieldArray({ control, name: 'bathrooms' })

  const status = useWatch({ control, name: 'status' })
  const hasBrokerage = useWatch({ control, name: 'has_brokerage' })
  const hasPatio = useWatch({ control, name: 'has_patio' })
  const isCurrent = status === 'current'

  useEffect(() => {
    if (property) {
      reset(propertyToFormValues(property))
    }
  }, [property, reset])

  const existingPhotoPath = photoFile || photoRemoved ? null : (property?.photo_path ?? null)
  const { url: existingPhotoUrl, isLoading: isLoadingPhoto } = usePhotoUrl(existingPhotoPath)

  const localPreviewUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  )

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  const handleSelectPhoto = (file: File) => {
    setPhotoFile(file)
    setPhotoRemoved(false)
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoRemoved(true)
  }

  const handleMasterChange = (index: number, checked: boolean) => {
    if (checked) {
      roomsArray.fields.forEach((_, otherIndex) => {
        if (otherIndex !== index) {
          setValue(`rooms.${otherIndex}.is_master`, false)
        }
      })
    }
    setValue(`rooms.${index}.is_master`, checked)
  }

  const onSubmit = async (values: PropertyFormOutput) => {
    setSubmitError(null)
    try {
      const userId = session?.user.id
      if (!userId) {
        throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
      }

      let photoPath = photoRemoved ? null : (property?.photo_path ?? null)
      if (photoFile) {
        photoPath = await uploadPropertyPhoto(userId, photoFile)
      }

      const payload = toPropertyPayload(values, photoPath)
      const rooms = toRoomDrafts(values)
      const bathrooms = toBathroomDrafts(values)

      if (isEdit && property) {
        await updateProperty(property.id, payload, rooms, bathrooms)
        if ((photoFile || photoRemoved) && property.photo_path) {
          try {
            await removePropertyPhoto(property.photo_path)
          } catch {
            void 0
          }
        }
        navigate(`/properties/${property.id}`)
      } else {
        const newId = await createProperty(payload, rooms, bathrooms)
        navigate(`/properties/${newId}`)
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (isEdit && isLoadingProperty) {
    return <FormSkeleton />
  }

  if (isEdit && (loadError || !property)) {
    return (
      <Alert severity="error">
        {loadError ?? 'No se encontró la propiedad que intentas editar.'}
      </Alert>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3.5}>
        <SectionHeader
          size="page"
          eyebrow={isEdit ? 'Editar' : 'Nueva propiedad'}
          title={isEdit ? (property?.alias ?? 'Editar propiedad') : 'Agregar una casa'}
          description="Mientras más completos los datos, más útil será el benchmark."
        />

        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <FormSection title="Identificación" description="Lo esencial para reconocer la casa.">
          <Box sx={fieldGrid}>
            <TextField
              label="Alias"
              placeholder="Casa actual, Linderos opción 1…"
              error={Boolean(errors.alias)}
              helperText={errors.alias?.message}
              {...register('alias')}
            />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 0.75, fontWeight: 500 }}
                  >
                    Estado
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    value={field.value}
                    onChange={(_, value: string | null) => {
                      if (value === 'current' || value === 'candidate') {
                        field.onChange(value)
                      }
                    }}
                  >
                    <ToggleButton value="current">Casa actual</ToggleButton>
                    <ToggleButton value="candidate">Candidata</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}
            />
            {!isCurrent ? (
              <TextField
                label="URL de la publicación"
                placeholder="https://…"
                error={Boolean(errors.listing_url)}
                helperText={errors.listing_url?.message}
                {...register('listing_url')}
              />
            ) : null}
            <TextField
              label="Dirección (opcional)"
              helperText="Se usa para mostrar el mapa en la ficha"
              error={Boolean(errors.address)}
              {...register('address')}
            />
            <Box sx={{ gridColumn: { sm: 'span 2' } }}>
              <PhotoField
                previewUrl={localPreviewUrl ?? existingPhotoUrl}
                isLoadingExisting={isLoadingPhoto}
                onSelect={handleSelectPhoto}
                onRemove={handleRemovePhoto}
              />
            </Box>
          </Box>
        </FormSection>

        <FormSection
          title="Costos"
          description={
            isCurrent
              ? 'Tu casa actual es la línea base: solo necesitamos el arriendo que pagas hoy.'
              : 'Arriendo y todo lo que tendrías que pagar para entrar.'
          }
        >
          <Box sx={fieldGrid}>
            <MoneyField
              control={control}
              name="monthly_rent"
              label={isCurrent ? 'Arriendo mensual actual' : 'Arriendo mensual'}
              errorMessage={errors.monthly_rent?.message}
            />
            {!isCurrent ? (
              <>
                <TextField
                  label="Garantía"
                  error={Boolean(errors.deposit_months)}
                  helperText={errors.deposit_months?.message ?? 'En meses de arriendo'}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">meses</InputAdornment>,
                      sx: tabularNums,
                    },
                    htmlInput: { inputMode: 'decimal' },
                  }}
                  {...register('deposit_months')}
                />
                <SwitchField
                  control={control}
                  name="has_brokerage"
                  label="Corretaje"
                  hint="¿La publicación cobra comisión?"
                />
                {hasBrokerage ? (
                  <MoneyField
                    control={control}
                    name="brokerage_amount"
                    label="Monto del corretaje"
                    errorMessage={errors.brokerage_amount?.message}
                  />
                ) : (
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
                )}
                <MoneyField
                  control={control}
                  name="exit_penalty"
                  label="Salida anticipada (casa actual)"
                  helperText="Lo que pagarías en tu arriendo actual por salir antes del plazo, ej. medio mes"
                  errorMessage={errors.exit_penalty?.message}
                />
              </>
            ) : null}
          </Box>
        </FormSection>

        <FormSection title="Interior" description="Distribución y terminaciones.">
          <Box sx={fieldGrid}>
            <TextField
              label="Pisos"
              error={Boolean(errors.floors)}
              helperText={errors.floors?.message}
              slotProps={{
                input: { sx: tabularNums },
                htmlInput: { inputMode: 'numeric' },
              }}
              {...register('floors')}
            />
            <Controller
              control={control}
              name="kitchen_type"
              render={({ field }) => (
                <TextField select label="Tipo de cocina" value={field.value} onChange={field.onChange}>
                  <MenuItem value="">Sin especificar</MenuItem>
                  <MenuItem value="american">{kitchenTypeLabels.american}</MenuItem>
                  <MenuItem value="closed">{kitchenTypeLabels.closed}</MenuItem>
                </TextField>
              )}
            />
            <DimensionsField
              control={control}
              lengthName="kitchen_length"
              widthName="kitchen_width"
              label="Cocina (largo × ancho)"
              lengthError={errors.kitchen_length?.message}
              widthError={errors.kitchen_width?.message}
            />
            <DimensionsField
              control={control}
              lengthName="living_dining_length"
              widthName="living_dining_width"
              label="Living-comedor (largo × ancho)"
              lengthError={errors.living_dining_length?.message}
              widthError={errors.living_dining_width?.message}
            />
            <SwitchField
              control={control}
              name="living_dining_separated"
              label="Living y comedor separados"
            />
            <SwitchField control={control} name="has_laundry" label="Logia" />
            <SwitchField control={control} name="has_thermopane" label="Termopanel" />
            <SwitchField
              control={control}
              name="master_walkin_closet"
              label="Walk-in clóset"
              hint="En la pieza principal"
            />
          </Box>
        </FormSection>

        <FormSection title="Piezas" description="Agrega cada dormitorio y mide sus dos lados.">
          <Stack spacing={2}>
            {roomsArray.fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 1.6fr auto auto auto' },
                  gap: 2,
                  alignItems: 'end',
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${tokens.border}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.015)',
                }}
              >
                <TextField
                  label="Nombre"
                  size="small"
                  error={Boolean(errors.rooms?.[index]?.name)}
                  helperText={errors.rooms?.[index]?.name?.message}
                  {...register(`rooms.${index}.name`)}
                />
                <DimensionsField
                  control={control}
                  lengthName={`rooms.${index}.length`}
                  widthName={`rooms.${index}.width`}
                  label="Medidas"
                  size="small"
                  lengthError={errors.rooms?.[index]?.length?.message}
                  widthError={errors.rooms?.[index]?.width?.message}
                />
                <Controller
                  control={control}
                  name={`rooms.${index}.has_closet`}
                  render={({ field: closetField }) => (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pb: 0.75 }}>
                      <Switch
                        checked={closetField.value}
                        onChange={(event) => closetField.onChange(event.target.checked)}
                        slotProps={{ input: { 'aria-label': 'Clóset' } }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Clóset
                      </Typography>
                    </Stack>
                  )}
                />
                <Controller
                  control={control}
                  name={`rooms.${index}.is_master`}
                  render={({ field: masterField }) => (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pb: 0.75 }}>
                      <Switch
                        checked={masterField.value}
                        onChange={(event) => handleMasterChange(index, event.target.checked)}
                        slotProps={{ input: { 'aria-label': 'Pieza principal' } }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Principal
                      </Typography>
                    </Stack>
                  )}
                />
                <IconButton
                  aria-label="Eliminar pieza"
                  onClick={() => roomsArray.remove(index)}
                  sx={{ color: 'text.secondary', mb: 0.5, '&:hover': { color: tokens.dangerBright } }}
                >
                  <DeleteOutlineRounded fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRounded />}
              onClick={() =>
                roomsArray.append({
                  name: `Pieza ${roomsArray.fields.length + 1}`,
                  length: '',
                  width: '',
                  has_closet: false,
                  is_master: roomsArray.fields.length === 0,
                })
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              Agregar pieza
            </Button>
          </Stack>
        </FormSection>

        <FormSection title="Baños" description="Tina o ducha, con sus dos lados.">
          <Stack spacing={2}>
            {bathroomsArray.fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1fr auto 1.6fr auto' },
                  gap: 2,
                  alignItems: 'end',
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${tokens.border}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.015)',
                }}
              >
                <TextField
                  label="Nombre (opcional)"
                  size="small"
                  placeholder="Baño principal, de visitas…"
                  {...register(`bathrooms.${index}.name`)}
                />
                <Controller
                  control={control}
                  name={`bathrooms.${index}.type`}
                  render={({ field: typeField }) => (
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      sx={{ mb: 0.25 }}
                      value={typeField.value}
                      onChange={(_, value: string | null) => {
                        if (value === 'tub' || value === 'shower') {
                          typeField.onChange(value)
                        }
                      }}
                    >
                      <ToggleButton value="tub">{bathroomTypeLabels.tub}</ToggleButton>
                      <ToggleButton value="shower">{bathroomTypeLabels.shower}</ToggleButton>
                    </ToggleButtonGroup>
                  )}
                />
                <DimensionsField
                  control={control}
                  lengthName={`bathrooms.${index}.length`}
                  widthName={`bathrooms.${index}.width`}
                  label="Medidas"
                  size="small"
                  lengthError={errors.bathrooms?.[index]?.length?.message}
                  widthError={errors.bathrooms?.[index]?.width?.message}
                />
                <IconButton
                  aria-label="Eliminar baño"
                  onClick={() => bathroomsArray.remove(index)}
                  sx={{ color: 'text.secondary', mb: 0.5, '&:hover': { color: tokens.dangerBright } }}
                >
                  <DeleteOutlineRounded fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRounded />}
              onClick={() =>
                bathroomsArray.append({ name: '', type: 'shower', length: '', width: '' })
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              Agregar baño
            </Button>
          </Stack>
        </FormSection>

        <FormSection title="Exterior" description="Patio, quincho y entorno.">
          <Box sx={fieldGrid}>
            <SwitchField control={control} name="has_patio" label="Patio" />
            <SwitchField control={control} name="has_quincho" label="Quincho" />
            {hasPatio ? (
              <>
                <Controller
                  control={control}
                  name="patio_surface"
                  render={({ field }) => (
                    <TextField
                      select
                      label="Superficie del patio"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <MenuItem value="">Sin especificar</MenuItem>
                      <MenuItem value="dirt">{patioSurfaceLabels.dirt}</MenuItem>
                      <MenuItem value="grass">{patioSurfaceLabels.grass}</MenuItem>
                      <MenuItem value="concrete">{patioSurfaceLabels.concrete}</MenuItem>
                      <MenuItem value="deck">{patioSurfaceLabels.deck}</MenuItem>
                    </TextField>
                  )}
                />
                <DimensionsField
                  control={control}
                  lengthName="patio_length"
                  widthName="patio_width"
                  label="Patio (largo × ancho)"
                  lengthError={errors.patio_length?.message}
                  widthError={errors.patio_width?.message}
                />
                <SwitchField control={control} name="patio_covered" label="Patio techado" />
              </>
            ) : null}
            <SwitchField control={control} name="in_condo" label="Condominio" />
            <SwitchField control={control} name="has_guards" label="Guardias" />
          </Box>
        </FormSection>

        <FormSection title="Notas" description="Cualquier detalle que no quieras olvidar.">
          <TextField
            multiline
            minRows={4}
            fullWidth
            placeholder="Olor a humedad en el segundo piso, vecinos ruidosos, cerca del metro…"
            {...register('notes')}
          />
        </FormSection>

        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            py: 2,
            px: { xs: 2, md: 3 },
            mx: { xs: -2, md: -3 },
            backdropFilter: 'blur(12px)',
            backgroundColor: alpha(tokens.bg, 0.78),
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          <Button variant="text" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear propiedad'}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
