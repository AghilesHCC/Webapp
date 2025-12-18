import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

export function BarChart({
  data,
  height = 300,
  showValues = true,
  formatValue = (v) => v.toString(),
}: BarChartProps) {
  const bars = useMemo(() => {
    if (!data.length) {
      return [];
    }

    const max = Math.max(...data.map(d => d.value));
    const barWidth = 80 / data.length;
    const gap = barWidth * 0.2;
    const actualBarWidth = barWidth - gap;

    return data.map((d, i) => {
      const barHeight = max > 0 ? (d.value / max) * 70 : 0;
      const x = 10 + i * barWidth;
      const y = 80 - barHeight;

      return {
        x,
        y,
        width: actualBarWidth,
        height: barHeight,
        value: d.value,
        label: d.label,
        color: d.color || '#3B82F6',
      };
    });
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 100"
        className="w-full"
        style={{ height: `${height}px` }}
      >
        <line
          x1="10"
          y1="80"
          x2="90"
          y2="80"
          stroke="#E5E7EB"
          strokeWidth="0.5"
        />

        {bars.map((bar, i) => (
          <g key={i}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              rx="0.5"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{`${bar.label}: ${formatValue(bar.value)}`}</title>
            </rect>

            {showValues && bar.height > 5 && (
              <text
                x={bar.x + bar.width / 2}
                y={bar.y + bar.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-white text-[3px] font-semibold"
                fill="white"
              >
                {formatValue(bar.value)}
              </text>
            )}

            <text
              x={bar.x + bar.width / 2}
              y="88"
              textAnchor="middle"
              className="text-[3px] fill-gray-600"
            >
              {bar.label.length > 10 ? bar.label.substring(0, 10) + '...' : bar.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
