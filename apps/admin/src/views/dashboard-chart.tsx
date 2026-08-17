import type { EChartsOption } from 'echarts';
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout, LegacyGridContainLabel, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

echarts.use([
  TitleComponent,
  PieChart,
  RadarChart,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  LegacyGridContainLabel,
  UniversalTransition,
  CanvasRenderer,
  LegendComponent,
  ToolboxComponent,
]);

export function DashboardChart({ label, option }: { label: string; option: EChartsOption }) {
  const { resolvedTheme } = useTheme();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const chart = echarts.init(element, resolvedTheme === 'dark' ? 'dark' : null);
    chart.setOption({ ...option, backgroundColor: 'transparent' });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(element);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option, resolvedTheme]);

  return <div aria-label={label} className="dashboard-chart" ref={elementRef} />;
}
