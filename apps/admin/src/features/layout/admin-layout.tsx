import { FullscreenExitOutlined, FullscreenOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { BasicLayout } from '@yunzhen/layouts';
import { LockScreen, LockScreenModal, ThemeToggle } from '@yunzhen/layouts/widgets';
import { useTranslation } from '@yunzhen/locales';
import { usePreferences } from '@yunzhen/preferences';
import { setAccessMenus, unlockScreen, useAccessStore } from '@yunzhen/stores';
import { App as AntApp } from 'antd';
import { useEffect, useState } from 'react';
import logo from '@/assets/logo.svg';
import { logout as clearSession } from '@/features/auth/session';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isLockScreen = useAccessStore(state => state.isLockScreen);
  const { shortcutKeys, widget } = usePreferences();
  const [lockScreenModalOpen, setLockScreenModalOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement);
  const showLockInHeader = widget.lockScreen && widget.lockScreenButtonPosition === 'header';
  const showLockInDropdown = widget.lockScreen && widget.lockScreenButtonPosition === 'user-dropdown';
  const enableLockScreenShortcut = widget.lockScreen
    && widget.lockScreenButtonPosition !== 'none'
    && shortcutKeys.enable
    && shortcutKeys.globalLockScreen;

  useEffect(() => {
    if (!enableLockScreenShortcut) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLockScreen && event.altKey && event.code === 'KeyL' && !event.repeat) {
        event.preventDefault();
        setLockScreenModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableLockScreenShortcut, isLockScreen]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement)
        await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    }
    catch {
      // The browser may deny fullscreen when it is unavailable.
    }
  }

  function logout() {
    clearSession();
    unlockScreen();
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
        lockScreen={<LockScreen avatar={logo} avatarAlt="React Starter" onLogout={logout} />}
        headerActions={(
          <>
            <ThemeToggle />
            <button aria-label={fullscreen ? '退出全屏' : '全屏'} className="header-icon-button" title={fullscreen ? '退出全屏' : '全屏'} type="button" onClick={() => void toggleFullscreen()}>{fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}</button>
            {showLockInHeader && (
              <button aria-label={t('ui.lockScreen.title')} className="header-icon-button" title={t('ui.lockScreen.title')} type="button" onClick={() => setLockScreenModalOpen(true)}>
                <LockOutlined />
              </button>
            )}
            <UserDropdown onLockScreen={() => setLockScreenModalOpen(true)} onLogout={confirmLogout} showLockScreen={showLockInDropdown} />
          </>
        )}
      />
      {widget.lockScreen && <LockScreenModal avatar={logo} avatarAlt="React Starter" open={lockScreenModalOpen} text="Vben" onOpenChange={setLockScreenModalOpen} />}
    </>
  );
}
