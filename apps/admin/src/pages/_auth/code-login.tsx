import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, Form, Input } from 'antd';
import { AuthSupportCard } from './components/auth-support-card';

export const Route = createFileRoute('/_auth/code-login')({ component: RouteComponent });

function RouteComponent() {
  return (
    <AuthSupportCard description="使用手机验证码安全登录" footer={<Link to="/login">密码登录</Link>} title="手机登录">
      <Form layout="vertical">
        <Form.Item name="phone"><Input placeholder="手机号码" size="large" /></Form.Item>
        <Form.Item name="code"><Input placeholder="验证码" size="large" suffix={<Button type="link">获取验证码</Button>} /></Form.Item>
        <Button block size="large" type="primary">登录</Button>
      </Form>
    </AuthSupportCard>
  );
}
