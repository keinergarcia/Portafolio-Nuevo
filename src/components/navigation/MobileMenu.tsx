import { NavLink } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/navigation'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/[0.06]"
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>

          <div className="shell flex h-full flex-col justify-center gap-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-4 font-display text-3xl font-semibold text-muted transition-colors',
                    isActive && 'text-gradient',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}