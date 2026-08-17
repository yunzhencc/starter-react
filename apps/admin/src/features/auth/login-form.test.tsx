import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoginForm } from '../../pages/_auth/login';

describe('local demo login form', () => {
  it('shows Vben demo accounts, slider verification, and remember-me control', () => {
    const markup = renderToStaticMarkup(<LoginForm onSuccess={() => undefined} />);

    expect(markup).toContain('yunzhen / 123456');
    expect(markup).toContain('管理员账号：admin / 123456');
    expect(markup).toContain('拖动滑块完成验证');
    expect(markup).toContain('记住我');
  });
});
