import { MotionConfig, motion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children?: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: RevealProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once, margin: '-80px' }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}

export interface StaggerProps {
  children: ReactNode
  className?: string
  delay?: number
  gap?: number
  once?: boolean
}

export function Stagger({ children, className, delay = 0, gap = 0.09, once = true }: StaggerProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={{ once, margin: '-80px' }}
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: gap, delayChildren: delay },
          },
        }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}

export function StaggerItem({
  children,
  className,
  y = 26,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}