export type PropertyStatus = 'current' | 'candidate'
export type KitchenType = 'american' | 'closed'
export type PatioSurface = 'dirt' | 'grass' | 'concrete' | 'deck'
export type BathroomType = 'tub' | 'shower'

export type PropertyRow = {
  id: string
  user_id: string
  created_at: string
  alias: string
  status: PropertyStatus
  listing_url: string | null
  address: string | null
  photo_path: string | null
  monthly_rent: number
  has_brokerage: boolean
  brokerage_amount: number | null
  deposit_months: number
  exit_penalty: number
  floors: number | null
  kitchen_type: KitchenType | null
  kitchen_length: number | null
  kitchen_width: number | null
  living_dining_length: number | null
  living_dining_width: number | null
  living_dining_separated: boolean
  has_laundry: boolean
  has_patio: boolean
  patio_surface: PatioSurface | null
  patio_covered: boolean
  patio_length: number | null
  patio_width: number | null
  has_quincho: boolean
  in_condo: boolean
  has_guards: boolean
  has_thermopane: boolean
  master_walkin_closet: boolean
  notes: string | null
}

export type PropertyInsert = {
  id?: string
  user_id?: string
  created_at?: string
  alias: string
  status: PropertyStatus
  listing_url?: string | null
  address?: string | null
  photo_path?: string | null
  monthly_rent: number
  has_brokerage?: boolean
  brokerage_amount?: number | null
  deposit_months?: number
  exit_penalty?: number
  floors?: number | null
  kitchen_type?: KitchenType | null
  kitchen_length?: number | null
  kitchen_width?: number | null
  living_dining_length?: number | null
  living_dining_width?: number | null
  living_dining_separated?: boolean
  has_laundry?: boolean
  has_patio?: boolean
  patio_surface?: PatioSurface | null
  patio_covered?: boolean
  patio_length?: number | null
  patio_width?: number | null
  has_quincho?: boolean
  in_condo?: boolean
  has_guards?: boolean
  has_thermopane?: boolean
  master_walkin_closet?: boolean
  notes?: string | null
}

export type PropertyUpdate = Partial<PropertyInsert>

export type RoomRow = {
  id: string
  property_id: string
  name: string
  length: number | null
  width: number | null
  has_closet: boolean
  is_master: boolean
}

export type RoomInsert = {
  id?: string
  property_id: string
  name: string
  length?: number | null
  width?: number | null
  has_closet?: boolean
  is_master?: boolean
}

export type RoomUpdate = Partial<RoomInsert>

export type BathroomRow = {
  id: string
  property_id: string
  name: string | null
  type: BathroomType
  length: number | null
  width: number | null
}

export type BathroomInsert = {
  id?: string
  property_id: string
  name?: string | null
  type: BathroomType
  length?: number | null
  width?: number | null
}

export type BathroomUpdate = Partial<BathroomInsert>

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: PropertyRow
        Insert: PropertyInsert
        Update: PropertyUpdate
        Relationships: []
      }
      rooms: {
        Row: RoomRow
        Insert: RoomInsert
        Update: RoomUpdate
        Relationships: [
          {
            foreignKeyName: 'rooms_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
        ]
      }
      bathrooms: {
        Row: BathroomRow
        Insert: BathroomInsert
        Update: BathroomUpdate
        Relationships: [
          {
            foreignKeyName: 'bathrooms_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
