export const authPageLayouts = ['panel-left', 'panel-center', 'panel-right'] as const;

export type AuthPageLayoutType = (typeof authPageLayouts)[number];

const defaultLayout: AuthPageLayoutType = 'panel-right';
const storageKey = 'starter-react:auth-page-layout';

export function getAuthPageLayout(): AuthPageLayoutType {
  if (typeof window === 'undefined') {
    return defaultLayout;
  }

  const layout = window.localStorage.getItem(storageKey);
  return authPageLayouts.includes(layout as AuthPageLayoutType)
    ? layout as AuthPageLayoutType
    : defaultLayout;
}

export function setAuthPageLayout(layout: AuthPageLayoutType) {
  window.localStorage.setItem(storageKey, layout);
}
