import type { BathroomType, KitchenType, PatioSurface } from '../../lib/database.types'

export const kitchenTypeLabels: Record<KitchenType, string> = {
  american: 'Americana',
  closed: 'Cerrada',
}

export const patioSurfaceLabels: Record<PatioSurface, string> = {
  dirt: 'Tierra',
  grass: 'Pasto',
  concrete: 'Cemento',
  deck: 'Deck',
}

export const bathroomTypeLabels: Record<BathroomType, string> = {
  tub: 'Tina',
  shower: 'Ducha',
}
