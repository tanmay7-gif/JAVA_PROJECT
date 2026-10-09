import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

export type MuscleGroup = 'Chest' | 'Back' | 'Core' | 'Legs' | 'Arms' | 'Full Body';

interface MuscleAnatomy3DProps {
  selectedGroup: string;
  onSelectGroup: (group: MuscleGroup) => void;
}

interface AnatomicalPartProps {
  name: MuscleGroup;
  position: [number, number, number];
  scale: [number, number, number];
  geometryType?: 'box' | 'sphere' | 'cylinder';
  selectedGroup: string;
  onSelect: (group: MuscleGroup) => void;
}

const AnatomicalNode: React.FC<AnatomicalPartProps> = ({
  name,
  position,
  scale,
  geometryType = 'box',
  selectedGroup,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState<boolean>(false);
  const isSelected = selectedGroup.toLowerCase().includes(name.toLowerCase()) || selectedGroup === 'Full Body';

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.05;
        meshRef.current.scale.set(scale[0] + pulse, scale[1] + pulse, scale[2] + pulse);
      } else {
        meshRef.current.scale.set(scale[0], scale[1], scale[2]);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(name);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {geometryType === 'sphere' ? (
        <sphereGeometry args={[1, 24, 24]} />
      ) : geometryType === 'cylinder' ? (
        <cylinderGeometry args={[1, 1, 1, 16]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}

      <meshStandardMaterial
        color={isSelected ? '#10B981' : hovered ? '#34D399' : '#E2E8F0'}
        emissive={isSelected ? '#10B981' : hovered ? '#34D399' : '#CBD5E1'}
        emissiveIntensity={isSelected ? 0.8 : hovered ? 0.4 : 0.05}
        roughness={0.2}
        metalness={0.1}
        transparent
        opacity={isSelected ? 0.95 : 0.75}
      />
    </mesh>
  );
};

// Procedural Torso Mannequin Assembly
const MannequinModel: React.FC<{ selectedGroup: string; onSelect: (g: MuscleGroup) => void }> = ({
  selectedGroup,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.3} wireframe />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.2, 12]} />
        <meshStandardMaterial color="#E2E8F0" wireframe />
      </mesh>

      {/* CHEST ZONE */}
      <AnatomicalNode
        name="Chest"
        position={[0, 0.95, 0.08]}
        scale={[0.75, 0.38, 0.3]}
        geometryType="box"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />

      {/* BACK ZONE */}
      <AnatomicalNode
        name="Back"
        position={[0, 0.95, -0.1]}
        scale={[0.75, 0.45, 0.2]}
        geometryType="box"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />

      {/* CORE / ABS ZONE */}
      <AnatomicalNode
        name="Core"
        position={[0, 0.45, 0.05]}
        scale={[0.55, 0.45, 0.25]}
        geometryType="box"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />

      {/* SHOULDERS & ARMS */}
      {/* Left Shoulder & Arm */}
      <AnatomicalNode
        name="Arms"
        position={[-0.58, 0.95, 0]}
        scale={[0.22, 0.22, 0.22]}
        geometryType="sphere"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />
      <AnatomicalNode
        name="Arms"
        position={[-0.68, 0.45, 0]}
        scale={[0.15, 0.6, 0.15]}
        geometryType="cylinder"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />

      {/* Right Shoulder & Arm */}
      <AnatomicalNode
        name="Arms"
        position={[0.58, 0.95, 0]}
        scale={[0.22, 0.22, 0.22]}
        geometryType="sphere"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />
      <AnatomicalNode
        name="Arms"
        position={[0.68, 0.45, 0]}
        scale={[0.15, 0.6, 0.15]}
        geometryType="cylinder"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />

      {/* Pelvis */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.25, 16]} />
        <meshStandardMaterial color="#E2E8F0" wireframe />
      </mesh>

      {/* LEGS ZONE */}
      {/* Left Leg */}
      <AnatomicalNode
        name="Legs"
        position={[-0.22, -0.65, 0]}
        scale={[0.2, 0.9, 0.2]}
        geometryType="cylinder"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />

      {/* Right Leg */}
      <AnatomicalNode
        name="Legs"
        position={[0.22, -0.65, 0]}
        scale={[0.2, 0.9, 0.2]}
        geometryType="cylinder"
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />
    </group>
  );
};

export const MuscleAnatomy3D: React.FC<MuscleAnatomy3DProps> = ({
  selectedGroup,
  onSelectGroup,
}) => {
  return (
    <div className="relative w-full h-56 rounded-2xl bg-[#F8FAF8] border border-emerald-100/80 overflow-hidden flex flex-col justify-between p-2 shadow-inner">
      <div className="absolute top-2 left-2 z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white/90 px-2 py-0.5 rounded-md border border-emerald-100 shadow-soft-sm">
          Interactive 3D Anatomy
        </span>
      </div>

      <div className="w-full h-full">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-xs text-emerald-600 font-medium animate-pulse">
              Loading 3D Anatomy Model...
            </div>
          }
        >
          <Canvas camera={{ position: [0, 0.3, 3.2], fov: 42 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[3, 4, 3]} intensity={1.3} color="#FFFFFF" />
            <pointLight position={[-2, -2, -2]} intensity={0.5} color="#A7F3D0" />

            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
              <MannequinModel selectedGroup={selectedGroup} onSelect={onSelectGroup} />
            </Float>

            <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.2} />
          </Canvas>
        </Suspense>
      </div>

      {/* Interactive Muscle Group Quick-Tags */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-center gap-1.5 flex-wrap">
        {(['Chest', 'Back', 'Core', 'Legs', 'Arms'] as MuscleGroup[]).map((group) => {
          const isSelected = selectedGroup.toLowerCase().includes(group.toLowerCase());
          return (
            <button
              key={group}
              type="button"
              onClick={() => onSelectGroup(group)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : 'bg-white/80 hover:bg-white text-gray-600 border border-emerald-100 hover:text-emerald-700'
              }`}
            >
              {group}
            </button>
          );
        })}
      </div>
    </div>
  );
};
