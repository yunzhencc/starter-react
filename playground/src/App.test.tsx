import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { loadLocaleMessages, setupI18n } from '@yunzhen/locales';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('@yunzhen/layouts', () => ({
  AdminLayout: ({ brand, menuItems, renderPage }: {
    brand: React.ReactNode;
    menuItems: { path: string; title: string }[];
    renderPage: (route: { key: string; path: string; title: string }, refreshVersion: number) => React.ReactNode;
  }) => (
    <div>
      {brand}
      {renderPage({ ...menuItems[0]!, key: menuItems[0]!.path }, 0)}
    </div>
  ),
}));

beforeEach(async () => {
  await setupI18n();
  await loadLocaleMessages('zh-CN');
});

afterEach(() => {
  cleanup();
});

describe('playground locales example', () => {
  it('renders a shared message and switches it to English', async () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Playground' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '返回' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(await screen.findByRole('heading', { name: 'Back' })).toBeTruthy();
  });
});
