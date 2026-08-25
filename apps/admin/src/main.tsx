import { setupI18n } from '@yunzhen/locales';
import { ClickScrollPlugin, OverlayScrollbars } from 'overlayscrollbars';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import 'overlayscrollbars/overlayscrollbars.css';
import './global.css';

OverlayScrollbars.plugin(ClickScrollPlugin);

async function bootstrap() {
  await setupI18n();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
