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

  // High-frequency color palette
  const baseColor = activeMetric === 'calories' ? '#06B6D4' : '#10B981';
  const hoverColor = activeMetric === 'calories' ? '#38BDF8' : '#34D399';
  const emissiveColor = activeMetric === 'calories' ? '#0284C7' : '#059669';
  const hoverEmissive = activeMetric === 'calories' ? '#06B6D4' : '#10B981';

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
      const shadowScale = isHovered ? 1.45 : 1.0;
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
      {/* 3D Contact Shadow beneath bar with subtle high-frequency tint */}
      <mesh
        ref={shadowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
      >
        <planeGeometry args={[0.42, 0.42]} />
        <meshBasicMaterial
          color="#01121E"
          transparent
          opacity={isHovered ? 0.65 : 0.3}
        />
      </mesh>

      {/* 3D Volumetric Extruded Column */}
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
          color={isHovered ? hoverColor : baseColor}
          emissive={isHovered ? hoverEmissive : emissiveColor}
          emissiveIntensity={isHovered ? 1.1 : 0.35}
          roughness={0.12}
          metalness={0.3}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={0.95}
          transparent
          opacity={0.96}
        />

        {/* 3D Bevel Top Edge Cap */}
        <mesh position={[0, 0.505, 0]}>
          <boxGeometry args={[0.345, 0.015, 0.345]} />
          <meshStandardMaterial
            color={isHovered ? '#E0F2FE' : '#A7F3D0'}
            emissive={isHovered ? '#38BDF8' : '#34D399'}
            emissiveIntensity={isHovered ? 1.4 : 0.6}
            roughness={0.1}
          />
        </mesh>

        {/* Compact Hover Drei <Html> Tooltip Pin */}
        {isHovered && (
          <Html position={[0, 0.65, 0]} center distanceFactor={7}>
            <div className="rounded-lg border border-slate-700/80 bg-[#0c1424]/95 p-2 px-2.5 shadow-xl backdrop-blur-md max-w-[170px] text-left pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between gap-2.5 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {point.date}
                </span>
                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {point.day}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <Flame className="w-3 h-3 text-sky-400 shrink-0" />
                    <span>Calories</span>
                  </span>
                  <span className="text-xs font-bold text-white">
                    {point.calories.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Duration</span>
                  </span>
                  <span className="text-xs font-bold text-white">
                    {point.duration}m
                  </span>
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

  const activePoint = React.useMemo(() => {
    if (hoveredDay) {
      const match = chartData.find((d) => d.day === hoveredDay);
      if (match) return match;
    }
    return chartData[chartData.length - 1] || { calories: 0, duration: 0, day: 'Today', date: '' };
  }, [hoveredDay, chartData]);

  return (
    <div className={`relative w-full ${heightClass} flex flex-col justify-between`}>
      {/* Compact Calories & Duration Widget */}
      <div className="absolute top-4 left-4 z-10 rounded-xl border border-slate-700/80 bg-[#0c1424]/85 p-2.5 px-3 max-w-[210px] shadow-lg backdrop-blur-md pointer-events-none">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Flame className="w-3.5 h-3.5 text-sky-400" />
              <span>Calories</span>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">{activePoint.calories.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Duration</span>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">{activePoint.duration}m</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas Scene */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-xs text-cyan-400 font-semibold animate-pulse">
              Synthesizing 3D High-Frequency Bar Geometry...
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 2.2, 3.8], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[4, 5, 4]} intensity={1.5} color="#FFFFFF" />
            <directionalLight position={[-4, 3, -2]} intensity={0.8} color="#22D3EE" />
            <pointLight position={[0, -0.5, 1.5]} intensity={0.5} color="#10B981" />

            <group position={[0, -0.55, 0]}>
              {/* Floor Plate / Laboratory Telemetry Grid */}
              <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4.8, 1.8]} />
                <meshStandardMaterial
                  color="#0B131E"
                  roughness={0.5}
                  metalness={0.3}
                />
              </mesh>

              {/* High-frequency glowing concentric grid rings */}
              <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.2, 2.22, 64]} />
                <meshBasicMaterial color="#06B6D4" transparent opacity={0.35} />
              </mesh>
              <mesh position={[0, -0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.35, 2.36, 64]} />
                <meshBasicMaterial color="#10B981" transparent opacity={0.2} />
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
      <div className="relative z-10 mt-auto flex items-center justify-between px-3 py-2 gap-2 border-t border-slate-800/80 bg-[#0B131E]/90 backdrop-blur-md rounded-b-2xl">
        {/* Day Pills */}
        <div className="flex items-center gap-1 sm:gap-2">
          {chartData.map((d) => (
            <button
              key={d.day + d.date}
              onClick={() => setHoveredDay(hoveredDay === d.day ? null : d.day)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                hoveredDay === d.day
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>

        {/* Metric Selector Toggle */}
        {onMetricToggle && (
          <div className="flex items-center bg-[#070D18] p-0.5 rounded-lg border border-slate-700/60 text-[10px]">
            <button
              onClick={() => onMetricToggle('calories')}
              className={`px-2.5 py-0.5 rounded-md font-bold transition-all ${
                activeMetric === 'calories'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calories
            </button>
            <button
              onClick={() => onMetricToggle('duration')}
              className={`px-2.5 py-0.5 rounded-md font-bold transition-all ${
                activeMetric === 'duration'
                  ? 'bg-slate-800 text-emerald-300 shadow-sm border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
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
