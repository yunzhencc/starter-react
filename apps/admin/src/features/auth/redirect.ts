export function getSafeRedirect(value: string | undefined) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export function getLoginRedirect(pathname: string, search: string) {
  return getSafeRedirect(`${pathname}${search}`);
}
