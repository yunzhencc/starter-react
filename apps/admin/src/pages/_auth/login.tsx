import { createFileRoute, Link, useLocation, useNavigate } from '@tanstack/react-router';
import { SliderCaptcha } from '@yunzhen/common-ui/captcha';
import { Button, Card, Checkbox, Form, Input, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getSafeRedirect } from '../../features/auth/redirect';
import { demoUsernames, getSession, login } from '../../features/auth/session';
import './login.css';

interface LoginValues {
  password: string;
  remember: boolean;
  selectAccount: string;
  username: string;
}

interface LoginFormProps {
  onSuccess: () => void;
}

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
});

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [captchaError, setCaptchaError] = useState<string>();
  const [error, setError] = useState<string>();
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginValues>();

  function submit(values: LoginValues) {
    if (!captchaVerified) {
      setCaptchaError('请先完成滑块验证');
      return;
    }

    setSubmitting(true);
    setError(undefined);
    if (login(values)) {
      onSuccess();
    }
    else {
      setError('账号或密码错误');
      setSubmitting(false);
    }
  }

  return (
    <Card className="login-card" variant="borderless">
      <div className="login-title">
        <Typography.Title id="login-title" level={2}>欢迎回来 👋🏻</Typography.Title>
        <Typography.Paragraph type="secondary">请输入您的账号和密码登录</Typography.Paragraph>
      </div>
      <Form<LoginValues> form={form} initialValues={{ password: '123456', remember: true, selectAccount: 'vben', username: 'vben' }} layout="vertical" onFinish={submit} requiredMark={false}>
        <Form.Item name="selectAccount">
          <Select
            aria-label="选择账号"
            onChange={(username) => {
              form.setFieldsValue({ password: '123456', username });
              setCaptchaError(undefined);
              setError(undefined);
              setCaptchaVerified(false);
            }}
            options={demoUsernames.filter(username => username !== 'yunzhen').map(username => ({ label: username === 'vben' ? 'Super' : username === 'admin' ? 'Admin' : 'User', value: username }))}
            placeholder="选择账号"
            size="large"
          />
        </Form.Item>
        <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input aria-label="用户名" autoComplete="username" placeholder="用户名" size="large" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password aria-label="密码" autoComplete="current-password" placeholder="密码" size="large" />
        </Form.Item>
        <Form.Item className="login-captcha-item" help={captchaError} validateStatus={captchaError ? 'error' : undefined}>
          <SliderCaptcha
            onSuccess={() => {
              setCaptchaVerified(true);
              setCaptchaError(undefined);
              setError(undefined);
            }}
          />
        </Form.Item>
        <div className="login-options">
          <Form.Item name="remember" valuePropName="checked"><Checkbox>记住我</Checkbox></Form.Item>
          <Link to="/forget-password">忘记密码？</Link>
        </div>
        {error && <div className="login-error" role="alert">{error}</div>}
        <Button block htmlType="submit" loading={submitting} size="large" type="primary">登录</Button>
        <div className="login-alt-actions">
          <Link to="/code-login">手机登录</Link>
          <Link to="/qrcode-login">二维码登录</Link>
        </div>
      </Form>
      <div className="login-third-party">
        <div className="login-third-party__divider">
          <span />
          <span className="login-third-party__label">其他登录方式</span>
          <span />
        </div>
        <div className="login-third-party__providers">
          <button aria-label="微信登录" className="login-third-party__provider" type="button"><img alt="" src="/images/auth/wechat.svg" /></button>
          <button aria-label="QQ 登录" className="login-third-party__provider" type="button"><img alt="" src="/images/auth/qqchat.svg" /></button>
          <button aria-label="GitHub 登录" className="login-third-party__provider login-third-party__provider--github" type="button"><img alt="" src="/images/auth/github.svg" /></button>
          <button aria-label="Google 登录" className="login-third-party__provider" type="button"><img alt="" src="/images/auth/google.svg" /></button>
        </div>
      </div>
      <div className="login-register">
        还没有账号？
        {' '}
        <Link to="/register">注册</Link>
      </div>
    </Card>
  );
}

function RouteComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = getSafeRedirect(new URLSearchParams(location.searchStr).get('redirect') ?? undefined);

  useEffect(() => {
    if (getSession()) {
      void navigate({ replace: true, to: destination as never });
    }
  }, [destination, navigate]);

  if (getSession()) {
    return null;
  }

  return <LoginForm onSuccess={() => void navigate({ replace: true, to: destination as never })} />;
}
