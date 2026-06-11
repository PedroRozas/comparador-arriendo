import type {
  BathroomInsert,
  BathroomRow,
  PropertyInsert,
  PropertyRow,
  PropertyUpdate,
  RoomInsert,
  RoomRow,
} from '../../lib/database.types'
import { supabase } from '../../lib/supabase'
import { removePropertyPhoto } from './storage'
import type { PropertyWithRelations } from './types'

export type RoomDraft = Omit<RoomInsert, 'property_id' | 'id'>
export type BathroomDraft = Omit<BathroomInsert, 'property_id' | 'id'>

const groupByProperty = <T extends { property_id: string }>(rows: T[]): Map<string, T[]> => {
  const grouped = new Map<string, T[]>()
  for (const row of rows) {
    const existing = grouped.get(row.property_id)
    if (existing) {
      existing.push(row)
    } else {
      grouped.set(row.property_id, [row])
    }
  }
  return grouped
}

const attachRelations = (
  properties: PropertyRow[],
  rooms: RoomRow[],
  bathrooms: BathroomRow[],
): PropertyWithRelations[] => {
  const roomsByProperty = groupByProperty(rooms)
  const bathroomsByProperty = groupByProperty(bathrooms)
  return properties.map((property) => ({
    ...property,
    rooms: roomsByProperty.get(property.id) ?? [],
    bathrooms: bathroomsByProperty.get(property.id) ?? [],
  }))
}

export const fetchProperties = async (): Promise<PropertyWithRelations[]> => {
  const [propertiesResult, roomsResult, bathroomsResult] = await Promise.all([
    supabase.from('properties').select('*').order('created_at', { ascending: true }),
    supabase.from('rooms').select('*').order('name', { ascending: true }),
    supabase.from('bathrooms').select('*').order('name', { ascending: true }),
  ])

  if (propertiesResult.error) {
    throw new Error(`No se pudieron cargar las propiedades: ${propertiesResult.error.message}`)
  }
  if (roomsResult.error) {
    throw new Error(`No se pudieron cargar las piezas: ${roomsResult.error.message}`)
  }
  if (bathroomsResult.error) {
    throw new Error(`No se pudieron cargar los baños: ${bathroomsResult.error.message}`)
  }

  return attachRelations(propertiesResult.data, roomsResult.data, bathroomsResult.data)
}

export const fetchProperty = async (id: string): Promise<PropertyWithRelations | null> => {
  const propertyResult = await supabase.from('properties').select('*').eq('id', id).maybeSingle()
  if (propertyResult.error) {
    throw new Error(`No se pudo cargar la propiedad: ${propertyResult.error.message}`)
  }
  if (!propertyResult.data) {
    return null
  }

  const [roomsResult, bathroomsResult] = await Promise.all([
    supabase.from('rooms').select('*').eq('property_id', id).order('name', { ascending: true }),
    supabase.from('bathrooms').select('*').eq('property_id', id).order('name', { ascending: true }),
  ])

  if (roomsResult.error) {
    throw new Error(`No se pudieron cargar las piezas: ${roomsResult.error.message}`)
  }
  if (bathroomsResult.error) {
    throw new Error(`No se pudieron cargar los baños: ${bathroomsResult.error.message}`)
  }

  return attachRelations([propertyResult.data], roomsResult.data, bathroomsResult.data)[0] ?? null
}

const insertChildren = async (
  propertyId: string,
  rooms: RoomDraft[],
  bathrooms: BathroomDraft[],
): Promise<void> => {
  if (rooms.length > 0) {
    const { error } = await supabase
      .from('rooms')
      .insert(rooms.map((room) => ({ ...room, property_id: propertyId })))
    if (error) {
      throw new Error(`No se pudieron guardar las piezas: ${error.message}`)
    }
  }
  if (bathrooms.length > 0) {
    const { error } = await supabase
      .from('bathrooms')
      .insert(bathrooms.map((bathroom) => ({ ...bathroom, property_id: propertyId })))
    if (error) {
      throw new Error(`No se pudieron guardar los baños: ${error.message}`)
    }
  }
}

export const createProperty = async (
  property: PropertyInsert,
  rooms: RoomDraft[],
  bathrooms: BathroomDraft[],
): Promise<string> => {
  const { data, error } = await supabase.from('properties').insert(property).select('id').single()
  if (error) {
    throw new Error(`No se pudo crear la propiedad: ${error.message}`)
  }

  try {
    await insertChildren(data.id, rooms, bathrooms)
  } catch (childError) {
    await supabase.from('properties').delete().eq('id', data.id)
    throw childError
  }

  return data.id
}

export const updateProperty = async (
  id: string,
  property: PropertyUpdate,
  rooms: RoomDraft[],
  bathrooms: BathroomDraft[],
): Promise<void> => {
  const { error } = await supabase.from('properties').update(property).eq('id', id)
  if (error) {
    throw new Error(`No se pudo actualizar la propiedad: ${error.message}`)
  }

  const [deleteRooms, deleteBathrooms] = await Promise.all([
    supabase.from('rooms').delete().eq('property_id', id),
    supabase.from('bathrooms').delete().eq('property_id', id),
  ])
  if (deleteRooms.error) {
    throw new Error(`No se pudieron actualizar las piezas: ${deleteRooms.error.message}`)
  }
  if (deleteBathrooms.error) {
    throw new Error(`No se pudieron actualizar los baños: ${deleteBathrooms.error.message}`)
  }

  await insertChildren(id, rooms, bathrooms)
}

export const deleteProperty = async (property: PropertyWithRelations): Promise<void> => {
  if (property.photo_path) {
    try {
      await removePropertyPhoto(property.photo_path)
    } catch {
      void 0
    }
  }
  const { error } = await supabase.from('properties').delete().eq('id', property.id)
  if (error) {
    throw new Error(`No se pudo eliminar la propiedad: ${error.message}`)
  }
}
