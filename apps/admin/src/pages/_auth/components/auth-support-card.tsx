import type { PropsWithChildren, ReactNode } from 'react';
import { Card, Typography } from 'antd';
import './auth-support-card.css';

interface AuthSupportCardProps extends PropsWithChildren {
  description: string;
  footer?: ReactNode;
  title: string;
}

export function AuthSupportCard({ children, description, footer, title }: AuthSupportCardProps) {
  return (
    <Card className="auth-support-card" variant="borderless">
      <Typography.Title level={2}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      {children}
      {footer && <div className="auth-support-card__footer">{footer}</div>}
    </Card>
  );
}
