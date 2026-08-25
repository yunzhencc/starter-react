import { loadLocaleMessages, useTranslation } from '@yunzhen/locales';

function App() {
  const { t } = useTranslation();

  return (
    <main>
      <h1>{t('ui.back')}</h1>
      <button type="button" onClick={() => void loadLocaleMessages('zh-CN')}>简体中文</button>
      <button type="button" onClick={() => void loadLocaleMessages('en-US')}>English</button>
    </main>
  );
}

export default App;
