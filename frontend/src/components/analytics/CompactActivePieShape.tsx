import React from 'react';
import { Sector } from 'recharts';

export interface CompactActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload?: any;
  value?: number;
  percent?: number;
}

/**
 * Compact active shape formatter for Recharts Pie/Donut charts.
 * Prevents over-expansion of outerRadius (+2.5px max instead of +10px/+30px)
 * and eliminates overflowing SVG text labels or leader lines over the canvas.
 * Micro-typography is placed safely inside the donut hole.
 */
export const CompactActivePieShape: React.FC<CompactActiveShapeProps> = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percent,
  } = props;

  const label = payload?.name || 'Selected';
  const displayVal =
    payload?.sessionsCount !== undefined
      ? `${payload.sessionsCount} sessions`
      : value !== undefined
      ? `${value.toLocaleString()}${percent !== undefined ? ` (${Math.round(percent * 100)}%)` : ''}`
      : '';

  return (
    <g className="transition-all duration-200">
      {/* Center Donut Hole Micro Label (strictly inside donut hole) */}
      {innerRadius > 25 && (
        <>
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            className="fill-slate-400 text-[10px] font-semibold uppercase tracking-wider select-none pointer-events-none"
          >
            {label}
          </text>
          <text
            x={cx}
            y={cy + 11}
            textAnchor="middle"
            className="fill-white text-xs font-bold select-none pointer-events-none"
          >
            {displayVal}
          </text>
        </>
      )}

      {/* Main Sector - minimal +2.5px radius expansion to maintain compact boundaries */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 2.5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#0B131E"
        strokeWidth={2}
      />

      {/* Subtle outer neon halo ring (tight +4 to +5.5px) */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 5.5}
        fill={fill}
        opacity={0.45}
      />
    </g>
  );
};

export const renderCompactActivePieShape = (props: any) => {
  return <CompactActivePieShape {...props} />;
};
