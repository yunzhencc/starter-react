const storageKey = 'starter-react:auth';
export const demoUsernames = ['vben', 'admin', 'jack', 'yunzhen'] as const;
type DemoUsername = typeof demoUsernames[number];

export interface LoginCredentials {
  password: string;
  remember: boolean;
  username: string;
}

export interface DemoSession {
  accessToken: string;
  username: DemoUsername;
}

function parseSession(value: string | null): DemoSession | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const session = JSON.parse(value) as Partial<DemoSession>;
    return typeof session.accessToken === 'string' && session.accessToken && typeof session.username === 'string' && demoUsernames.includes(session.username as DemoUsername)
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
  if (!demoUsernames.includes(username as DemoUsername) || password !== '123456') {
    return undefined;
  }

  const session: DemoSession = { accessToken: 'demo-yunzhen-access-token', username: username as DemoUsername };
  logout();
  (remember ? localStorage : sessionStorage).setItem(storageKey, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(storageKey);
  sessionStorage.removeItem(storageKey);
}
