"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere, Text3D, Environment, Icosahedron, Edges } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2 // Rotación lenta
    }
  })

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]} position={[0, 1, 0]}>
      <meshStandardMaterial color="#f8f9fa" roughness={0.8} metalness={0.1} normalScale={[0.5, 0.5]} />
      {/* Cráteres simulados con pequeñas esferas */}
      <Sphere args={[0.1, 16, 16]} position={[0.8, 0.3, 1.2]}>
        <meshStandardMaterial color="#e9ecef" roughness={0.9} />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[-0.6, -0.4, 1.5]}>
        <meshStandardMaterial color="#e9ecef" roughness={0.9} />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.2, 0.8, 1.8]}>
        <meshStandardMaterial color="#e9ecef" roughness={0.9} />
      </Sphere>
    </Sphere>
  )
}

function GraffitiText() {
  return (
    <Text3D
      font="/fonts/Geist_Bold.json"
      size={0.8}
      height={0.1}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.02}
      bevelSize={0.02}
      bevelOffset={0}
      bevelSegments={5}
      position={[-2.2, -2.5, 0]}
    >
      ANDREW
      <meshStandardMaterial
        color="#a855f7"          // lila
        roughness={0.3}
        metalness={0.7}
        emissive="#a855f7"       // mismo lila para el glow
        emissiveIntensity={0.15} // un poquito más de brillo
      />
    </Text3D>
  )
}

type GeometricCrescentMoonProps = {
  position?: [number, number, number]
  radius?: number
  detail?: 1 | 2 | 3 | 4 // nivel low-poly
  color?: string
  edgeColor?: string
  crescentOffset?: number // cuánto “muerde” la semiluna
  rotationSpeed?: number
}

export function GeometricCrescentMoon({
  position = [0, 1, 0],
  radius = 2,
  detail = 2,
  color = "#facc15",     // amarillo cálido
  edgeColor = "#fde68a", // bordes suaves
  crescentOffset = 0.75, // 0.4 (menos), 1.2 (más media luna)
  rotationSpeed = 0.2,
}: GeometricCrescentMoonProps) {
  const moonRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <group position={position}>
      {/* Luna geométrica (low-poly) */}
      <Icosahedron ref={moonRef} args={[radius, detail]} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={0.25}
          emissive={color}       // leve brillo del mismo tono
          emissiveIntensity={0.06}
        />
      </Icosahedron>

      {/* Bordes estilizados */}
      <Edges
        scale={1.002}
        threshold={12}
        renderOrder={2}
      >
        <meshBasicMaterial color={edgeColor} transparent opacity={0.85} />
      </Edges>

      {/* “Ocultador” para crear la semiluna (ligeramente mayor y desplazado) */}
      <mesh position={[crescentOffset * radius * 0.5, 0, 0]}>
        {/* usar Sphere geom para ocultar con suavidad la mordida */}
        <sphereGeometry args={[radius * 1.01, 64, 64]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  )
}

export default function HomePage() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} className="w-full h-full">
        {/* Iluminación romántica */}
        <ambientLight intensity={0.3} color="#4f46e5" />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#fbbf24" castShadow />
        <pointLight position={[-5, 2, 2]} intensity={0.5} color="#ec4899" />

        {/* Entorno estrellado */}
        <Environment preset="night" />

        {/* Modelos 3D */}
        <Moon/>
        <GraffitiText />

        {/* Controles suaves */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Overlay con mensaje romántico */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance">Te amuu ✨</h1>
        <p className="text-lg md:text-xl text-pink-200 font-light text-pretty">
          Si te queda energía, yo te veo to los días
        </p>
      </div>

      {/* Estrellas decorativas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 text-yellow-300 text-2xl animate-pulse">✦</div>
        <div className="absolute top-32 right-32 text-pink-300 text-xl animate-pulse delay-1000">✧</div>
        <div className="absolute bottom-40 left-16 text-blue-300 text-lg animate-pulse delay-2000">✦</div>
        <div className="absolute bottom-20 right-20 text-purple-300 text-2xl animate-pulse delay-500">✧</div>
        <div className="absolute top-1/2 left-8 text-yellow-200 text-sm animate-pulse delay-1500">✦</div>
        <div className="absolute top-1/3 right-12 text-pink-200 text-lg animate-pulse delay-700">✧</div>
      </div>
    </div>
  )
}
