import type { BathroomRow, PropertyRow, RoomRow } from '../../lib/database.types'

export interface PropertyWithRelations extends PropertyRow {
  rooms: RoomRow[]
  bathrooms: BathroomRow[]
}
