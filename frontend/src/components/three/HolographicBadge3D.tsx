import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface HolographicBadge3DProps {
  badgeName: string;
  isUnlocked?: boolean;
}

const MedalMesh: React.FC<{ isUnlocked: boolean }> = ({ isUnlocked }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<boolean>(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.35;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 1.2) * 0.15;
    }
  });

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Outer Coin Rim */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.12, 32]} />
        <meshStandardMaterial
          color={isUnlocked ? (hovered ? '#34D399' : '#10B981') : '#94A3B8'}
          metalness={0.7}
          roughness={0.2}
          emissive={isUnlocked ? '#10B981' : '#64748B'}
          emissiveIntensity={hovered ? 0.4 : 0.15}
        />
      </mesh>

      {/* Inner Inscribed Coin Face */}
      <mesh position={[0, 0, 0.07]}>
        <cylinderGeometry args={[0.98, 0.98, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.4}
          roughness={0.1}
          metalness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Center Star / Emblem */}
      <mesh position={[0, 0, 0.11]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.45, 0.45, 0.06]} />
        <meshStandardMaterial
          color={isUnlocked ? '#34D399' : '#CBD5E1'}
          emissive={isUnlocked ? '#34D399' : '#94A3B8'}
          emissiveIntensity={isUnlocked ? 0.6 : 0.1}
        />
      </mesh>
    </group>
  );
};

export const HolographicBadge3D: React.FC<HolographicBadge3DProps> = ({
  badgeName,
  isUnlocked = true,
}) => {
  return (
    <div className="w-full h-36 relative flex items-center justify-center">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-[10px] text-emerald-600 animate-pulse">
            Rendering Hologram...
          </div>
        }
      >
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[3, 3, 3]} intensity={1.5} color="#FFFFFF" />
          <pointLight position={[-2, -2, -1]} intensity={0.8} color="#34D399" />

          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.4}>
            <MedalMesh isUnlocked={isUnlocked} />
          </Float>
        </Canvas>
      </Suspense>
    </div>
  );
};
