// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { unmountAppLoading } from './app-loading';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('app loading', () => {
  it('fades out and removes the static loading screen after the app mounts', () => {
    document.body.innerHTML = '<style data-app-loading="inject-css"></style><div id="__app-loading__"></div>';

    unmountAppLoading();

    const loading = document.querySelector('#__app-loading__');
    expect(loading?.classList.contains('hidden')).toBe(true);

    loading?.dispatchEvent(new Event('transitionend'));

    expect(document.querySelector('#__app-loading__')).toBeNull();
    expect(document.querySelector('[data-app-loading="inject-css"]')).toBeNull();
  });
});
