export type SupportedLanguagesType = string;

export type ImportLocaleFn = () => Promise<{ default: Record<string, unknown> }>;

export interface LocaleSetupOptions {
  defaultLocale?: SupportedLanguagesType;
  loadMessages?: (locale: SupportedLanguagesType) => Promise<Record<string, unknown>>;
}
