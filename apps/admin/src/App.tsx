import { StyleProvider } from '@ant-design/cssinjs';
import { RouterProvider } from '@tanstack/react-router';
import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import * as React from 'react';
import { AppThemeProvider } from '@/features/theme/theme-provider';
import { router } from '@/lib/router';
import { Providers } from '@/providers';
import { unmountAppLoading } from './app-loading';
import './global.css';

export function App() {
  React.useEffect(unmountAppLoading, []);

  React.useEffect(
    () => {
      if (import.meta.env.DEV && import.meta.env.VITE_DEV_REACT_GRAB === 'true') {
        void import('react-grab');
      }
    },
    [],
  );

  React.useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEV_REACT_SCAN === 'true') {
      void import('react-scan').then(({ scan }) => {
        scan({ enabled: true });
      });
    }
  }, []);

  return (
    <AppThemeProvider>
      <StyleProvider layer>
        <ConfigProvider locale={zhCN}>
          <AntApp className="admin-app">
            <Providers>
              <RouterProvider router={router} />
            </Providers>
          </AntApp>
        </ConfigProvider>
      </StyleProvider>
    </AppThemeProvider>
  );
}
