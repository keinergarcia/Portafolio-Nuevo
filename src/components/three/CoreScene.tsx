/* oxlint-disable react/purity -- la semilla de partículas usa Math.random de forma deliberada y estable */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  Float,
  Lightformer,
  MeshDistortMaterial,
  Sparkles,
} from '@react-three/drei'
import * as THREE from 'three'
import { useMediaQuery } from '@/hooks/useMediaQuery'

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const positionArray = new Float32Array(count * 3)
    const colorArray = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#22d3ee'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#ffffff'),
    ]
    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 2.4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const index = i * 3
      positionArray[index] = radius * Math.sin(phi) * Math.cos(theta)
      positionArray[index + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positionArray[index + 2] = radius * Math.cos(phi)

      const color = palette[Math.floor(Math.random() * palette.length)]
      colorArray[index] = color.r
      colorArray[index + 1] = color.g
      colorArray[index + 2] = color.b
    }
    return { positions: positionArray, colors: colorArray }
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.035
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}

function SceneContent({ particleCount }: { particleCount: number }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    const { pointer } = state
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      pointer.x * 0.4,
      2.2,
      delta,
    )
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -pointer.y * 0.3,
      2.2,
      delta,
    )
  })

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
        <mesh>
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color="#4cc9f0"
            distort={0.32}
            speed={1.7}
            roughness={0.12}
            metalness={0.9}
            emissive="#6366f1"
            emissiveIntensity={0.4}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[1.55, 32, 32]} />
          <meshBasicMaterial wireframe color="#22d3ee" transparent opacity={0.1} />
        </mesh>

        <mesh rotation={[Math.PI / 2.4, 0.3, 0]}>
          <torusGeometry args={[2.15, 0.012, 12, 128]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} />
        </mesh>

        <mesh rotation={[Math.PI / 1.8, -0.5, 0.4]}>
          <torusGeometry args={[2.6, 0.01, 12, 128]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
        </mesh>
      </Float>

      <Particles count={particleCount} />
      <Sparkles count={60} scale={7} size={1.8} speed={0.35} opacity={0.45} />
    </group>
  )
}

interface CoreSceneProps {
  frameloop: 'always' | 'never' | 'demand'
}

export default function CoreScene({ frameloop }: CoreSceneProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Canvas
      dpr={[1, 1.6]}
      frameloop={frameloop}
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <pointLight position={[-3, 2, -2]} intensity={6} color="#22d3ee" />
      <pointLight position={[3, -1, 3]} intensity={5} color="#a78bfa" />

      <SceneContent particleCount={isMobile ? 220 : 600} />

      <Environment resolution={128}>
        <Lightformer intensity={3} position={[0, 4, -7]} scale={[8, 8, 1]} />
        <Lightformer
          intensity={1.2}
          position={[-5, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[18, 0.6, 1]}
          color="#22d3ee"
        />
        <Lightformer
          intensity={1}
          position={[5, -1, -1]}
          rotation-y={-Math.PI / 2}
          scale={[18, 0.6, 1]}
          color="#a78bfa"
        />
      </Environment>
    </Canvas>
  )
}