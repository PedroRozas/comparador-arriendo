const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const areaFormatter = new Intl.NumberFormat('es-CL', {
  maximumFractionDigits: 1,
})

export const formatCLP = (value: number): string => clpFormatter.format(value)

export const formatArea = (value: number): string => `${areaFormatter.format(value)} m²`

export const formatNumber = (value: number): string => areaFormatter.format(value)

export const formatMonths = (value: number): string =>
  value === 1 ? '1 mes' : `${areaFormatter.format(value)} meses`

export const formatDimensions = (length: number, width: number): string =>
  `${areaFormatter.format(length)} × ${areaFormatter.format(width)} m`
