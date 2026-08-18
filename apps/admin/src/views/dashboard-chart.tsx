import type { EChartsOption } from 'echarts';
import EChartsReactCore from 'echarts-for-react/esm/core';
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout, LegacyGridContainLabel } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

echarts.use([
  PieChart,
  RadarChart,
  TooltipComponent,
  GridComponent,
  BarChart,
  LineChart,
  LabelLayout,
  LegacyGridContainLabel,
  CanvasRenderer,
  LegendComponent,
]);

export function DashboardChart({ label, option }: { label: string; option: EChartsOption }) {
  const { resolvedTheme } = useTheme();
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasLayout, setHasLayout] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        observer.disconnect();
        setHasLayout(true);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!hasLayout) {
    return <div aria-label={label} className="dashboard-chart" ref={elementRef} />;
  }

  return <EChartsReactCore aria-label={label} autoResize className="dashboard-chart" echarts={echarts} option={{ ...option, backgroundColor: 'transparent' }} opts={{ renderer: 'canvas' }} theme={resolvedTheme === 'dark' ? 'dark' : undefined} />;
}
