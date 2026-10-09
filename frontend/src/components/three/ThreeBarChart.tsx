import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Flame, Clock } from 'lucide-react';

export interface DailyTelemetryPoint {
  day: string;
  date: string;
  calories: number;
  duration: number; // in minutes
}

const buildEmptyWeek = (): DailyTelemetryPoint[] => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const points: DailyTelemetryPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    points.push({
      day: dayNames[d.getDay()],
      date: `${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`,
      calories: 0,
      duration: 0,
    });
  }
  return points;
};


interface VolumetricBarProps {
  point: DailyTelemetryPoint;
  index: number;
  totalBars: number;
  activeMetric: 'calories' | 'duration';
  maxVal: number;
  isHovered: boolean;
  onHover: (day: string | null) => void;
}

const VolumetricBar: React.FC<VolumetricBarProps> = ({
  point,
  index,
  totalBars,
  activeMetric,
  maxVal,
  isHovered,
  onHover,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  // Position along x-axis centered
  const spacing = 0.58;
  const startX = -((totalBars - 1) * spacing) / 2;
  const posX = startX + index * spacing;

  // Calculate target height
  const value = activeMetric === 'calories' ? point.calories : point.duration;
  const targetHeight = Math.max(0.2, (value / maxVal) * 2.0);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smooth height animation lerp
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        targetHeight,
        delta * 8
      );
      // Keep base pinned to floor (y = 0)
      meshRef.current.position.y = meshRef.current.scale.y / 2;
    }

    if (shadowRef.current) {
      const shadowScale = isHovered ? 1.4 : 1.0;
      shadowRef.current.scale.x = THREE.MathUtils.lerp(
        shadowRef.current.scale.x,
        shadowScale,
        delta * 10
      );
      shadowRef.current.scale.y = THREE.MathUtils.lerp(
        shadowRef.current.scale.y,
        shadowScale,
        delta * 10
      );
    }
  });

  return (
    <group position={[posX, 0, 0]}>
      {/* Soft Contact Shadow beneath bar */}
      <mesh
        ref={shadowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
      >
        <planeGeometry args={[0.42, 0.42]} />
        <meshBasicMaterial
          color="#064E3B"
          transparent
          opacity={isHovered ? 0.35 : 0.12}
        />
      </mesh>

      {/* 3D Volumetric Column Mesh */}
      <mesh
        ref={meshRef}
        position={[0, targetHeight / 2, 0]}
        scale={[1, 0.1, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onHover(isHovered ? null : point.day);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(point.day);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[0.34, 1, 0.34]} />
        <meshPhysicalMaterial
          color={isHovered ? '#10B981' : '#34D399'}
          emissive={isHovered ? '#10B981' : '#059669'}
          emissiveIntensity={isHovered ? 0.9 : 0.25}
          roughness={0.12}
          metalness={0.15}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.95}
        />

        {/* Hover Drei <Html> Tooltip Pin */}
        {isHovered && (
          <Html position={[0, 0.6, 0]} center distanceFactor={7}>
            <div className="bg-white/95 backdrop-blur-md border border-emerald-200 px-3.5 py-2 rounded-2xl shadow-xl whitespace-nowrap text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-1 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {point.date}
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  {point.day}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{point.calories} kcal burned</span>
                </div>
                <div className="font-semibold text-gray-600 flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>{point.duration} minutes active</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};

interface ThreeBarChartProps {
  data?: DailyTelemetryPoint[];
  activeMetric?: 'calories' | 'duration';
  onMetricToggle?: (metric: 'calories' | 'duration') => void;
  heightClass?: string;
}

export const ThreeBarChart: React.FC<ThreeBarChartProps> = ({
  data,
  activeMetric = 'calories',
  onMetricToggle,
  heightClass = 'h-72',
}) => {
  const chartData = React.useMemo(() => {
    return data && data.length > 0 ? data : buildEmptyWeek();
  }, [data]);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const maxVal = Math.max(
    ...chartData.map((d) => (activeMetric === 'calories' ? d.calories : d.duration)),
    activeMetric === 'calories' ? 500 : 60
  );

  return (
    <div className={`relative w-full ${heightClass} flex flex-col justify-between`}>
      {/* 3D Canvas Scene */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-xs text-emerald-600 font-semibold animate-pulse">
              Rendering Volumetric 3D Data Bars...
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 2.2, 3.8], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[4, 5, 4]} intensity={1.4} color="#FFFFFF" />
            <directionalLight position={[-4, 3, -2]} intensity={0.6} color="#A7F3D0" />
            <pointLight position={[0, -0.5, 1]} intensity={0.4} color="#34D399" />

            <group position={[0, -0.55, 0]}>
              {/* Floor Plate / Laboratory Grid */}
              <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4.8, 1.6]} />
                <meshStandardMaterial
                  color="#FAFCFA"
                  roughness={0.4}
                  metalness={0.05}
                />
              </mesh>

              {/* Grid Border Lines */}
              <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.2, 2.22, 4]} />
                <meshBasicMaterial color="#E2E8F0" transparent opacity={0.4} />
              </mesh>

              {/* Bars */}
              {chartData.map((point, index) => (
                <VolumetricBar
                  key={point.day + point.date}
                  point={point}
                  index={index}
                  totalBars={chartData.length}
                  activeMetric={activeMetric}
                  maxVal={maxVal}
                  isHovered={hoveredDay === point.day}
                  onHover={setHoveredDay}
                />
              ))}
            </group>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2.1}
              minPolarAngle={Math.PI / 3.2}
              rotateSpeed={0.6}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Metric Toggle & Days Strip on bottom */}
      <div className="relative z-10 mt-auto flex items-center justify-between px-2 pt-2 gap-2 border-t border-emerald-100/60 bg-white/70 backdrop-blur-sm rounded-b-2xl">
        {/* Day Pills */}
        <div className="flex items-center gap-1 sm:gap-2">
          {chartData.map((d) => (
            <button
              key={d.day + d.date}
              onClick={() => setHoveredDay(hoveredDay === d.day ? null : d.day)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                hoveredDay === d.day
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>

        {/* Metric Selector Toggle */}
        {onMetricToggle && (
          <div className="flex items-center bg-[#F3F6F3] p-0.5 rounded-lg border border-emerald-100 text-[10px]">
            <button
              onClick={() => onMetricToggle('calories')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                activeMetric === 'calories'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Calories
            </button>
            <button
              onClick={() => onMetricToggle('duration')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                activeMetric === 'duration'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Minutes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
