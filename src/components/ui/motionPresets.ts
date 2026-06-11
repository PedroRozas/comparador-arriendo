import type { Transition, Variants } from 'framer-motion'

export const easeOutExpo: Transition['ease'] = [0.16, 1, 0.3, 1]

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
}

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
}

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
}

export const hoverLift = {
  y: -4,
  transition: { duration: 0.25, ease: easeOutExpo },
}

export const layoutSpring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 36,
}
