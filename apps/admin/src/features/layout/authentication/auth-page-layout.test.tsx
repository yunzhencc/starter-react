// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthPageLayout } from './auth-page-layout';
import { setAuthPageLayout } from './preferences';

class ResizeObserverStub {
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', { value: ResizeObserverStub });

afterEach(() => localStorage.clear());

function renderLayout(layout: 'panel-left' | 'panel-center' | 'panel-right') {
  setAuthPageLayout(layout);
  return renderToStaticMarkup(
    <AuthPageLayout appName="React Starter" logo="/logo.svg">
      <div>Login form</div>
    </AuthPageLayout>,
  );
}

describe('auth page layout', () => {
  it('renders the selected side or center layout', () => {
    expect(renderLayout('panel-left')).toContain('data-layout="panel-left"');
    expect(renderLayout('panel-right')).toContain('data-layout="panel-right"');
    expect(renderLayout('panel-center')).toContain('data-layout="panel-center"');
  });

  it('only renders the hero for side layouts', () => {
    expect(renderLayout('panel-left')).toContain('auth-page-layout__hero');
    expect(renderLayout('panel-right')).toContain('auth-page-layout__hero');
    expect(renderLayout('panel-center')).not.toContain('auth-page-layout__hero');
  });

  it('uses the original CareerCompass characters as the default hero effect', () => {
    const markup = renderLayout('panel-right');

    expect(markup).toContain('auth-page-layout__toolbar');
    expect(markup).toContain('auth-page-layout__hero-background');
    expect(markup).toContain('auth-page-layout__hero-content');
    expect(markup).toContain('auth-page-layout__careercompass-characters');
    expect(markup).not.toContain('auth-page-layout__slogan');
    expect(markup).toContain('auth-page-layout__brand');
    expect(markup).toContain('auth-page-layout__content');
    expect(markup).not.toContain('class="auth-page-layout__copy"');
  });

  it('applies the layout chosen from its toolbar', () => {
    const { container } = render(
      <AuthPageLayout appName="React Starter" logo="/logo.svg">
        <div>Login form</div>
      </AuthPageLayout>,
    );

    fireEvent.click(screen.getByLabelText('登录页布局'));
    fireEvent.click(screen.getByText('表单居左'));

    expect(container.querySelector('[data-layout="panel-left"]')).not.toBeNull();
    expect(localStorage.getItem('starter-react:auth-page-layout')).toBe('panel-left');
  });

  it('uses Vben-ordered layout options with a matching trigger icon', () => {
    const { container } = render(
      <AuthPageLayout appName="React Starter" logo="/logo.svg">
        <div>Login form</div>
      </AuthPageLayout>,
    );

    const toggle = container.querySelector<HTMLButtonElement>('[aria-label="登录页布局"]');
    expect(toggle).not.toBeNull();
    if (!toggle) {
      return;
    }
    expect(toggle.getAttribute('data-layout')).toBe('panel-right');
    fireEvent.click(toggle);

    const dropdowns = document.querySelectorAll('.auth-page-layout-toggle__dropdown');
    const options = [...(dropdowns.item(dropdowns.length - 1)?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    expect(options.map(option => option.textContent)).toEqual(['表单居左', '表单居中', '表单居右']);
    expect(options.every(option => option.querySelector('svg'))).toBe(true);
    expect(container.querySelector('.auth-page-layout__toolbar')).not.toBeNull();
  });
});
