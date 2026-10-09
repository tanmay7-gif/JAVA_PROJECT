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
  const pushX = Math.cos(midAngle) * 0.15;
  const pushZ = -Math.sin(midAngle) * 0.15;

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smooth lerp for y-elevation and outward displacement
      const targetY = isHovered ? 0.35 : 0;
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
          emissiveIntensity={isHovered ? 0.85 : 0.15}
          roughness={0.15}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />

        {/* Floating Tooltip Pill right above slice when hovered */}
        {isHovered && (
          <Html position={[0, height + 0.35, 0]} center distanceFactor={7}>
            <div className="bg-white/95 backdrop-blur-md border border-emerald-200 px-3 py-1.5 rounded-xl shadow-lg pointer-events-none whitespace-nowrap text-left animate-in fade-in zoom-in-90 duration-150">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-xs font-bold text-gray-900">{slice.name}</span>
                <span className="text-xs font-extrabold text-emerald-700 ml-1">{slice.value}%</span>
              </div>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                {slice.sessionsCount} Recorded Sessions
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
      <div className={`relative w-full ${heightClass} flex flex-col items-center justify-center border border-dashed border-emerald-200/80 rounded-2xl bg-emerald-50/20 p-6 text-center`}>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-gray-800">No Discipline Data Yet</p>
        <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
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
            <div className="w-full h-full flex items-center justify-center text-xs text-emerald-600 font-semibold animate-pulse">
              Generating 3D Extruded Donut Geometry...
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 2.5, 3.2], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[4, 5, 4]} intensity={1.3} color="#FFFFFF" />
            <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#A7F3D0" />
            <pointLight position={[0, -1, 1]} intensity={0.3} color="#34D399" />

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

                {/* Inner White Porcelain Core Disc (creates Donut hole effect) */}
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.62, 0.62, 0.48, 32]} />
                  <meshStandardMaterial
                    color="#FFFFFF"
                    roughness={0.1}
                    metalness={0.05}
                  />
                </mesh>

                {/* Pedestal Ground Ring */}
                <mesh position={[0, -0.26, 0]}>
                  <cylinderGeometry args={[1.65, 1.7, 0.04, 36]} />
                  <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
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
      <div className="relative z-10 mt-auto pb-1 flex items-center justify-center gap-2 flex-wrap pointer-events-auto">
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
                  ? 'bg-white shadow-md border-emerald-300 ring-2 ring-emerald-400 text-gray-900 scale-105'
                  : 'bg-white/80 hover:bg-white text-gray-700 border border-emerald-100 shadow-sm'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.name}</span>
              <span className="text-emerald-700 font-extrabold">{cat.value}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
