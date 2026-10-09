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
  onSelect?: (slice: PieCategorySlice) => void;
}

const ExtrudedSliceMesh: React.FC<ExtrudedSliceMeshProps> = ({
  slice,
  thetaStart,
  thetaLength,
  radius = 1.4,
  height = 0.45,
  isHovered,
  onHover,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const midAngle = thetaStart + thetaLength / 2;

  // Minimal controlled outward displacement (0.05 instead of 0.16) to avoid over-expansion
  const pushX = Math.cos(midAngle) * 0.05;
  const pushZ = -Math.sin(midAngle) * 0.05;

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Controlled subtle elevation (0.12 instead of 0.38)
      const targetY = isHovered ? 0.12 : 0;
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
          if (onSelect) onSelect(slice);
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
            radius * 1.015, // subtle chamfered base
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
          emissiveIntensity={isHovered ? 0.95 : 0.25}
          roughness={0.14}
          metalness={0.25}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={0.95}
        />

        {/* Compact Tooltip Pill right above slice when hovered */}
        {isHovered && (
          <Html position={[0, height + 0.18, 0]} center distanceFactor={7}>
            <div className="rounded-lg border border-slate-700/80 bg-[#0c1424]/95 p-2 px-2.5 shadow-xl backdrop-blur-md max-w-[170px] text-left pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between gap-2.5 mb-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  DISCIPLINE
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {slice.value}%
                </span>
              </div>
              <div className="flex items-center justify-between gap-2.5">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-300 min-w-0">
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-semibold text-white truncate max-w-[75px]">{slice.name}</span>
                </span>
                <span className="text-[10px] font-medium text-slate-300 whitespace-nowrap shrink-0">
                  {slice.sessionsCount}{' '}
                  {slice.sessionsCount === 1 ? 'session' : 'sessions'}
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
  selectedSliceName?: string | null;
  onSliceSelect?: (slice: PieCategorySlice | null) => void;
}

export const ThreePieChart: React.FC<ThreePieChartProps> = ({
  data = DEFAULT_CATEGORIES,
  heightClass = 'h-72',
  selectedSliceName,
  onSliceSelect,
}) => {
  const [internalHoveredSlice, setInternalHoveredSlice] = useState<string | null>(null);

  const hoveredSlice = selectedSliceName !== undefined ? selectedSliceName : internalHoveredSlice;
  const setHoveredSlice = (name: string | null) => {
    setInternalHoveredSlice(name);
    if (onSliceSelect) {
      const match = data.find((d) => d.name === name) || null;
      onSliceSelect(match);
    }
  };

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

  const activeSlice = useMemo(() => {
    if (hoveredSlice) {
      const match = data.find((d) => d.name === hoveredSlice);
      if (match) return match;
    }
    return data[0] || null;
  }, [hoveredSlice, data]);

  return (
    <div className={`relative w-full ${heightClass} flex flex-col justify-between`}>
      {/* Compact Discipline Readout Widget */}
      {activeSlice && (
        <div className="absolute top-4 left-4 z-10 rounded-xl border border-slate-700/80 bg-[#0c1424]/85 p-2.5 px-3 max-w-[210px] shadow-lg backdrop-blur-md pointer-events-none">
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                DISCIPLINE
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {activeSlice.value}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                  style={{ backgroundColor: activeSlice.color }}
                />
                <span className="truncate max-w-[75px]">{activeSlice.name}</span>
              </div>
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap shrink-0">
                {activeSlice.sessionsCount} {activeSlice.sessionsCount === 1 ? 'session' : 'sessions'}
              </span>
            </div>
          </div>
        </div>
      )}

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

            <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.18}>
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
                    onSelect={(s) => {
                      if (onSliceSelect) {
                        onSliceSelect(hoveredSlice === s.name ? null : s);
                      }
                    }}
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

      {/* Streamlined Interactive Badge Legend */}
      <div className="relative z-10 mt-auto pb-1 flex items-center justify-center gap-1.5 flex-wrap pointer-events-auto px-2">
        {data.map((cat) => {
          const isSelected = hoveredSlice === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setHoveredSlice(isSelected ? null : cat.name)}
              onMouseEnter={() => setInternalHoveredSlice(cat.name)}
              onMouseLeave={() => setInternalHoveredSlice(null)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-800 text-white border border-cyan-400/50 shadow-sm'
                  : 'bg-[#0B131E]/80 hover:bg-[#131E2D] text-slate-300 border border-slate-800/80 shadow-sm'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block shadow-[0_0_5px_currentColor]"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.name}</span>
              <span className="text-[9px] text-slate-400 ml-0.5 font-normal">{cat.value}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
