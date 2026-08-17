import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, Form, Input } from 'antd';
import { AuthSupportCard } from './components/auth-support-card';

export const Route = createFileRoute('/_auth/forget-password')({ component: RouteComponent });

function RouteComponent() {
  return (
    <AuthSupportCard description="输入邮箱以重置您的密码" footer={<Link to="/login">返回登录</Link>} title="忘记密码">
      <Form layout="vertical">
        <Form.Item name="email">
          <Input placeholder="example@example.com" size="large" />
        </Form.Item>
        <Button block size="large" type="primary">发送重置邮件</Button>
      </Form>
    </AuthSupportCard>
  );
}
