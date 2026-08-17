import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router';
import { SliderCaptcha } from '@yunzhen/common-ui/captcha';
import { Button, Card, Checkbox, Form, Input, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getSafeRedirect } from '../../features/auth/redirect';
import { demoUsernames, getSession, login } from '../../features/auth/session';
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
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginValues>();

  function submit(values: LoginValues) {
    if (!captchaVerified) {
      setError('请先完成滑块验证');
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
      <Typography.Title id="login-title" level={2}>欢迎回来</Typography.Title>
      <Typography.Paragraph type="secondary">使用演示账号登录管理后台</Typography.Paragraph>
      <Form<LoginValues> form={form} initialValues={{ password: '123456', remember: true, username: 'yunzhen' }} layout="vertical" onFinish={submit} requiredMark={false}>
        <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
          <Select
            onChange={(username) => {
              form.setFieldsValue({ password: '123456', username });
              setError(undefined);
              setCaptchaVerified(false);
            }}
            options={demoUsernames.map(username => ({ label: username, value: username }))}
            size="large"
          />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password autoComplete="current-password" size="large" />
        </Form.Item>
        <SliderCaptcha
          onSuccess={() => {
            setCaptchaVerified(true);
            setError(undefined);
          }}
        />
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>记住我</Checkbox>
        </Form.Item>
        {error && <div className="login-error" role="alert">{error}</div>}
        <Button block htmlType="submit" loading={submitting} size="large" type="primary">登录</Button>
      </Form>
      <div className="login-hint">
        <span>演示账号：yunzhen / 123456</span>
        <span>管理员账号：admin / 123456</span>
        <span>用户账号：jack / 123456</span>
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
