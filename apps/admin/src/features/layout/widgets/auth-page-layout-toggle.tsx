import type { MenuProps } from 'antd';
import type { AuthPageLayoutType } from '../authentication/preferences';
import { AppstoreOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';

interface AuthPageLayoutToggleProps {
  layout: AuthPageLayoutType;
  onLayoutChange: (layout: AuthPageLayoutType) => void;
}

const layoutLabels: Record<AuthPageLayoutType, string> = {
  'panel-center': '表单居中',
  'panel-left': '表单居左',
  'panel-right': '表单居右',
};

export function AuthPageLayoutToggle({ layout, onLayoutChange }: AuthPageLayoutToggleProps) {
  const menu: MenuProps = {
    items: (Object.entries(layoutLabels) as [AuthPageLayoutType, string][]).map(([key, label]) => ({ key, label })),
    onClick: ({ key }) => onLayoutChange(key as AuthPageLayoutType),
    selectable: true,
    selectedKeys: [layout],
  };

  return (
    <Dropdown menu={menu} placement="bottomRight" trigger={['click']}>
      <Button aria-label="登录页布局" className="auth-page-layout__toolbar-button" icon={<AppstoreOutlined />} type="text" />
    </Dropdown>
  );
}
