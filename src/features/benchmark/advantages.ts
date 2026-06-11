import { formatArea, formatCLP } from '../properties/format'
import { patioScore, type BenchmarkEntry } from './scoring'

const pluralize = (count: number, singular: string, plural: string): string =>
  count === 1 ? singular : plural

export const buildAdvantages = (a: BenchmarkEntry, b: BenchmarkEntry): string[] => {
  const advantages: string[] = []

  const rentSaving = b.property.monthly_rent - a.property.monthly_rent
  if (rentSaving > 0) {
    advantages.push(`${formatCLP(rentSaving)} más barata al mes`)
  }

  const entrySaving = b.metrics.entryCost - a.metrics.entryCost
  if (entrySaving > 0) {
    advantages.push(`Entrada ${formatCLP(entrySaving)} más baja`)
  }

  const extraArea = a.metrics.totalArea - b.metrics.totalArea
  if (extraArea > 0) {
    advantages.push(`+${formatArea(extraArea)} de superficie total`)
  }

  if (a.metrics.pricePerM2 !== null && b.metrics.pricePerM2 !== null) {
    const pricePerM2Saving = Math.round(b.metrics.pricePerM2 - a.metrics.pricePerM2)
    if (pricePerM2Saving > 0) {
      advantages.push(`Precio por m² ${formatCLP(pricePerM2Saving)} menor`)
    }
  }

  const extraBedrooms = a.metrics.bedroomCount - b.metrics.bedroomCount
  if (extraBedrooms > 0) {
    advantages.push(`+${extraBedrooms} ${pluralize(extraBedrooms, 'dormitorio', 'dormitorios')}`)
  }

  const extraBathrooms = a.metrics.bathroomCount - b.metrics.bathroomCount
  if (extraBathrooms > 0) {
    advantages.push(`+${extraBathrooms} ${pluralize(extraBathrooms, 'baño', 'baños')}`)
  }

  if (a.metrics.tubCount > 0 && b.metrics.tubCount === 0) {
    advantages.push('Tiene tina')
  }

  const aPatio = patioScore(a.property)
  const bPatio = patioScore(b.property)
  if (a.property.has_patio && !b.property.has_patio) {
    advantages.push(aPatio > 0 ? `Tiene patio (${formatArea(aPatio)})` : 'Tiene patio')
  } else if (aPatio - bPatio > 0) {
    advantages.push(`+${formatArea(aPatio - bPatio)} de patio`)
  }

  if (a.property.has_patio && a.property.patio_covered && !b.property.patio_covered) {
    advantages.push('Patio techado')
  }

  if (a.property.has_quincho && !b.property.has_quincho) {
    advantages.push('Tiene quincho')
  }

  if (a.property.has_laundry && !b.property.has_laundry) {
    advantages.push('Tiene logia')
  }

  if (a.property.has_thermopane && !b.property.has_thermopane) {
    advantages.push('Termopanel')
  }

  if (a.property.in_condo && !b.property.in_condo) {
    advantages.push('En condominio')
  }

  if (a.property.has_guards && !b.property.has_guards) {
    advantages.push('Con guardias')
  }

  if (a.property.master_walkin_closet && !b.property.master_walkin_closet) {
    advantages.push('Walk-in clóset en la pieza principal')
  }

  return advantages
}
