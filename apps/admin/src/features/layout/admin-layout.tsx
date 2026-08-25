import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { BasicLayout } from '@yunzhen/layouts';
import { setAccessMenus } from '@yunzhen/stores';
import { App as AntApp } from 'antd';
import { useEffect, useState } from 'react';
import logo from '@/assets/logo.svg';
import { logout as clearSession } from '@/features/auth/session';
import { ThemeToggle } from '@/features/theme/theme-toggle';
import { getStoredLockScreen, LockScreen, persistLockScreen, SetLockScreenModal } from './lock-screen';
import { appMenuItems } from './route-definitions';
import { RouteIcon } from './route-icon';
import { UserDropdown } from './user-dropdown';

const menuItems = appMenuItems.map(item => 'children' in item
  ? {
      children: item.children.map(child => ({ ...child, icon: child.icon ? <RouteIcon icon={child.icon} /> : undefined })),
      icon: <RouteIcon icon={item.icon} />,
      key: item.key,
      title: item.title,
    }
  : { ...item, icon: <RouteIcon icon={item.icon} /> });

setAccessMenus(menuItems);

export function AdminLayout() {
  const { modal } = AntApp.useApp();
  const navigate = useNavigate();
  const [lockScreen, setLockScreen] = useState(getStoredLockScreen);
  const [lockScreenModalOpen, setLockScreenModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!lockScreen.isLocked && event.altKey && event.code === 'KeyL' && !event.repeat) {
        event.preventDefault();
        setLockScreenModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lockScreen.isLocked]);

  function lock(password: string) {
    const next = { isLocked: true, password };
    setLockScreen(next);
    persistLockScreen(next);
    setLockScreenModalOpen(false);
  }

  function unlock() {
    setLockScreen({ isLocked: false });
    persistLockScreen({ isLocked: false });
  }

  function logout() {
    clearSession();
    unlock();
    void navigate({ replace: true, to: '/login' });
  }

  function confirmLogout() {
    modal.confirm({
      cancelText: '取消',
      centered: true,
      content: '您确定要退出登录吗？',
      okText: '确认',
      onOk: logout,
      title: '提示',
    });
  }

  return (
    <>
      <BasicLayout
        brand={(
          <button className="brand" type="button" onClick={() => void navigate({ to: '/dashboard' })}>
            <span className="brand-mark"><img alt="" src={logo} /></span>
            <span className="brand-name">React Starter</span>
          </button>
        )}
        headerActions={(
          <>
            <ThemeToggle />
            <button aria-label="锁定屏幕" className="header-icon-button" title="锁定屏幕" type="button" onClick={() => setLockScreenModalOpen(true)}>
              <LockOutlined />
            </button>
            <UserDropdown onLogout={confirmLogout} />
          </>
        )}
      />
      <SetLockScreenModal open={lockScreenModalOpen} onCancel={() => setLockScreenModalOpen(false)} onConfirm={lock} />
      {lockScreen.isLocked && <LockScreen password={lockScreen.password ?? ''} onLogout={logout} onUnlock={unlock} />}
    </>
  );
}
