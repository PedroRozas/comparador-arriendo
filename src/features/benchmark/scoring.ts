import { rectArea, type DerivedMetrics } from '../properties/calculations'
import type { PropertyWithRelations } from '../properties/types'

export interface BenchmarkEntry {
  property: PropertyWithRelations
  metrics: DerivedMetrics
}

export type WeightKey =
  | 'monthlyRent'
  | 'entryCost'
  | 'totalArea'
  | 'bedrooms'
  | 'patio'
  | 'security'

export type Weights = Record<WeightKey, number>

export const WEIGHT_KEYS: readonly WeightKey[] = [
  'monthlyRent',
  'entryCost',
  'totalArea',
  'bedrooms',
  'patio',
  'security',
]

export const WEIGHT_MAX = 10

export const DEFAULT_WEIGHTS: Weights = {
  monthlyRent: 8,
  entryCost: 5,
  totalArea: 7,
  bedrooms: 6,
  patio: 4,
  security: 3,
}

export const weightLabels: Record<WeightKey, string> = {
  monthlyRent: 'Precio mensual',
  entryCost: 'Costo de entrada',
  totalArea: 'Superficie total',
  bedrooms: 'Dormitorios',
  patio: 'Patio',
  security: 'Seguridad',
}

const SECURITY_CONDO_POINTS = 40
const SECURITY_GUARDS_POINTS = 60
const NORMALIZED_MAX = 100

export const securityScore = (property: PropertyWithRelations): number =>
  (property.in_condo ? SECURITY_CONDO_POINTS : 0) +
  (property.has_guards ? SECURITY_GUARDS_POINTS : 0)

export const securityLabel = (property: PropertyWithRelations): string => {
  if (property.in_condo && property.has_guards) {
    return 'Condominio + guardias'
  }
  if (property.has_guards) {
    return 'Guardias'
  }
  if (property.in_condo) {
    return 'Condominio'
  }
  return 'Sin seguridad'
}

export const patioScore = (property: PropertyWithRelations): number =>
  property.has_patio ? (rectArea(property.patio_length, property.patio_width) ?? 0) : 0

interface DimensionConfig {
  key: WeightKey
  betterDirection: 'low' | 'high'
  rawValue: (entry: BenchmarkEntry) => number
}

const dimensions: readonly DimensionConfig[] = [
  { key: 'monthlyRent', betterDirection: 'low', rawValue: (entry) => entry.property.monthly_rent },
  { key: 'entryCost', betterDirection: 'low', rawValue: (entry) => entry.metrics.entryCost },
  { key: 'totalArea', betterDirection: 'high', rawValue: (entry) => entry.metrics.totalArea },
  { key: 'bedrooms', betterDirection: 'high', rawValue: (entry) => entry.metrics.bedroomCount },
  { key: 'patio', betterDirection: 'high', rawValue: (entry) => patioScore(entry.property) },
  { key: 'security', betterDirection: 'high', rawValue: (entry) => securityScore(entry.property) },
]

export type NormalizedScores = Record<WeightKey, number>

export interface ScoredEntry extends BenchmarkEntry {
  normalized: NormalizedScores
  score: number
}

export const scoreEntries = (entries: BenchmarkEntry[], weights: Weights): ScoredEntry[] => {
  const normalizedByKey = new Map<WeightKey, number[]>()

  for (const dimension of dimensions) {
    const values = entries.map(dimension.rawValue)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const normalized = values.map((value) => {
      if (max === min) {
        return NORMALIZED_MAX
      }
      const ratio = (value - min) / (max - min)
      return (dimension.betterDirection === 'high' ? ratio : 1 - ratio) * NORMALIZED_MAX
    })
    normalizedByKey.set(dimension.key, normalized)
  }

  const totalWeight = WEIGHT_KEYS.reduce((sum, key) => sum + weights[key], 0)

  return entries.map((entry, index) => {
    const normalized: NormalizedScores = {
      monthlyRent: 0,
      entryCost: 0,
      totalArea: 0,
      bedrooms: 0,
      patio: 0,
      security: 0,
    }
    for (const key of WEIGHT_KEYS) {
      normalized[key] = normalizedByKey.get(key)?.[index] ?? 0
    }
    const score =
      totalWeight === 0
        ? 0
        : WEIGHT_KEYS.reduce((sum, key) => sum + weights[key] * normalized[key], 0) / totalWeight

    return { ...entry, normalized, score }
  })
}

export const sortByScore = (entries: ScoredEntry[]): ScoredEntry[] =>
  [...entries].sort((a, b) => b.score - a.score)
