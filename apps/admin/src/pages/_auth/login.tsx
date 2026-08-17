import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router';
import { Button, Card, Checkbox, Form, Input, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getSafeRedirect } from '../../features/auth/redirect';
import { getSession, login } from '../../features/auth/session';
import './login.css';

interface LoginValues {
  password: string;
  remember: boolean;
  username: string;
}

interface LoginFormProps {
  onSuccess: () => void;
}

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
});

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  function submit(values: LoginValues) {
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
    <Card className="login-card" bordered={false}>
      <Typography.Title level={2}>欢迎回来</Typography.Title>
      <Typography.Paragraph type="secondary">使用本地演示账号登录管理后台</Typography.Paragraph>
      <Form<LoginValues> initialValues={{ remember: true, username: 'vben' }} layout="vertical" onFinish={submit} requiredMark={false}>
        <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
          <Input autoComplete="username" size="large" />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password autoComplete="current-password" size="large" />
        </Form.Item>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>记住我</Checkbox>
        </Form.Item>
        {error && <div className="login-error" role="alert">{error}</div>}
        <Button block htmlType="submit" loading={submitting} size="large" type="primary">登录</Button>
      </Form>
      <div className="login-hint">演示账号：vben / 123456</div>
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

  return (
    <main className="login-page">
      <LoginForm onSuccess={() => void navigate({ replace: true, to: destination as never })} />
    </main>
  );
}
