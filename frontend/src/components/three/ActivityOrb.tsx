import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ActivityOrbProps {
  completionPercentage?: number; // 0 to 100
  streakDays?: number;
  showCenterBadge?: boolean;
}

// Inner 3D Animated Fluid Mesh
const FluidOrbMesh: React.FC<{ completionPercentage: number }> = ({ completionPercentage }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState<boolean>(false);

  // Dynamic deformation parameters based on completion %
  const intensity = Math.max(0.2, (completionPercentage || 40) / 100);
  const speed = 0.8 + intensity * 1.5;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Gentle breathing scale and subtle rotation
      const pulse = Math.sin(t * speed * 2) * (0.05 * intensity);
      meshRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = -t * 0.15;
      wireframeRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Outer Glow Halo Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.35, 48, 48]} />
        <meshPhysicalMaterial
          color={hovered ? '#34D399' : '#10B981'}
          emissive="#10B981"
          emissiveIntensity={hovered ? 0.35 : 0.18}
          roughness={0.15}
          metalness={0.1}
          transmission={0.85}
          ior={1.3}
          thickness={1.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Internal Geometric Core (Translucent White Iridescent) */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[1.05, 2]} />
        <meshStandardMaterial
          color="#FFFFFF"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Orbiting Satellite Data Nodes */}
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh position={[1.8, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#34D399" emissive="#34D399" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-1.6, 0.4, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

export const ActivityOrb: React.FC<ActivityOrbProps> = ({
  completionPercentage = 68,
  streakDays = 5,
  showCenterBadge = true,
}) => {
  return (
    <div className="relative w-full h-full min-h-[220px] flex items-center justify-center">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-xs text-emerald-400 font-medium animate-pulse">
              Initializing 3D Telemetry Core...
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 0, 3.8], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]} // Crisp rendering on Retina displays
          >
            {/* Ambient & Directional Lighting */}
            <ambientLight intensity={0.85} />
            <directionalLight position={[4, 5, 3]} intensity={1.2} color="#FFFFFF" />
            <pointLight position={[-3, -3, -2]} intensity={0.6} color="#34D399" />

            <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
              <FluidOrbMesh completionPercentage={completionPercentage} />
            </Float>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.8}
              maxPolarAngle={Math.PI / 1.7}
              minPolarAngle={Math.PI / 2.3}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Floating Center Telemetry HUD overlay */}
      {showCenterBadge && (
        <div className="relative z-10 pointer-events-none text-center select-none backdrop-blur-sm bg-white/70 px-4 py-2 rounded-2xl border border-emerald-100/80 shadow-soft-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Metabolic Core
          </div>
          <div className="text-2xl font-black text-gray-900 mt-0.5">
            {completionPercentage}%
          </div>
          <div className="text-[10px] font-semibold text-gray-500">
            {streakDays}-Day Momentum Streak
          </div>
        </div>
      )}
    </div>
  );
};
