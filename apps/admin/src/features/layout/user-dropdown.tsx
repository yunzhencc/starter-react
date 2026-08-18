import { GithubOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';

const githubUrl = 'https://github.com/yunzhencc/starter-react';

interface UserDropdownProps {
  onLogout: () => void;
}

export function UserDropdown({ onLogout }: UserDropdownProps) {
  return (
    <Dropdown
      classNames={{ root: 'user-dropdown' }}
      placement="bottomRight"
      popupRender={() => (
        <div className="user-dropdown__content">
          <div className="user-dropdown__profile">
            <div className="user-dropdown__avatar">
              <img alt="Vben" src="/images/avatar-v1.webp" />
              <span aria-label="在线" className="user-dropdown__status" />
            </div>
            <div>
              <div className="user-dropdown__name">
                Vben
                <span>Pro</span>
              </div>
              <div className="user-dropdown__email">ann.vben@gmail.com</div>
            </div>
          </div>
          <div className="user-dropdown__divider" />
          <button className="user-dropdown__item" type="button">
            <span className="user-dropdown__item-icon">
              <UserOutlined aria-hidden />
            </span>
            个人中心
          </button>
          <a className="user-dropdown__item" href={githubUrl} rel="noreferrer" target="_blank">
            <span className="user-dropdown__item-icon">
              <GithubOutlined aria-hidden />
            </span>
            GitHub
          </a>
          <div className="user-dropdown__divider" />
          <button className="user-dropdown__item" type="button" onClick={onLogout}>
            <span className="user-dropdown__item-icon">
              <LogoutOutlined aria-hidden />
            </span>
            退出登录
          </button>
        </div>
      )}
      trigger={['click']}
    >
      <button aria-label="用户菜单" className="user-dropdown__trigger" type="button">
        <span className="user-dropdown__avatar">
          <img alt="Vben" src="/images/avatar-v1.webp" />
          <span aria-label="在线" className="user-dropdown__status" />
        </span>
      </button>
    </Dropdown>
  );
}
