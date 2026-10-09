import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Layers } from 'lucide-react';

export interface PieCategorySlice {
  name: string;
  value: number;
  color: string;
  emissiveColor: string;
  sessionsCount: number;
}

const DEFAULT_CATEGORIES: PieCategorySlice[] = [];

interface ExtrudedSliceMeshProps {
  slice: PieCategorySlice;
  thetaStart: number;
  thetaLength: number;
  radius?: number;
  height?: number;
  isHovered: boolean;
  onHover: (name: string | null) => void;
}

const ExtrudedSliceMesh: React.FC<ExtrudedSliceMeshProps> = ({
  slice,
  thetaStart,
  thetaLength,
  radius = 1.4,
  height = 0.45,
  isHovered,
  onHover,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const midAngle = thetaStart + thetaLength / 2;

  // Compute slight outwards push direction when hovered
  const pushX = Math.cos(midAngle) * 0.16;
  const pushZ = -Math.sin(midAngle) * 0.16;

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smooth lerp for y-elevation and outward displacement
      const targetY = isHovered ? 0.38 : 0;
      const targetX = isHovered ? pushX : 0;
      const targetZ = isHovered ? pushZ : 0;

      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 12);
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 12);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 12);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onHover(isHovered ? null : slice.name);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(slice.name);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Extruded Cylindrical Sector */}
        <cylinderGeometry
          args={[
            radius, // top radius
            radius * 1.02, // subtle chamfered base
            height,
            32,
            1,
            false,
            thetaStart,
            thetaLength,
          ]}
        />
        <meshPhysicalMaterial
          color={slice.color}
          emissive={slice.emissiveColor}
          emissiveIntensity={isHovered ? 1.0 : 0.25}
          roughness={0.12}
          metalness={0.25}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={0.95}
        />

        {/* Compact Tooltip Pill right above slice when hovered */}
        {isHovered && (
          <Html position={[0, height + 0.35, 0]} center distanceFactor={7}>
            <div className="rounded-lg border border-slate-700/80 bg-[#0b101c]/95 p-2 px-3 shadow-2xl backdrop-blur-md max-w-[210px] text-left pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Discipline
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {slice.value}%
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span>{slice.name}</span>
                </span>
                <span className="text-xs font-bold text-slate-100">
                  {slice.sessionsCount}{' '}
                  <span className="text-[10px] font-normal text-slate-400">sessions</span>
                </span>
              </div>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};

interface ThreePieChartProps {
  data?: PieCategorySlice[];
  heightClass?: string;
}

export const ThreePieChart: React.FC<ThreePieChartProps> = ({
  data = DEFAULT_CATEGORIES,
  heightClass = 'h-72',
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const totalValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  if (!data || data.length === 0 || totalValue === 0) {
    return (
      <div className={`relative w-full ${heightClass} flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-[#0B131E]/40 p-6 text-center`}>
        <div className="w-12 h-12 rounded-2xl bg-[#131E2D] shadow-inner border border-slate-700/60 flex items-center justify-center text-cyan-400 mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-200">No Discipline Telemetry Yet</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Log workout sessions across Cardio, Strength, or HIIT to generate real 3D volumetric category distribution.
        </p>
      </div>
    );
  }

  // Compute angles for each slice
  const sliceAngles = useMemo(() => {
    let currentAngle = 0;
    return data.map((item) => {
      const sliceAngle = (item.value / totalValue) * Math.PI * 2;
      const angleConfig = {
        slice: item,
        thetaStart: currentAngle,
        thetaLength: sliceAngle,
      };
      currentAngle += sliceAngle;
      return angleConfig;
    });
  }, [data, totalValue]);

  return (
    <div className={`relative w-full ${heightClass} flex flex-col justify-between`}>
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-xs text-cyan-400 font-semibold animate-pulse">
              Synthesizing 3D Extruded Donut Geometry...
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 2.5, 3.2], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[4, 5, 4]} intensity={1.5} color="#FFFFFF" />
            <directionalLight position={[-3, 2, -2]} intensity={0.7} color="#22D3EE" />
            <pointLight position={[0, -1, 1]} intensity={0.4} color="#10B981" />

            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
              <group position={[0, -0.2, 0]}>
                {/* Slices */}
                {sliceAngles.map(({ slice, thetaStart, thetaLength }) => (
                  <ExtrudedSliceMesh
                    key={slice.name}
                    slice={slice}
                    thetaStart={thetaStart}
                    thetaLength={thetaLength}
                    isHovered={hoveredSlice === slice.name}
                    onHover={setHoveredSlice}
                  />
                ))}

                {/* Inner Dark Telemetry Core Disc (creates Donut hole effect) */}
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.62, 0.62, 0.48, 32]} />
                  <meshStandardMaterial
                    color="#0B131E"
                    roughness={0.2}
                    metalness={0.4}
                  />
                </mesh>

                {/* Glowing Core Rim Ring */}
                <mesh position={[0, 0.295, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.59, 0.62, 48]} />
                  <meshBasicMaterial color="#06B6D4" transparent opacity={0.6} />
                </mesh>

                {/* Pedestal Ground Ring */}
                <mesh position={[0, -0.26, 0]}>
                  <cylinderGeometry args={[1.65, 1.7, 0.04, 36]} />
                  <meshStandardMaterial color="#070D18" roughness={0.5} metalness={0.2} />
                </mesh>
                <mesh position={[0, -0.238, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.63, 1.66, 48]} />
                  <meshBasicMaterial color="#06B6D4" transparent opacity={0.3} />
                </mesh>
              </group>
            </Float>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={!hoveredSlice}
              autoRotateSpeed={0.9}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 4}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Floating Interactive Badge Legend */}
      <div className="relative z-10 mt-auto pb-1 flex items-center justify-center gap-1.5 flex-wrap pointer-events-auto">
        {data.map((cat) => {
          const isHovered = hoveredSlice === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onMouseEnter={() => setHoveredSlice(cat.name)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                isHovered
                  ? 'bg-slate-800 text-white border border-cyan-400/60 ring-1 ring-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)] scale-105'
                  : 'bg-[#0B131E]/80 hover:bg-[#131E2D] text-slate-300 border border-slate-800/80 shadow-sm'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block shadow-[0_0_6px_currentColor]"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.name}</span>
              <span className="text-[10px] text-slate-400 ml-0.5">{cat.value}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
