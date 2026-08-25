import type { EChartsOption } from 'echarts';
import { act, render, screen } from '@testing-library/react';
import { resetPreferences, updatePreferences } from '@yunzhen/preferences';
import * as echarts from 'echarts/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardChart } from './dashboard-chart';

const wrapper = vi.hoisted(() => ({ props: undefined as Record<string, unknown> | undefined }));
const resizeObserver = vi.hoisted(() => ({ callback: undefined as ResizeObserverCallback | undefined }));

vi.mock('echarts-for-react/esm/core', () => ({
  default: (props: Record<string, unknown>) => {
    wrapper.props = props;
    return <div data-testid="echarts-for-react" />;
  },
}));

describe('dashboard chart', () => {
  beforeEach(() => {
    wrapper.props = undefined;
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) {
        resizeObserver.callback = callback;
      }

      disconnect() {}

      observe() {}
    });
  });

  afterEach(() => {
    resetPreferences();
    vi.unstubAllGlobals();
  });

  it('waits for a nonzero layout before mounting echarts-for-react', () => {
    render(<DashboardChart label="趋势图" option={{}} />);

    expect(screen.queryByTestId('echarts-for-react')).toBeNull();
    act(() => resizeObserver.callback?.([{ contentRect: { height: 300, width: 800 } } as ResizeObserverEntry], {} as ResizeObserver));
    expect(screen.getByTestId('echarts-for-react')).toBeTruthy();
  });

  it('keeps the existing chart options while delegating lifecycle and resize to echarts-for-react', () => {
    const option: EChartsOption = { series: [{ data: [1], type: 'line' }] };
    render(<DashboardChart label="趋势图" option={option} />);
    act(() => resizeObserver.callback?.([{ contentRect: { height: 300, width: 800 } } as ResizeObserverEntry], {} as ResizeObserver));

    expect(wrapper.props).toMatchObject({
      'aria-label': '趋势图',
      'autoResize': true,
      'className': 'dashboard-chart',
      'echarts': echarts,
      'option': { ...option, backgroundColor: 'transparent' },
      'opts': { renderer: 'canvas' },
      'theme': 'dark',
    });
  });

  it('uses the shared preference theme for ECharts', () => {
    updatePreferences({ theme: { mode: 'light' } });
    render(<DashboardChart label="趋势图" option={{}} />);
    act(() => resizeObserver.callback?.([{ contentRect: { height: 300, width: 800 } } as ResizeObserverEntry], {} as ResizeObserver));

    expect(wrapper.props?.theme).toBeUndefined();
  });
});
