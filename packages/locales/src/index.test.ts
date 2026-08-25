import { describe, expect, it } from 'vitest';
import * as locales from './index';

interface LocalesApi {
  i18n: {
    language: string;
    t: (key: string) => string;
  };
  loadLocaleMessages: (locale: string) => Promise<void>;
  setupI18n: (options?: {
    defaultLocale?: string;
    loadMessages?: (locale: string) => Promise<Record<string, unknown>>;
  }) => Promise<void>;
}

const api = locales as unknown as LocalesApi;

describe('@yunzhen/locales', () => {
  it('prefers the stored locale during initialization', async () => {
    localStorage.setItem('starter-react:locale', 'en-US');

    await api.setupI18n({ defaultLocale: 'zh-CN' });

    expect(api.i18n.language).toBe('en-US');
    expect(api.i18n.t('ui.back')).toBe('Back');
    expect(api.i18n.t('ui.lockScreen.title')).toBe('Lock Screen');
    expect(document.documentElement.lang).toBe('en-US');
  });

  it('merges application messages and switches the document language', async () => {
    expect(api.setupI18n).toBeTypeOf('function');
    expect(api.loadLocaleMessages).toBeTypeOf('function');

    await api.setupI18n({
      defaultLocale: 'zh-CN',
      loadMessages: async locale => ({
        dashboard: { title: locale === 'zh-CN' ? '工作台' : 'Dashboard' },
      }),
    });

    expect(api.i18n.t('ui.back')).toBe('返回');
    expect(api.i18n.t('ui.lockScreen.title')).toBe('锁定屏幕');
    expect(api.i18n.t('dashboard.title')).toBe('工作台');
    expect(document.documentElement.lang).toBe('zh-CN');

    await api.loadLocaleMessages('en-US');

    expect(api.i18n.language).toBe('en-US');
    expect(api.i18n.t('ui.back')).toBe('Back');
    expect(api.i18n.t('dashboard.title')).toBe('Dashboard');
    expect(document.documentElement.lang).toBe('en-US');
  });
});
