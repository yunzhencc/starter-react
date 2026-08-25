import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { loadLocaleMessages, setupI18n } from '@yunzhen/locales';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

beforeEach(async () => {
  await setupI18n();
  await loadLocaleMessages('zh-CN');
});

afterEach(cleanup);

describe('playground locales example', () => {
  it('renders a shared message and switches it to English', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '返回' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(await screen.findByRole('heading', { name: 'Back' })).toBeTruthy();
  });
});
