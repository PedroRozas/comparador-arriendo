import type { PropertyWithRelations } from './types'

export const rectArea = (length: number | null, width: number | null): number | null =>
  length !== null && width !== null ? length * width : null

export interface DerivedMetrics {
  usableArea: number
  entryCost: number
  pricePerM2: number | null
  bedroomCount: number
  bathroomCount: number
  tubCount: number
  showerCount: number
  kitchenArea: number | null
  livingDiningArea: number | null
  patioArea: number | null
}

export const computeMetrics = (property: PropertyWithRelations): DerivedMetrics => {
  const kitchenArea = rectArea(property.kitchen_length, property.kitchen_width)
  const livingDiningArea = rectArea(property.living_dining_length, property.living_dining_width)
  const patioArea = property.has_patio
    ? rectArea(property.patio_length, property.patio_width)
    : null

  const roomsArea = property.rooms.reduce(
    (sum, room) => sum + (rectArea(room.length, room.width) ?? 0),
    0,
  )
  const bathroomsArea = property.bathrooms.reduce(
    (sum, bathroom) => sum + (rectArea(bathroom.length, bathroom.width) ?? 0),
    0,
  )
  const usableArea = roomsArea + bathroomsArea + (livingDiningArea ?? 0) + (kitchenArea ?? 0)

  const brokerage = property.has_brokerage ? (property.brokerage_amount ?? 0) : 0
  const entryCost =
    property.status === 'current'
      ? 0
      : property.monthly_rent +
        property.monthly_rent * property.deposit_months +
        brokerage +
        property.exit_penalty

  const tubCount = property.bathrooms.filter((bathroom) => bathroom.type === 'tub').length

  return {
    usableArea,
    entryCost,
    pricePerM2: usableArea > 0 ? property.monthly_rent / usableArea : null,
    bedroomCount: property.rooms.length,
    bathroomCount: property.bathrooms.length,
    tubCount,
    showerCount: property.bathrooms.length - tubCount,
    kitchenArea,
    livingDiningArea,
    patioArea,
  }
}
