import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
}

export function LineChart({
  data,
  height = 300,
  color = '#3B82F6',
  showGrid = true,
  formatValue = (v) => v.toString(),
}: LineChartProps) {
  const { points, maxValue, minValue, yAxisLabels } = useMemo(() => {
    if (!data.length) {
      return { points: '', maxValue: 0, minValue: 0, yAxisLabels: [] };
    }

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const padding = 40;
    const chartHeight = height - padding * 2;
    const chartWidth = 100 - 10;
    const stepX = chartWidth / (data.length - 1 || 1);

    const pointsArray = data.map((d, i) => {
      const x = 5 + i * stepX;
      const y = padding + chartHeight - ((d.value - min) / range) * chartHeight;
      return `${x},${y}`;
    });

    const steps = 5;
    const yLabels = Array.from({ length: steps + 1 }, (_, i) => {
      const value = min + (range * i) / steps;
      return value;
    }).reverse();

    return {
      points: pointsArray.join(' '),
      maxValue: max,
      minValue: min,
      yAxisLabels: yLabels,
    };
  }, [data, height]);

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
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {showGrid && (
          <g className="text-gray-200">
            {yAxisLabels.map((_, i) => {
              const y = 40 + (i * (height - 80)) / (yAxisLabels.length - 1);
              return (
                <line
                  key={i}
                  x1="5"
                  y1={y}
                  x2="95"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.2"
                  strokeDasharray="1,1"
                />
              );
            })}
          </g>
        )}

        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <polyline
          points={`${points} 95,${height - 40} 5,${height - 40}`}
          fill={color}
          fillOpacity="0.1"
          stroke="none"
        />

        {data.map((d, i) => {
          const pointArr = points.split(' ')[i].split(',');
          const x = parseFloat(pointArr[0]);
          const y = parseFloat(pointArr[1]);

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="1.5"
                fill={color}
                className="hover:r-2 transition-all cursor-pointer"
              >
                <title>{`${d.label}: ${formatValue(d.value)}`}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="flex justify-between mt-2 text-xs text-gray-600 px-2">
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) {
            return (
              <span key={i} className="truncate">
                {d.label}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
