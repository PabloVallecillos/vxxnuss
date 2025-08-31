"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text3D, Environment, useGLTF } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import type * as THREE from "three"

function CrescentMoonModel(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/crescent_moon/scene.gltf") as any
  const groupRef = useRef<THREE.Group>(null)

  // Apply chrome/silver material once the scene is loaded
  useEffect(() => {
    if (!scene) return
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        if (obj.material) {
          obj.material.metalness = 1.0
          obj.material.roughness = 0.15
          obj.material.color = { r: 0.82, g: 0.83, b: 0.85 }
          obj.material.envMapIntensity = 1.2
          obj.material.needsUpdate = true
        }
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.2
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[360, 0, 90]} scale={[.3, .3, .3]} {...props}>
      {/* Apply chrome material to the model */}
      <primitive object={scene} />
    </group>
  )
}

// Optional: Preload model
useGLTF.preload("/models/crescent_moon/scene.gltf")

function FloatingLetter({ char, position = [0, 0, 0], floatAmp = 0.2, floatSpeed = 1.0, rotSpeed = 0.5 }: {
  char: string
  position?: [number, number, number]
  floatAmp?: number
  floatSpeed?: number
  rotSpeed?: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const t0 = useMemo(() => 0, [])

  // Per-letter tuning to ensure consistent 3D look
  const isR = char === 'R'
  const size = 0.5
  const height = isR ? 0.22 : 0.18
  const curveSegments = isR ? 24 : 16
  const bevelThickness = isR ? 0.05 : 0.04
  const bevelSize = isR ? 0.035 : 0.03
  const bevelSegments = isR ? 10 : 8
  const baseYaw = isR ? 0.12 : 0 // slight angle so highlights match N/W

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * floatSpeed + t0
    // base position
    const [x, y, z] = position
    // gentle floating and subtle rotation
    ref.current.position.set(x, y + Math.sin(t) * floatAmp, z + Math.cos(t * 0.7) * (floatAmp * 0.4))
    ref.current.rotation.y = baseYaw + Math.sin(t * 0.6) * rotSpeed * 0.3
    ref.current.rotation.x = Math.cos(t * 0.4) * rotSpeed * 0.15
  })

  return (
    <Text3D
      ref={ref as any}
      font="/fonts/Anton_Regular.typeface.json"
      size={size}
      height={height}
      curveSegments={curveSegments}
      bevelEnabled
      bevelThickness={bevelThickness}
      bevelSize={bevelSize}
      bevelOffset={0}
      bevelSegments={bevelSegments}
    >
      {char}
      <meshStandardMaterial color="#d2d6db" roughness={0.15} metalness={1.0} envMapIntensity={1.2} />
    </Text3D>
  )
}

function ResponsiveWord() {
  const letters = "VXXNUSS".split("")
  // Use the current viewport width to scale the whole word so it fits on small screens
  const { viewport } = useThree()
  const spacing = 0.5 // base spacing in world units before scaling
  const totalWidth = (letters.length - 1) * spacing
  // Scale factor clamps between 0.6 and 1.0, grows with viewport width
  const s = Math.max(0.6, Math.min(1.0, viewport.width / 10))

  return (
    <group scale={[s, s, s]}>
      {letters.map((ch, i) => {
        const x = -totalWidth / 2 + i * spacing
        return (
          <FloatingLetter key={i} char={ch} position={[x, 0, 0]} floatAmp={0.15} floatSpeed={0.9} rotSpeed={0.45} />
        )
      })}
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

        {/* Entorno estrellado con HDRI local para producción */}
        <Environment files="/dikhololo_night_1k.hdr" background blur={0.5} />

        {/* Modelos 3D */}
        <CrescentMoonModel />

        {/* Letras 3D sueltas y flotando (cromadas como la luna) */}
        <ResponsiveWord />

        {/* Controles suaves */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>


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
