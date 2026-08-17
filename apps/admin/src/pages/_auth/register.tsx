import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, Checkbox, Form, Input } from 'antd';
import { AuthSupportCard } from './components/auth-support-card';

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthSupportCard
      description="创建账号以开始使用 React Starter"
      footer={(
        <>
          已有账号？
          {' '}
          <Link to="/login">登录</Link>
        </>
      )}
      title="创建账号"
    >
      <Form layout="vertical">
        <Form.Item name="username"><Input placeholder="用户名" size="large" /></Form.Item>
        <Form.Item name="password"><Input.Password placeholder="密码" size="large" /></Form.Item>
        <Form.Item name="confirmPassword"><Input.Password placeholder="确认密码" size="large" /></Form.Item>
        <Form.Item><Checkbox>我同意隐私政策和服务条款</Checkbox></Form.Item>
        <Button block size="large" type="primary">注册</Button>
      </Form>
    </AuthSupportCard>
  );
}
