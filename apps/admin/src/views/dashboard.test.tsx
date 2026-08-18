import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardView } from './dashboard';

vi.mock('./dashboard-chart', () => ({
  DashboardChart: ({ label }: { label: string }) => <div aria-label={label} data-echarts />,
}));

describe('dashboardView', () => {
  it('renders the Vben analytics hierarchy and switches the primary chart', () => {
    render(<DashboardView />);

    expect(screen.getByText('用户量')).toBeTruthy();
    expect(screen.getByText('访问数量')).toBeTruthy();
    expect(screen.getAllByLabelText(/图$/)).toHaveLength(4);
    fireEvent.click(screen.getByRole('tab', { name: '月访问量' }));
    expect(screen.getByLabelText('月访问量图')).toBeTruthy();
  });
});
