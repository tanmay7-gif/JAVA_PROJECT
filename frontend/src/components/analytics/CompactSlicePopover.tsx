import React from 'react';
import { X } from 'lucide-react';

export interface SliceData {
  name: string;
  value: number;
  color?: string;
  sessionsCount?: number;
  percent?: number;
  unit?: string;
}

export interface CompactSlicePopoverProps {
  slice: SliceData | null;
  onClose: () => void;
  title?: string;
  metricLabel?: string;
  unit?: string;
}

/**
 * Compact click modal / info popover for selected Pie/Donut chart slices.
 * Downsizes footprint from oversized modal to compact glass chip (max-w-[210px]).
 */
export const CompactSlicePopover: React.FC<CompactSlicePopoverProps> = ({
  slice,
  onClose,
  title = 'Selected Category',
  metricLabel = 'Sessions',
  unit,
}) => {
  if (!slice) return null;

  const color = slice.color || '#06B6D4';
  const displayPercent =
    slice.percent !== undefined
      ? `${Math.round(slice.percent * 100)}%`
      : slice.value !== undefined && typeof slice.value === 'number'
      ? `${slice.value}%`
      : '';

  return (
    <div className="rounded-lg border border-slate-700/80 bg-[#0b101c]/95 p-2.5 px-3 shadow-2xl backdrop-blur-md max-w-[210px] w-full animate-in fade-in zoom-in-95 duration-150">
      {/* Micro Uppercase Header */}
      <div className="flex items-center justify-between gap-2 mb-1 border-b border-slate-800/80 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
          {title}
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-slate-800 transition-colors"
          title="Dismiss"
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Slice Details */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-bold text-slate-100 truncate">
            {slice.name}
          </span>
        </div>
        {displayPercent && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            {displayPercent}
          </span>
        )}
      </div>

      {/* Metric Breakdown */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1 border-t border-slate-800/50">
        <span>{metricLabel}</span>
        <span className="font-bold text-white">
          {slice.sessionsCount !== undefined
            ? slice.sessionsCount.toLocaleString()
            : slice.value.toLocaleString()}{' '}
          {unit || ''}
        </span>
      </div>
    </div>
  );
};

export default CompactSlicePopover;
