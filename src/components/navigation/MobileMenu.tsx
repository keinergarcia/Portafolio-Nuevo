import { NavLink } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, X } from 'lucide-react'
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
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-foreground transition-colors hover:bg-white/[0.06]"
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>

          <div className="shell flex h-full flex-col justify-center">
            <p className="eyebrow mb-8">Menú</p>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3 py-3 font-display text-4xl font-semibold tracking-tight transition-colors sm:text-5xl',
                      isActive ? 'text-gradient' : 'text-muted hover:text-foreground',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <NavLink
              to="/contact"
              onClick={onClose}
              className="mt-10 inline-flex h-[3.25rem] w-fit items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-7 text-sm font-semibold text-background shadow-glow"
            >
              Trabajemos juntos
              <ArrowUpRight size={16} aria-hidden="true" />
            </NavLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
