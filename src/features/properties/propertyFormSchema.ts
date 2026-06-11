import { z } from 'zod'
import type { PropertyInsert } from '../../lib/database.types'
import type { BathroomDraft, RoomDraft } from './api'
import type { PropertyWithRelations } from './types'

const MAX_DEPOSIT_MONTHS = 12

export const normalizeDecimalInput = (value: string): string => value.trim().replace(',', '.')

export const parseDimensionInput = (value: string): number | null => {
  const normalized = normalizeDecimalInput(value)
  if (normalized === '') {
    return null
  }
  const parsed = Number(normalized)
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
}

const normalizeMoneyInput = (value: string): string => value.trim().replace(/\./g, '')

const isValidUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const requiredText = z.string().trim().min(1, 'Campo requerido')

const optionalText = z.string().transform((value) => {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
})

const requiredMoney = z
  .string()
  .refine((value) => {
    const normalized = normalizeMoneyInput(value)
    return (
      normalized !== '' && Number.isInteger(Number(normalized)) && Number(normalized) > 0
    )
  }, 'Ingresa un monto válido en CLP')
  .transform((value) => Number(normalizeMoneyInput(value)))

const optionalMoney = z
  .string()
  .refine((value) => {
    const normalized = normalizeMoneyInput(value)
    return (
      normalized === '' || (Number.isInteger(Number(normalized)) && Number(normalized) >= 0)
    )
  }, 'Monto inválido')
  .transform((value) => {
    const normalized = normalizeMoneyInput(value)
    return normalized === '' ? null : Number(normalized)
  })

const moneyOrZero = z
  .string()
  .refine((value) => {
    const normalized = normalizeMoneyInput(value)
    return (
      normalized === '' || (Number.isInteger(Number(normalized)) && Number(normalized) >= 0)
    )
  }, 'Monto inválido')
  .transform((value) => {
    const normalized = normalizeMoneyInput(value)
    return normalized === '' ? 0 : Number(normalized)
  })

const depositMonths = z
  .string()
  .refine((value) => {
    const normalized = normalizeDecimalInput(value)
    return (
      normalized !== '' &&
      !Number.isNaN(Number(normalized)) &&
      Number(normalized) >= 0 &&
      Number(normalized) <= MAX_DEPOSIT_MONTHS
    )
  }, `Entre 0 y ${MAX_DEPOSIT_MONTHS} meses`)
  .transform((value) => Number(normalizeDecimalInput(value)))

const optionalDimension = z
  .string()
  .refine((value) => {
    const normalized = normalizeDecimalInput(value)
    return normalized === '' || (!Number.isNaN(Number(normalized)) && Number(normalized) > 0)
  }, 'Medida inválida')
  .transform((value) => parseDimensionInput(value))

const optionalFloors = z
  .string()
  .refine((value) => {
    const trimmed = value.trim()
    return (
      trimmed === '' || (Number.isInteger(Number(trimmed)) && Number(trimmed) >= 1)
    )
  }, 'Número inválido')
  .transform((value) => (value.trim() === '' ? null : Number(value.trim())))

const kitchenTypeField = z
  .enum(['', 'american', 'closed'])
  .transform((value) => (value === '' ? null : value))

const patioSurfaceField = z
  .enum(['', 'dirt', 'grass', 'concrete', 'deck'])
  .transform((value) => (value === '' ? null : value))

const roomSchema = z.object({
  name: requiredText,
  length: optionalDimension,
  width: optionalDimension,
  has_closet: z.boolean(),
  is_master: z.boolean(),
})

const bathroomSchema = z.object({
  name: optionalText,
  type: z.enum(['tub', 'shower']),
  length: optionalDimension,
  width: optionalDimension,
})

export const propertyFormSchema = z
  .object({
    alias: requiredText,
    status: z.enum(['current', 'candidate']),
    listing_url: z.string().trim(),
    address: optionalText,
    monthly_rent: requiredMoney,
    has_brokerage: z.boolean(),
    brokerage_amount: optionalMoney,
    deposit_months: depositMonths,
    exit_penalty: moneyOrZero,
    floors: optionalFloors,
    kitchen_type: kitchenTypeField,
    kitchen_length: optionalDimension,
    kitchen_width: optionalDimension,
    living_dining_length: optionalDimension,
    living_dining_width: optionalDimension,
    living_dining_separated: z.boolean(),
    has_laundry: z.boolean(),
    has_patio: z.boolean(),
    patio_surface: patioSurfaceField,
    patio_covered: z.boolean(),
    patio_length: optionalDimension,
    patio_width: optionalDimension,
    has_quincho: z.boolean(),
    in_condo: z.boolean(),
    has_guards: z.boolean(),
    has_thermopane: z.boolean(),
    master_walkin_closet: z.boolean(),
    notes: optionalText,
    rooms: z.array(roomSchema),
    bathrooms: z.array(bathroomSchema),
  })
  .superRefine((values, ctx) => {
    if (values.status === 'candidate' && values.listing_url === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'La URL de la publicación es obligatoria para candidatas',
        path: ['listing_url'],
      })
    }
    if (values.listing_url !== '' && !isValidUrl(values.listing_url)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Debe ser una URL válida (incluye https://)',
        path: ['listing_url'],
      })
    }
    if (values.status === 'candidate' && values.has_brokerage && values.brokerage_amount === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ingresa el monto del corretaje',
        path: ['brokerage_amount'],
      })
    }
  })
  .transform((values) => ({
    ...values,
    listing_url: values.listing_url === '' ? null : values.listing_url,
  }))

export type PropertyFormInput = z.input<typeof propertyFormSchema>
export type PropertyFormOutput = z.output<typeof propertyFormSchema>

const numberToInput = (value: number | null): string => (value === null ? '' : String(value))

export const createDefaultFormValues = (): PropertyFormInput => ({
  alias: '',
  status: 'candidate',
  listing_url: '',
  address: '',
  monthly_rent: '',
  has_brokerage: false,
  brokerage_amount: '',
  deposit_months: '1',
  exit_penalty: '',
  floors: '',
  kitchen_type: '',
  kitchen_length: '',
  kitchen_width: '',
  living_dining_length: '',
  living_dining_width: '',
  living_dining_separated: false,
  has_laundry: false,
  has_patio: false,
  patio_surface: '',
  patio_covered: false,
  patio_length: '',
  patio_width: '',
  has_quincho: false,
  in_condo: false,
  has_guards: false,
  has_thermopane: false,
  master_walkin_closet: false,
  notes: '',
  rooms: [],
  bathrooms: [],
})

export const propertyToFormValues = (property: PropertyWithRelations): PropertyFormInput => ({
  alias: property.alias,
  status: property.status,
  listing_url: property.listing_url ?? '',
  address: property.address ?? '',
  monthly_rent: numberToInput(property.monthly_rent),
  has_brokerage: property.has_brokerage,
  brokerage_amount: numberToInput(property.brokerage_amount),
  deposit_months: numberToInput(property.deposit_months),
  exit_penalty: numberToInput(property.exit_penalty),
  floors: numberToInput(property.floors),
  kitchen_type: property.kitchen_type ?? '',
  kitchen_length: numberToInput(property.kitchen_length),
  kitchen_width: numberToInput(property.kitchen_width),
  living_dining_length: numberToInput(property.living_dining_length),
  living_dining_width: numberToInput(property.living_dining_width),
  living_dining_separated: property.living_dining_separated,
  has_laundry: property.has_laundry,
  has_patio: property.has_patio,
  patio_surface: property.patio_surface ?? '',
  patio_covered: property.patio_covered,
  patio_length: numberToInput(property.patio_length),
  patio_width: numberToInput(property.patio_width),
  has_quincho: property.has_quincho,
  in_condo: property.in_condo,
  has_guards: property.has_guards,
  has_thermopane: property.has_thermopane,
  master_walkin_closet: property.master_walkin_closet,
  notes: property.notes ?? '',
  rooms: property.rooms.map((room) => ({
    name: room.name,
    length: numberToInput(room.length),
    width: numberToInput(room.width),
    has_closet: room.has_closet,
    is_master: room.is_master,
  })),
  bathrooms: property.bathrooms.map((bathroom) => ({
    name: bathroom.name ?? '',
    type: bathroom.type,
    length: numberToInput(bathroom.length),
    width: numberToInput(bathroom.width),
  })),
})

export const toPropertyPayload = (
  values: PropertyFormOutput,
  photoPath: string | null,
): PropertyInsert => {
  const isCurrent = values.status === 'current'
  return {
    alias: values.alias,
    status: values.status,
    listing_url: values.listing_url,
    address: values.address,
    photo_path: photoPath,
    monthly_rent: values.monthly_rent,
    has_brokerage: isCurrent ? false : values.has_brokerage,
    brokerage_amount: !isCurrent && values.has_brokerage ? values.brokerage_amount : null,
    deposit_months: isCurrent ? 0 : values.deposit_months,
    exit_penalty: isCurrent ? 0 : values.exit_penalty,
    floors: values.floors,
    kitchen_type: values.kitchen_type,
    kitchen_length: values.kitchen_length,
    kitchen_width: values.kitchen_width,
    living_dining_length: values.living_dining_length,
    living_dining_width: values.living_dining_width,
    living_dining_separated: values.living_dining_separated,
    has_laundry: values.has_laundry,
    has_patio: values.has_patio,
    patio_surface: values.has_patio ? values.patio_surface : null,
    patio_covered: values.has_patio ? values.patio_covered : false,
    patio_length: values.has_patio ? values.patio_length : null,
    patio_width: values.has_patio ? values.patio_width : null,
    has_quincho: values.has_quincho,
    in_condo: values.in_condo,
    has_guards: values.has_guards,
    has_thermopane: values.has_thermopane,
    master_walkin_closet: values.master_walkin_closet,
    notes: values.notes,
  }
}

export const toRoomDrafts = (values: PropertyFormOutput): RoomDraft[] =>
  values.rooms.map((room) => ({
    name: room.name,
    length: room.length,
    width: room.width,
    has_closet: room.has_closet,
    is_master: room.is_master,
  }))

export const toBathroomDrafts = (values: PropertyFormOutput): BathroomDraft[] =>
  values.bathrooms.map((bathroom) => ({
    name: bathroom.name,
    type: bathroom.type,
    length: bathroom.length,
    width: bathroom.width,
  }))
