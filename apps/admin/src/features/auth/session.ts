const storageKey = 'starter-react:auth';

export interface LoginCredentials {
  password: string;
  remember: boolean;
  username: string;
}

export interface DemoSession {
  accessToken: string;
  username: 'vben';
}

function parseSession(value: string | null): DemoSession | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const session = JSON.parse(value) as Partial<DemoSession>;
    return typeof session.accessToken === 'string' && session.accessToken && session.username === 'vben'
      ? session as DemoSession
      : undefined;
  }
  catch {
    return undefined;
  }
}

export function getSession(): DemoSession | undefined {
  const rememberedSession = localStorage.getItem(storageKey);
  return rememberedSession === null
    ? parseSession(sessionStorage.getItem(storageKey))
    : parseSession(rememberedSession);
}

export function login({ password, remember, username }: LoginCredentials): DemoSession | undefined {
  if (username !== 'vben' || password !== '123456') {
    return undefined;
  }

  const session = { accessToken: 'demo-vben-access-token', username: 'vben' } as const;
  logout();
  (remember ? localStorage : sessionStorage).setItem(storageKey, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(storageKey);
  sessionStorage.removeItem(storageKey);
}
