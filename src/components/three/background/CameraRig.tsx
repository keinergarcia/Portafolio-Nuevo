/* oxlint-disable react/purity, react/immutability, react/set-state-in-effect -- rig de cámara: solo sincroniza pointer/scroll externos; la cámara se mantiene estática para que el fondo no se desplace con el mouse */
import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpaceState } from './space-context'

interface CameraRigProps {
  animate: boolean
}

export function CameraRig({ animate }: CameraRigProps) {
  const { pointerTarget, pointer, scroll, lastMove, lastClick } = useSpaceState()

  useEffect(() => {
    lastMove.current = performance.now()
    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointerTarget.current.y = -((event.clientY / window.innerHeight) * 2 - 1)
      lastMove.current = performance.now()
    }
    const onPointerDown = () => {
      lastClick.current = performance.now()
    }
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      scroll.current = max > 0 ? doc.scrollTop / max : 0
    }
    const onResize = () => onScroll()

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [pointerTarget, scroll, lastMove, lastClick])

  useFrame((state, delta) => {
    if (!animate) return
    const dt = Math.min(delta, 0.05)
    const damp = THREE.MathUtils.damp
    pointer.current.x = damp(pointer.current.x, pointerTarget.current.x, 2, dt)
    pointer.current.y = damp(pointer.current.y, pointerTarget.current.y, 2, dt)
    state.camera.position.set(0, 0, 8.5)
    state.camera.lookAt(0, 0, 0)
  })

  return null
}