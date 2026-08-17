import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoginForm } from '../../pages/_auth/login';

describe('local demo login form', () => {
  it('renders the complete Vben login surface around the local demo captcha', () => {
    const markup = renderToStaticMarkup(<LoginForm onSuccess={() => undefined} />);

    expect(markup).toContain('欢迎回来 👋🏻');
    expect(markup).toContain('Super');
    expect(markup).toContain('拖动滑块完成验证');
    expect(markup).not.toContain('type="range"');
    expect(markup).toContain('记住我');
    expect(markup).toContain('忘记密码？');
    expect(markup).toContain('手机登录');
    expect(markup).toContain('二维码登录');
    expect(markup).toContain('其他登录方式');
    expect(markup).toContain('还没有账号？');
    expect(markup).toContain('注册');
  });
});
