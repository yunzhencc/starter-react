import { AdminLayout } from '@yunzhen/layouts';
import { loadLocaleMessages, useTranslation } from '@yunzhen/locales';
import { useState } from 'react';

const menuItems = [
  { affix: true, path: '/locales', title: '国际化' },
];

function LocalesExample() {
  const { t } = useTranslation();

  return (
    <main>
      <h1>{t('ui.back')}</h1>
      <button type="button" onClick={() => void loadLocaleMessages('zh-CN')}>简体中文</button>
      <button type="button" onClick={() => void loadLocaleMessages('en-US')}>English</button>
    </main>
  );
}

function App() {
  const [activePath, setActivePath] = useState('/locales');

  return (
    <AdminLayout
      activePath={activePath}
      brand={<button className="brand" type="button" onClick={() => setActivePath('/locales')}>Playground</button>}
      menuItems={menuItems}
      renderPage={(_route, refreshVersion) => <LocalesExample key={refreshVersion} />}
      storageKeyPrefix="starter-react:playground"
      onNavigate={setActivePath}
    />
  );
}

export default App;
