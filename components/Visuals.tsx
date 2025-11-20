import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Map as MapIcon } from 'lucide-react';
import LeafletMap from './LeafletMap';
import { Property } from '../types';

interface VisualProps {
  data: any;
  theme?: 'light' | 'dark';
}

export const ChartVisual = ({ data, theme = 'dark' }: VisualProps) => {
  const isDark = theme === 'dark';
  
  // Common Colors (Power BI style palette)
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  const commonOption = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: "'Inter', sans-serif",
    },
    tooltip: {
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: tooltipText },
      borderWidth: 1,
      padding: 12,
      trigger: data.chartType === 'pie' ? 'item' : 'axis',
    },
    grid: {
      top: 30,
      left: 10,
      right: 20,
      bottom: 10,
      containLabel: true,
      borderColor: gridColor
    }
  };

  const getOption = () => {
    if (data.chartType === 'pie') {
      return {
        ...commonOption,
        legend: {
          bottom: '0%',
          left: 'center',
          textStyle: { color: textColor }
        },
        series: [
          {
            name: data.title || 'Distribution',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: isDark ? '#0f172a' : '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
                color: textColor
              },
              itemStyle: {
                 shadowBlur: 10,
                 shadowOffsetX: 0,
                 shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: { show: false },
            data: data.series.map((item: any, index: number) => ({
              value: item.value,
              name: item.name,
              itemStyle: { color: colors[index % colors.length] }
            }))
          }
        ]
      };
    }

    if (data.chartType === 'bar') {
      const hasSeries2 = data.series[0]?.value2 !== undefined;
      return {
        ...commonOption,
        legend: {
            data: hasSeries2 ? ['Series 1', 'Series 2'] : undefined,
            textStyle: { color: textColor },
            top: 0
        },
        xAxis: {
          type: 'category',
          data: data.series.map((d: any) => d.name),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: textColor }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
          axisLabel: { 
            color: textColor,
            formatter: (val: number) => val >= 1000 ? `${val/1000}k` : val
          }
        },
        series: [
          {
            name: 'Series 1',
            data: data.series.map((d: any) => d.value),
            type: 'bar',
            itemStyle: { 
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#3b82f6' },
                    { offset: 1, color: '#1d4ed8' }
                ]),
                borderRadius: [4, 4, 0, 0] 
            },
            barMaxWidth: 40
          },
          ...(hasSeries2 ? [{
            name: 'Series 2',
            data: data.series.map((d: any) => d.value2),
            type: 'bar',
            itemStyle: { 
                color: isDark ? '#64748b' : '#cbd5e1',
                borderRadius: [4, 4, 0, 0]
            },
            barMaxWidth: 40
          }] : [])
        ]
      };
    }

    // Area Chart (Trend)
    return {
      ...commonOption,
      tooltip: {
        ...commonOption.tooltip,
        axisPointer: {
          type: 'cross',
          label: { backgroundColor: '#6a7985' }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.series.map((d: any) => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
        axisLabel: { color: textColor }
      },
      series: [
        {
          name: data.title || 'Trend',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: { width: 3, color: '#3b82f6' },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: data.series.map((d: any) => d.value)
        }
      ]
    };
  };

  return (
    <div className="w-full h-full min-h-[250px]">
       <ReactECharts 
         option={getOption()} 
         style={{ height: '100%', width: '100%' }} 
         theme={isDark ? 'dark' : undefined}
       />
    </div>
  );
};

export const MapVisual = ({ data, theme = 'dark' }: VisualProps) => {
  const isDark = theme === 'dark';

  const properties = data?.properties || [];
  const center = data?.center || [13.7563, 100.5018];
  const zoom = data?.zoom || 11;

  const avgPrice = properties.length > 0
    ? Math.round(properties.reduce((sum: number, p: Property) => sum + p.monthlyRent, 0) / properties.length)
    : 85000;

  const activeCount = properties.filter((p: Property) => p.status === 'Active').length;
  const demandScore = Math.min(10, (activeCount / properties.length) * 10 || 8.5).toFixed(1);

  return (
    <div className="h-full flex flex-col relative overflow-hidden rounded-xl">
      {/* Map Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-lg border border-slate-200/50">
        <LeafletMap
          properties={properties}
          center={center}
          zoom={zoom}
          height="100%"
          theme={isDark ? 'dark' : 'light'}
          showCluster={data?.showCluster || false}
        />

        {/* Floating Stats */}
        <div
          className={`absolute top-4 right-4 p-3 rounded-lg border shadow-xl z-[1000]
            ${isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}
        >
          <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Avg Monthly Rent
          </div>
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            ฿{avgPrice.toLocaleString()}
          </div>
        </div>

        <div
          className={`absolute bottom-4 left-4 p-3 rounded-lg border shadow-xl z-[1000]
            ${isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}
        >
          <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Active Properties
          </div>
          <div className={`text-lg font-bold ${activeCount > 0 ? 'text-green-500' : 'text-slate-500'}`}>
            {activeCount} / {properties.length}
          </div>
        </div>

        <div
          className={`absolute bottom-4 right-4 p-3 rounded-lg border shadow-xl z-[1000]
            ${isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}
        >
          <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Portfolio Health
          </div>
          <div className={`text-lg font-bold text-amber-500`}>
            {demandScore}/10
          </div>
        </div>
      </div>
    </div>
  );
}