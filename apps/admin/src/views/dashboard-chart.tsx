import type { EChartsOption } from 'echarts';
import EChartsReactCore from 'echarts-for-react/esm/core';
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
import { useEffect, useRef, useState } from 'react';

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
