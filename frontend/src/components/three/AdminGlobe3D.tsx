import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

interface BeaconProps {
  position: [number, number, number];
  height: number;
}

const Beacon: React.FC<BeaconProps> = ({ position, height }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + position[0] * 5) * 0.15;
      meshRef.current.scale.set(1, pulse, 1);
    }
  });

  return (
    <group position={position}>
      {/* Beacon Pillar */}
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.04, height, 12]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#34D399"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>
      {/* Light Head Sphere */}
      <mesh position={[0, height, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          color="#34D399"
          emissive="#A7F3D0"
          emissiveIntensity={1.8}
        />
      </mesh>
    </group>
  );
};

const GlobeTerrain: React.FC = () => {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  // Coordinates for active workout beacons on globe surface
  const beacons = [
    { pos: [0.8, 0.7, 0.9] as [number, number, number], height: 0.35 },
    { pos: [-0.9, 0.4, 0.8] as [number, number, number], height: 0.5 },
    { pos: [0.3, -0.9, 0.7] as [number, number, number], height: 0.28 },
    { pos: [-0.6, -0.6, 0.9] as [number, number, number], height: 0.42 },
    { pos: [1.1, 0.1, 0.5] as [number, number, number], height: 0.45 },
    { pos: [-0.3, 0.8, -0.8] as [number, number, number], height: 0.38 },
  ];

  return (
    <group ref={globeRef}>
      {/* Low-Poly Icosahedron Planet Terrain (Crisp White with Subtle Grid) */}
      <mesh>
        <icosahedronGeometry args={[1.35, 3]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.3}
          metalness={0.05}
          flatShading
        />
      </mesh>

      {/* Translucent Wireframe Topology Envelope */}
      <mesh>
        <icosahedronGeometry args={[1.37, 3]} />
        <meshStandardMaterial
          color="#A7F3D0"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Active Workout Beacons */}
      {beacons.map((b, i) => (
        <Beacon key={i} position={b.pos} height={b.height} />
      ))}
    </group>
  );
};

export const AdminGlobe3D: React.FC = () => {
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-xs text-emerald-600 font-medium animate-pulse">
            Rendering Global Topology...
          </div>
        }
      >
        <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 5, 3]} intensity={1.4} color="#FFFFFF" />
          <pointLight position={[-3, -3, -2]} intensity={0.6} color="#34D399" />

          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <GlobeTerrain />
          </Float>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.6}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </Suspense>

      <div className="absolute bottom-2 right-3 z-10 pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white/90 px-2 py-0.5 rounded-md border border-emerald-100 shadow-soft-sm">
          Live Session Mesh Telemetry
        </span>
      </div>
    </div>
  );
};
