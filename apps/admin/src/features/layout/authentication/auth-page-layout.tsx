import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { ThemeToggle } from '../../theme/theme-toggle';
import { AuthPageLayoutToggle } from '../widgets/auth-page-layout-toggle';
import { getAuthPageLayout, setAuthPageLayout } from './preferences';
import './auth-page-layout.css';

interface AuthPageLayoutProps extends PropsWithChildren {
  appName: string;
  logo: string;
  pageDescription: string;
  pageTitle: string;
}

export function AuthPageLayout({ appName, children, logo, pageDescription, pageTitle }: AuthPageLayoutProps) {
  const [layout, setLayout] = useState(getAuthPageLayout);
  const side = layout === 'panel-center' ? 'center' : layout === 'panel-left' ? 'left' : 'right';
  const form = (
    <section aria-label="登录" className="auth-page-layout__form" data-side={side}>
      <div className="auth-page-layout__content" data-side={side}>{children}</div>
      <footer className="auth-page-layout__copyright">Copyright © 2026 React Starter</footer>
    </section>
  );
  const hero = (
    <section aria-labelledby="auth-page-title" className="auth-page-layout__hero" key={layout}>
      <div aria-hidden="true" className="auth-page-layout__hero-background" />
      <div className="auth-page-layout__hero-content" data-side={side}>
        <div className="auth-page-layout__slogan" aria-hidden="true">
          <img alt="" className="auth-page-layout__slogan-image" src="/images/auth-slogan.svg" />
        </div>
        <div className="auth-page-layout__copy">
          <h1 id="auth-page-title">{pageTitle}</h1>
          <span>{pageDescription}</span>
        </div>
      </div>
    </section>
  );

  return (
    <main className="auth-page-layout" data-layout={layout}>
      <a className="auth-page-layout__brand" href="/">
        <img alt={appName} src={logo} />
        <span>{appName}</span>
      </a>
      <div className="auth-page-layout__toolbar">
        <AuthPageLayoutToggle
          layout={layout}
          onLayoutChange={(nextLayout) => {
            setAuthPageLayout(nextLayout);
            setLayout(nextLayout);
          }}
        />
        <ThemeToggle />
      </div>
      {layout === 'panel-center' && <div aria-hidden="true" className="auth-page-layout__center-background" />}
      {layout === 'panel-left' && form}
      {layout !== 'panel-center' && hero}
      {layout === 'panel-right' && form}
      {layout === 'panel-center' && form}
    </main>
  );
}
