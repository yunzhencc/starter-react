import type { RouteIconName } from './tab-model';
import { AppstoreOutlined, AreaChartOutlined } from '@ant-design/icons';

export function RouteIcon({ icon }: { icon?: RouteIconName }) {
  if (!icon) {
    return null;
  }

  const Icon = icon === 'analytics' ? AreaChartOutlined : AppstoreOutlined;
  return <Icon data-route-icon={icon} />;
}
