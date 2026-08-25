import type { ResourceLanguage } from 'i18next';
import type { ImportLocaleFn, LocaleSetupOptions, SupportedLanguagesType } from './typing';
import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const i18n = createInstance();
const modules = import.meta.glob('./langs/**/*.json');
const localesMap = loadLocalesMapFromDir(
  /\.\/langs\/([^/]+)\/(.*)\.json$/,
  modules,
);

let loadMessages: LocaleSetupOptions['loadMessages'];

function loadLocalesMapFromDir(
  regexp: RegExp,
  modules: Record<string, () => Promise<unknown>>,
): Record<string, ImportLocaleFn> {
  const locales: Record<string, Record<string, () => Promise<unknown>>> = {};

  for (const [path, load] of Object.entries(modules)) {
    const match = path.match(regexp);
    if (!match?.[1] || !match[2]) {
      continue;
    }
    (locales[match[1]] ??= {})[match[2]] = load;
  }

  return Object.fromEntries(Object.entries(locales).map(([locale, files]) => [
    locale,
    async () => ({
      default: Object.fromEntries(await Promise.all(
        Object.entries(files).map(async ([name, load]) => [name, (await load() as { default: ResourceLanguage }).default]),
      )),
    }),
  ]));
}

function setDocumentLanguage(locale: string) {
  document.documentElement.lang = locale;
}

async function setupI18n(options: LocaleSetupOptions = {}) {
  const { defaultLocale = 'zh-CN', loadMessages: loadApplicationMessages } = options;
  loadMessages = loadApplicationMessages;
  let locale = defaultLocale;

  if (!i18n.isInitialized) {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: defaultLocale,
        supportedLngs: Object.keys(localesMap),
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage'],
          lookupLocalStorage: 'starter-react:locale',
        },
      });

    locale = i18n.resolvedLanguage ?? i18n.language ?? defaultLocale;
  }

  await loadLocaleMessages(locale);
}

async function loadLocaleMessages(locale: SupportedLanguagesType) {
  const [commonMessages, applicationMessages] = await Promise.all([
    localesMap[locale]?.(),
    loadMessages?.(locale),
  ]);

  if (commonMessages?.default) {
    i18n.addResourceBundle(locale, 'translation', commonMessages.default, true, true);
  }
  if (applicationMessages) {
    i18n.addResourceBundle(locale, 'translation', applicationMessages, true, true);
  }

  await i18n.changeLanguage(locale);
  setDocumentLanguage(locale);
}

export { i18n, loadLocaleMessages, loadLocalesMapFromDir, setupI18n };
