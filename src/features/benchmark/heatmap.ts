interface Rgb {
  r: number
  g: number
  b: number
}

const WORST: Rgb = { r: 239, g: 68, b: 68 }
const MIDDLE: Rgb = { r: 245, g: 158, b: 11 }
const BEST: Rgb = { r: 16, g: 185, b: 129 }

const BACKGROUND_ALPHA = 0.14
const TEXT_LIGHTEN_RATIO = 0.4

const lerpChannel = (from: number, to: number, t: number): number =>
  Math.round(from + (to - from) * t)

const lerpRgb = (from: Rgb, to: Rgb, t: number): Rgb => ({
  r: lerpChannel(from.r, to.r, t),
  g: lerpChannel(from.g, to.g, t),
  b: lerpChannel(from.b, to.b, t),
})

const lightenChannel = (channel: number): number =>
  Math.round(channel + (255 - channel) * TEXT_LIGHTEN_RATIO)

export interface HeatmapColor {
  background: string
  color: string
}

export const heatmapColor = (t: number): HeatmapColor => {
  const clamped = Math.min(1, Math.max(0, t))
  const rgb =
    clamped < 0.5 ? lerpRgb(WORST, MIDDLE, clamped * 2) : lerpRgb(MIDDLE, BEST, (clamped - 0.5) * 2)

  return {
    background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${BACKGROUND_ALPHA})`,
    color: `rgb(${lightenChannel(rgb.r)}, ${lightenChannel(rgb.g)}, ${lightenChannel(rgb.b)})`,
  }
}
