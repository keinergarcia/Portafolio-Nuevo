import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { motion, useScroll, useSpring } from 'motion/react'
import { Navbar } from '@/components/navigation/Navbar'
import { MobileMenu } from '@/components/navigation/MobileMenu'
import { Footer } from '@/components/navigation/Footer'
import { IntroProvider } from '@/contexts/Intro'
import { SplashScreen } from '@/components/three/SplashScreen'

const GlobalBackground = lazy(() =>
  import('@/components/three/background/GlobalBackground').then((m) => ({
    default: m.GlobalBackground,
  })),
)

export function PublicLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [prevPath, setPrevPath] = useState(location.pathname)

  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  })

  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <IntroProvider>
      <div className="relative flex min-h-svh flex-col">
        <Suspense fallback={null}>
          <GlobalBackground />
        </Suspense>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-background"
        >
          Saltar al contenido
        </a>

        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
          <Navbar onOpenMenu={() => setMenuOpen(true)} />
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-primary via-secondary to-tertiary"
            style={{ scaleX: scrollProgress }}
          />
        </header>

        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main id="main-content" className="relative z-10 flex-1 pt-16">
          <Outlet />
        </main>

        <div className="relative z-10">
          <Footer />
        </div>
      </div>
      <SplashScreen />
    </IntroProvider>
  )
}