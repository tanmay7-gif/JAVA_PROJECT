import React from 'react';

export interface CompactChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: any;
    color?: string;
    fill?: string;
    stroke?: string;
    unit?: string;
    dataKey?: string;
    payload?: any;
  }>;
  label?: string | number;
  unit?: string;
  valueFormatter?: (value: any) => string;
}

export const CompactChartTooltip: React.FC<CompactChartTooltipProps> = ({
  active,
  payload,
  label,
  unit,
  valueFormatter,
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-sky-200 bg-white/95 p-2.5 px-3 shadow-md backdrop-blur-md max-w-[210px] pointer-events-none transition-all duration-75">
      {label !== undefined && label !== null && (
        <p className="text-[10px] font-semibold tracking-wider text-sky-700 uppercase mb-1 truncate">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((item, idx) => {
          const itemColor = item.color || item.fill || item.stroke || '#0284C7';
          const itemUnit = item.unit || unit || item.payload?.unit || '';
          const rawValue = item.value;
          const formattedVal = valueFormatter
            ? valueFormatter(rawValue)
            : typeof rawValue === 'number'
            ? rawValue.toLocaleString()
            : rawValue;

          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-700 min-w-0">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: itemColor }}
                />
                <span className="truncate max-w-[105px]">
                  {item.name || item.dataKey || 'Metric'}
                </span>
              </span>
              <span className="text-xs font-bold text-slate-900 shrink-0 flex items-center gap-1">
                <span>{formattedVal}</span>
                {itemUnit && (
                  <span className="text-[10px] font-medium text-slate-500">
                    {itemUnit}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactChartTooltip;
