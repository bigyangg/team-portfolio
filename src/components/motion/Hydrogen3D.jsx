import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// 3D decoration for the Vision section.
// Composition: two hydrogen nuclei + bond + orbital electron + a surrounding
// neural-mesh sphere (the "AI infrastructure" layer). Whole rig rotates slowly.

const ATOM_OFFSET = 1.05

function HydrogenMolecule() {
  const groupRef = useRef(null)
  const electronRef = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.18
    }
    if (electronRef.current) {
      const r = 1.55
      electronRef.current.position.set(
        Math.cos(t * 1.8) * r,
        Math.sin(t * 0.9) * 0.45,
        Math.sin(t * 1.8) * r
      )
    }
  })

  return (
    <group ref={groupRef}>
      {/* Two H atoms */}
      <Sphere args={[0.55, 40, 40]} position={[-ATOM_OFFSET, 0, 0]}>
        <MeshDistortMaterial
          color="#10B981"
          emissive="#0D9488"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.65}
          distort={0.16}
          speed={1.4}
        />
      </Sphere>
      <Sphere args={[0.55, 40, 40]} position={[ATOM_OFFSET, 0, 0]}>
        <MeshDistortMaterial
          color="#10B981"
          emissive="#0D9488"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.65}
          distort={0.16}
          speed={1.4}
        />
      </Sphere>

      {/* Covalent bond */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.085, ATOM_OFFSET * 2, 24]} />
        <meshStandardMaterial color="#6EE7B7" emissive="#6EE7B7" emissiveIntensity={0.6} roughness={0.4} />
      </mesh>

      {/* Orbital ring */}
      <mesh rotation={[Math.PI / 2.2, 0, Math.PI / 6]}>
        <torusGeometry args={[1.55, 0.012, 16, 96]} />
        <meshBasicMaterial color="#6EE7B7" transparent opacity={0.45} />
      </mesh>

      {/* Travelling electron */}
      <mesh ref={electronRef}>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshStandardMaterial color="#ffffff" emissive="#A7F3D0" emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

// AI-network sphere: nodes distributed on a fibonacci sphere, connected by
// short lines to their nearest neighbours, the whole shell rotates.
function NeuralMesh({ count = 38, radius = 2.6 }) {
  const groupRef = useRef(null)

  const { positions, lineSegments } = useMemo(() => {
    const pts = []
    const phi = Math.PI * (Math.sqrt(5) - 1)
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = phi * i
      pts.push(new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius,
        Math.sin(theta) * r * radius
      ))
    }

    // Connect each node to its 2 nearest neighbours
    const segs = []
    for (let i = 0; i < pts.length; i++) {
      const distances = pts
        .map((p, j) => ({ idx: j, d: i === j ? Infinity : pts[i].distanceTo(p) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
      distances.forEach(({ idx }) => {
        if (idx > i) segs.push([pts[i], pts[idx]])
      })
    }

    return { positions: pts, lineSegments: segs }
  }, [count, radius])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = -t * 0.08
      groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color="#6EE7B7" transparent opacity={0.85} />
        </mesh>
      ))}
      {lineSegments.map(([a, b], i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([a, b])
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial color="#10B981" transparent opacity={0.22} />
          </line>
        )
      })}
    </group>
  )
}

function Hydrogen3D({ className = '' }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.8} color="#6EE7B7" />
          <pointLight position={[-5, -3, -5]} intensity={0.9} color="#2DD4BF" />
          <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
            <HydrogenMolecule />
          </Float>
          <NeuralMesh />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Hydrogen3D
