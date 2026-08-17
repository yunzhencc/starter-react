import type { MenuProps } from 'antd';
import type { AuthPageLayoutType } from '../authentication/preferences';
import { Button, Dropdown } from 'antd';

interface AuthPageLayoutToggleProps {
  layout: AuthPageLayoutType;
  onLayoutChange: (layout: AuthPageLayoutType) => void;
}

const layoutOptions: { label: string; value: AuthPageLayoutType }[] = [
  { label: '表单居左', value: 'panel-left' },
  { label: '表单居中', value: 'panel-center' },
  { label: '表单居右', value: 'panel-right' },
];

function LayoutPanelIcon({ layout }: { layout: AuthPageLayoutType }) {
  const dividerX = layout === 'panel-left' ? 9 : layout === 'panel-right' ? 15 : 12;

  return (
    <svg aria-hidden="true" data-layout-icon={layout} fill="none" viewBox="0 0 24 24">
      <rect height="18" rx="2" width="18" x="3" y="3" />
      <path d={`M${dividerX} 3v18`} />
    </svg>
  );
}

export function AuthPageLayoutToggle({ layout, onLayoutChange }: AuthPageLayoutToggleProps) {
  const menu: MenuProps = {
    items: layoutOptions.map(({ label, value }) => ({ icon: <LayoutPanelIcon layout={value} />, key: value, label })),
    onClick: ({ key }) => onLayoutChange(key as AuthPageLayoutType),
    selectable: true,
    selectedKeys: [layout],
  };

  return (
    <Dropdown classNames={{ root: 'auth-page-layout-toggle__dropdown' }} menu={menu} placement="bottomLeft" trigger={['click']}>
      <Button aria-label="登录页布局" className="auth-page-layout__toolbar-button" data-layout={layout} icon={<LayoutPanelIcon layout={layout} />} type="text" />
    </Dropdown>
  );
}
