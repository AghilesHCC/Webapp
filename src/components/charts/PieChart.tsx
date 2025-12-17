import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: DataPoint[];
  size?: number;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
}

const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
];

export function PieChart({
  data,
  size = 200,
  showLegend = true,
  formatValue = (v) => v.toString(),
}: PieChartProps) {
  const { segments, total } = useMemo(() => {
    if (!data.length) {
      return { segments: [], total: 0 };
    }

    const totalValue = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -90;

    const segmentsData = data.map((d, i) => {
      const percentage = totalValue > 0 ? (d.value / totalValue) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
        `Z`,
      ].join(' ');

      currentAngle = endAngle;

      return {
        path,
        color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        label: d.label,
        value: d.value,
        percentage,
      };
    });

    return { segments: segmentsData, total: totalValue };
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 100 100"
        className="w-full"
        style={{ maxWidth: `${size}px`, height: 'auto' }}
      >
        {segments.map((segment, i) => (
          <g key={i}>
            <path
              d={segment.path}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              stroke="white"
              strokeWidth="0.5"
            >
              <title>{`${segment.label}: ${formatValue(segment.value)} (${segment.percentage.toFixed(1)}%)`}</title>
            </path>
          </g>
        ))}

        <circle cx="50" cy="50" r="25" fill="white" />

        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="text-[8px] font-bold fill-gray-800"
        >
          Total
        </text>
        <text
          x="50"
          y="56"
          textAnchor="middle"
          className="text-[6px] fill-gray-600"
        >
          {formatValue(total)}
        </text>
      </svg>

      {showLegend && (
        <div className="grid grid-cols-2 gap-2 w-full text-sm">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-700 truncate text-xs">
                {segment.label}
              </span>
              <span className="text-gray-500 ml-auto text-xs">
                {segment.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
