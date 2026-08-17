import { createFileRoute } from '@tanstack/react-router';
import { AuthSupportCard } from './components/auth-support-card';

export const Route = createFileRoute('/_auth/qrcode-login')({ component: RouteComponent });

function RouteComponent() {
  return <AuthSupportCard description="请使用手机客户端扫码确认登录" footer={<a href="/login">密码登录</a>} title="二维码登录"><div aria-label="登录二维码" className="auth-qr" /></AuthSupportCard>;
}
