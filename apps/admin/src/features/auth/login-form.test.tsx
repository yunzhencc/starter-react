import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoginForm } from '../../pages/_auth/login';

describe('local demo login form', () => {
  it('shows the Vben credentials and remember-me control', () => {
    const markup = renderToStaticMarkup(<LoginForm onSuccess={() => undefined} />);

    expect(markup).toContain('vben / 123456');
    expect(markup).toContain('记住我');
  });
});
