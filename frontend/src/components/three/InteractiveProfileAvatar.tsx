import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldCheck, Dumbbell, Activity, Flame, ChevronRight, X } from 'lucide-react';

export interface MuscleHotspotData {
  id: string;
  name: string;
  fatiguePercent: number; // 0 = fully fatigued, 100 = fully recovered
  status: 'Fresh' | 'Optimal' | 'Fatigued' | 'Recovering';
  prMetric: string;
  weeklySets: number;
  lastTrained: string;
  position: [number, number, number];
}

const DEFAULT_HOTSPOTS: MuscleHotspotData[] = [
  {
    id: 'chest',
    name: 'Pectoralis Major',
    fatiguePercent: 88,
    status: 'Optimal',
    prMetric: 'Bench Press: 105 kg (3 reps)',
    weeklySets: 12,
    lastTrained: 'Yesterday',
    position: [0, 0.98, 0.28],
  },
  {
    id: 'core',
    name: 'Abdominal Core',
    fatiguePercent: 94,
    status: 'Fresh',
    prMetric: 'Hanging Leg Raise: 20 reps',
    weeklySets: 8,
    lastTrained: '2 days ago',
    position: [0, 0.45, 0.22],
  },
  {
    id: 'shoulders',
    name: 'Deltoids & Traps',
    fatiguePercent: 62,
    status: 'Recovering',
    prMetric: 'Overhead Press: 65 kg (5 reps)',
    weeklySets: 10,
    lastTrained: 'Today',
    position: [0.55, 1.05, 0.12],
  },
  {
    id: 'back',
    name: 'Latissimus Dorsi',
    fatiguePercent: 78,
    status: 'Optimal',
    prMetric: 'Weighted Pull-up: +24 kg',
    weeklySets: 14,
    lastTrained: '3 days ago',
    position: [0, 0.95, -0.25],
  },
  {
    id: 'legs',
    name: 'Quadriceps & Glutes',
    fatiguePercent: 55,
    status: 'Fatigued',
    prMetric: 'Barbell Back Squat: 140 kg',
    weeklySets: 16,
    lastTrained: '1 day ago',
    position: [0.24, -0.65, 0.2],
  },
];

interface AvatarHotspotNodeProps {
  hotspot: MuscleHotspotData;
  isSelected: boolean;
  onSelect: (h: MuscleHotspotData) => void;
  onClose: () => void;
}

const AvatarHotspotNode: React.FC<AvatarHotspotNodeProps> = ({
  hotspot,
  isSelected,
  onSelect,
  onClose,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + hotspot.position[0]) * 0.15;
      const baseScale = isSelected ? 1.4 : hovered ? 1.25 : 1.0;
      meshRef.current.scale.setScalar(baseScale + pulse * 0.2);
    }
  });

  return (
    <group position={hotspot.position}>
      {/* 3D Interactive Hotspot Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(hotspot);
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
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshStandardMaterial
          color={isSelected ? '#10B981' : hovered ? '#34D399' : '#059669'}
          emissive={isSelected ? '#10B981' : '#34D399'}
          emissiveIntensity={isSelected ? 1.5 : hovered ? 0.9 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Pulsing Outer Ping Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.12, 24]} />
        <meshBasicMaterial
          color="#34D399"
          transparent
          opacity={isSelected ? 0.8 : hovered ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating 2D HTML Tooltip rendered via Drei <Html> */}
      {isSelected && (
        <Html
          position={[0, 0.2, 0]}
          center
          distanceFactor={6}
          zIndexRange={[100, 0]}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-64 bg-white/95 backdrop-blur-md border border-emerald-200/90 rounded-2xl p-4 shadow-xl text-left pointer-events-auto transform transition-all animate-in fade-in zoom-in-95 duration-200"
            style={{
              boxShadow: '0 12px 30px -4px rgba(16, 185, 129, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-2 mb-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Muscle Telemetry
                </span>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{hotspot.name}</h4>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Recovery Status Pill */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Recovery Index:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    hotspot.fatiguePercent >= 75
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : hotspot.fatiguePercent >= 50
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {hotspot.fatiguePercent}% • {hotspot.status}
                </span>
              </div>

              {/* Recovery Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                  style={{ width: `${hotspot.fatiguePercent}%` }}
                />
              </div>

              {/* Personal Record Info */}
              <div className="p-2 rounded-xl bg-[#F8FAF8] border border-emerald-100/70 text-[11px] space-y-1">
                <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Personal Best Record</span>
                </div>
                <div className="text-emerald-700 font-bold pl-5">{hotspot.prMetric}</div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                <span>Weekly Volume: <strong className="text-gray-800">{hotspot.weeklySets} sets</strong></span>
                <span>Last: <strong className="text-gray-800">{hotspot.lastTrained}</strong></span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Procedural Low-Poly Porcelain Mannequin
const PorcelainMannequinBody: React.FC<{
  goalProgress: number;
  selectedHotspot: MuscleHotspotData | null;
}> = ({ goalProgress, selectedHotspot }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Dynamic emissive pulse matching goal completion
  const goalFactor = Math.min(1.0, Math.max(0.2, goalProgress / 100));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4;
      const scalePulse = 1 + Math.sin(t * 2) * 0.04 * goalFactor;
      ringRef.current.scale.set(scalePulse, scalePulse, scalePulse);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      {/* Dynamic Aura Ring beneath avatar based on goal completion */}
      <mesh ref={ringRef} position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.15, 48]} />
        <meshBasicMaterial
          color={goalProgress >= 75 ? '#10B981' : '#34D399'}
          transparent
          opacity={0.35 * goalFactor}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pedestal Base Disc */}
      <mesh position={[0, -1.27, 0]}>
        <cylinderGeometry args={[1.05, 1.1, 0.05, 36]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.05} />
      </mesh>

      {/* HEAD & FACIAL VISOR */}
      <group position={[0, 1.62, 0]}>
        {/* Head Shell */}
        <mesh>
          <sphereGeometry args={[0.26, 28, 28]} />
          <meshPhysicalMaterial
            color="#FAFAF9"
            roughness={0.12}
            metalness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
        {/* Visor / Optical Sensor Band */}
        <mesh position={[0, 0.02, 0.2]}>
          <boxGeometry args={[0.28, 0.06, 0.12]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={0.8 * goalFactor + 0.3}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* NECK */}
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.18, 18]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.2} />
      </mesh>

      {/* UPPER TORSO & CHEST PLATES */}
      <group position={[0, 0.98, 0]}>
        {/* Central Core Torso Block */}
        <mesh>
          <boxGeometry args={[0.72, 0.42, 0.32]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.1}
            metalness={0.05}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
          />
        </mesh>
        {/* Left Pectoral Plate */}
        <mesh position={[-0.17, 0.03, 0.16]}>
          <boxGeometry args={[0.3, 0.26, 0.05]} />
          <meshStandardMaterial
            color={selectedHotspot?.id === 'chest' ? '#34D399' : '#F1F5F9'}
            emissive={selectedHotspot?.id === 'chest' ? '#10B981' : '#E2E8F0'}
            emissiveIntensity={selectedHotspot?.id === 'chest' ? 0.5 : 0.05}
            roughness={0.15}
          />
        </mesh>
        {/* Right Pectoral Plate */}
        <mesh position={[0.17, 0.03, 0.16]}>
          <boxGeometry args={[0.3, 0.26, 0.05]} />
          <meshStandardMaterial
            color={selectedHotspot?.id === 'chest' ? '#34D399' : '#F1F5F9'}
            emissive={selectedHotspot?.id === 'chest' ? '#10B981' : '#E2E8F0'}
            emissiveIntensity={selectedHotspot?.id === 'chest' ? 0.5 : 0.05}
            roughness={0.15}
          />
        </mesh>
        {/* Latissimus Back Spine Plate */}
        <mesh position={[0, 0.02, -0.16]}>
          <boxGeometry args={[0.56, 0.36, 0.05]} />
          <meshStandardMaterial
            color={selectedHotspot?.id === 'back' ? '#34D399' : '#F8FAFC'}
            emissive={selectedHotspot?.id === 'back' ? '#10B981' : '#CBD5E1'}
            emissiveIntensity={selectedHotspot?.id === 'back' ? 0.5 : 0.05}
          />
        </mesh>
      </group>

      {/* CORE / ABDOMINAL CARAPACE */}
      <group position={[0, 0.52, 0]}>
        <mesh>
          <boxGeometry args={[0.56, 0.44, 0.26]} />
          <meshPhysicalMaterial
            color="#FAFCFA"
            roughness={0.15}
            metalness={0.08}
            clearcoat={0.8}
          />
        </mesh>
        {/* Abdominal 4-Pack Segments */}
        {[-0.11, 0.11].map((x) =>
          [-0.1, 0.1].map((y) => (
            <mesh key={`${x}-${y}`} position={[x, y, 0.13]}>
              <boxGeometry args={[0.18, 0.16, 0.03]} />
              <meshStandardMaterial
                color={selectedHotspot?.id === 'core' ? '#34D399' : '#FFFFFF'}
                emissive={selectedHotspot?.id === 'core' ? '#10B981' : '#E2E8F0'}
                emissiveIntensity={selectedHotspot?.id === 'core' ? 0.6 : 0.05}
              />
            </mesh>
          ))
        )}
      </group>

      {/* SHOULDERS & ARMS */}
      {/* Left Shoulder & Arm */}
      <group position={[-0.54, 1.05, 0]}>
        <mesh>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>
        <mesh position={[-0.08, -0.32, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.42, 16]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.2} />
        </mesh>
        <mesh position={[-0.08, -0.72, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.38, 16]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.2} />
        </mesh>
      </group>

      {/* Right Shoulder & Arm */}
      <group position={[0.54, 1.05, 0]}>
        <mesh>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshPhysicalMaterial
            color={selectedHotspot?.id === 'shoulders' ? '#34D399' : '#FFFFFF'}
            emissive={selectedHotspot?.id === 'shoulders' ? '#10B981' : '#FFFFFF'}
            emissiveIntensity={selectedHotspot?.id === 'shoulders' ? 0.4 : 0.0}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0.08, -0.32, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.42, 16]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.2} />
        </mesh>
        <mesh position={[0.08, -0.72, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.38, 16]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.2} />
        </mesh>
      </group>

      {/* PELVIS / HIP GIRDLE */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.32, 0.26, 0.26, 20]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* LOWER BODY / LEGS */}
      {/* Left Thigh & Calf */}
      <group position={[-0.22, -0.55, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.11, 0.62, 18]} />
          <meshPhysicalMaterial
            color={selectedHotspot?.id === 'legs' ? '#34D399' : '#FFFFFF'}
            emissive={selectedHotspot?.id === 'legs' ? '#10B981' : '#FFFFFF'}
            emissiveIntensity={selectedHotspot?.id === 'legs' ? 0.4 : 0.0}
            roughness={0.12}
          />
        </mesh>
        <mesh position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.48, 16]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.2} />
        </mesh>
      </group>

      {/* Right Thigh & Calf */}
      <group position={[0.22, -0.55, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.11, 0.62, 18]} />
          <meshPhysicalMaterial
            color={selectedHotspot?.id === 'legs' ? '#34D399' : '#FFFFFF'}
            emissive={selectedHotspot?.id === 'legs' ? '#10B981' : '#FFFFFF'}
            emissiveIntensity={selectedHotspot?.id === 'legs' ? 0.4 : 0.0}
            roughness={0.12}
          />
        </mesh>
        <mesh position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.48, 16]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

interface InteractiveProfileAvatarProps {
  goalProgress?: number; // 0 to 100
  userName?: string;
}

export const InteractiveProfileAvatar: React.FC<InteractiveProfileAvatarProps> = ({
  goalProgress = 76,
  userName = 'Athlete',
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<MuscleHotspotData | null>(
    DEFAULT_HOTSPOTS[0]
  );

  return (
    <div className="relative w-full h-[450px] rounded-3xl bg-gradient-to-b from-white via-[#F9FAF9] to-[#F3F7F4] border border-emerald-100/90 shadow-sm overflow-hidden flex flex-col justify-between p-4">
      {/* Top Telemetry Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Interactive 3D Body Rig
          </div>
          <h3 className="text-sm font-bold text-gray-900 mt-1">
            {userName}&apos;s Physical Persona
          </h3>
          <p className="text-[11px] text-gray-500">
            Rotate 360° • Click hotspots for muscle fatigue & personal records
          </p>
        </div>

        {/* Goal Indicator Pill */}
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Weekly Goal Pace
          </div>
          <div className="text-base font-extrabold text-emerald-700 flex items-center justify-end gap-1">
            <Flame className="w-4 h-4 text-emerald-500" />
            {goalProgress}%
          </div>
        </div>
      </div>

      {/* 3D Canvas Scene */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-xs text-emerald-600 font-semibold animate-pulse">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Initializing 3D Kinetic Avatar Rig...
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 0.4, 3.8], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[4, 5, 4]} intensity={1.4} color="#FFFFFF" />
            <directionalLight position={[-4, 3, -2]} intensity={0.6} color="#A7F3D0" />
            <pointLight position={[0, -1, 1.5]} intensity={0.4} color="#34D399" />

            <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
              <group>
                <PorcelainMannequinBody
                  goalProgress={goalProgress}
                  selectedHotspot={selectedHotspot}
                />

                {/* Hotspot Nodes */}
                {DEFAULT_HOTSPOTS.map((hotspot) => (
                  <AvatarHotspotNode
                    key={hotspot.id}
                    hotspot={hotspot}
                    isSelected={selectedHotspot?.id === hotspot.id}
                    onSelect={(h) => setSelectedHotspot(h)}
                    onClose={() => setSelectedHotspot(null)}
                  />
                ))}
              </group>
            </Float>

            {/* Smooth Dampened 360 Orbit Controls */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableDamping
              dampingFactor={0.06}
              rotateSpeed={0.8}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.7}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Bottom Floating Hotspot Selector Strip */}
      <div className="relative z-10 pt-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          {DEFAULT_HOTSPOTS.map((h) => {
            const isSelected = selectedHotspot?.id === h.id;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHotspot(h)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
                    : 'bg-white/85 hover:bg-white text-gray-700 border border-emerald-100 hover:text-emerald-700 shadow-sm'
                }`}
              >
                <Dumbbell className="w-3 h-3" />
                {h.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedHotspot(null)}
          className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 hover:text-gray-600 bg-white/70 rounded-lg hover:bg-white border border-gray-200"
        >
          Reset Hotspots
        </button>
      </div>
    </div>
  );
};
