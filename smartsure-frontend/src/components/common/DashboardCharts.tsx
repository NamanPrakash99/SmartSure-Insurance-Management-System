import React from 'react';

interface ChartDataItem {
  label: string
  value: number
  color?: string
}

interface AreaChartProps {
  data: ChartDataItem[]
  color?: string
}

/**
 * A ultra-premium, zero-dependency Area Chart using pure SVG.
 * Perfect for a high-performance dashboard.
 */
export const AreaChart: React.FC<AreaChartProps> = ({ data, color = '#6366f1' }) => {
  if (!data || data.length === 0) return null;

  const width = 500;
  const height = 200;
  const padding = 20;

  const maxVal = Math.max(...data.map(d => d.value)) * 1.2 || 100;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: height - (d.value / maxVal) * (height - padding * 2) - padding
  }));

  const pathData = `M ${points[0].x} ${points[0].y} ` + 
    points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
    ` L ${points[data.length-1].x} ${height} L ${points[0].x} ${height} Z`;

  const lineData = `M ${points[0].x} ${points[0].y} ` + 
    points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full h-full relative group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line 
            key={i}
            x1={padding} 
            y1={height * p} 
            x2={width - padding} 
            y2={height * p} 
            className="stroke-surface-200 dark:stroke-surface-800" 
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}

        {/* Area fill */}
        <path 
          d={pathData} 
          fill="url(#chartGradient)" 
          className="animate-fade-in"
        />

        {/* Main line */}
        <path 
          d={lineData} 
          fill="none" 
          stroke={color} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="animate-draw-path"
          // @ts-ignore
          style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
        />

        {/* Interactive dots */}
        {points.map((p, i) => (
          <circle 
            key={i}
            cx={p.x} 
            cy={p.y} 
            r="4" 
            fill="white" 
            stroke={color} 
            strokeWidth="2"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ transitionDelay: `${i * 50}ms` }}
          />
        ))}
      </svg>
      
      {/* Legend / Labels */}
      <div className="absolute bottom-0 inset-x-0 flex justify-between px-4 text-[10px] font-bold text-surface-400">
         {data.map((d, i) => (
           <span key={i}>{d.label}</span>
         ))}
      </div>
    </div>
  );
};

interface DonutChartProps {
  percent: number
  label?: string
  color?: string
}

export const DonutChart: React.FC<DonutChartProps> = ({ percent, label, color = '#10b981' }) => {
  const size = 160;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-100 dark:text-surface-800"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-x-0 text-center">
        <span className="block text-3xl font-bold dark:text-white leading-none">{percent}%</span>
        {label && <span className="text-[10px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mt-1 block">{label}</span>}
      </div>
    </div>
  );
};

interface BarChartProps {
  data: ChartDataItem[]
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => Number(d.value) || 0)) || 1;

  return (
    <div className="h-full w-full flex flex-col pt-12">
      <div className="flex-1 flex items-end justify-around gap-6 sm:gap-10 px-4">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
            {/* Consistent Top-Aligned Tooltip - Sleeker Design */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-2xl translate-y-2 group-hover:translate-y-0 z-20 whitespace-nowrap border border-white/10 dark:border-black/5">
               {item.value}
            </div>

            <div className="w-full flex items-end justify-center h-full pb-8">
              <div 
                className="w-full sm:w-20 rounded-t-xl transition-all duration-500 ease-out shadow-lg hover:shadow-2xl hover:brightness-110" 
                style={{ 
                  height: `${(Number(item.value) / maxVal) * 90}%`,
                  backgroundColor: item.color || '#6366f1',
                  minHeight: item.value > 0 ? '4px' : '0px'
                }}
              >
              </div>
            </div>
            
            <div className="absolute bottom-0 inset-x-0 text-center">
              <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest truncate block">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface GaugeChartProps {
  percent: number
  color?: string
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ percent, color = '#6366f1' }) => {
  const size = 200;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center pt-8 overflow-hidden">
      <svg width={size} height={size / 2 + 20} className="transform">
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-100 dark:text-surface-800"
          strokeLinecap="round"
        />
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute top-1/2 mt-4 text-center">
        <span className="block text-4xl font-black dark:text-white leading-none">{percent}%</span>
      </div>
    </div>
  );
};
