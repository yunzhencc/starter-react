import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSession, login, logout } from './session';

function createStorage() {
  const values = new Map<string, string>();
  return {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    get length() { return values.size; },
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

const localStorage = createStorage();
const sessionStorage = createStorage();

vi.stubGlobal('localStorage', localStorage);
vi.stubGlobal('sessionStorage', sessionStorage);

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('demo authentication', () => {
  it('persists valid remembered credentials in local storage', () => {
    expect(login({ password: '123456', remember: true, username: 'vben' })?.accessToken).toBeTruthy();
    expect(getSession()?.username).toBe('vben');
    expect(sessionStorage.length).toBe(0);
  });

  it('rejects invalid credentials and clears both session locations on logout', () => {
    expect(login({ password: 'wrong', remember: false, username: 'vben' })).toBeUndefined();
    login({ password: '123456', remember: false, username: 'vben' });
    logout();
    expect(getSession()).toBeUndefined();
    expect(localStorage.length + sessionStorage.length).toBe(0);
  });

  it('treats malformed stored data as signed out', () => {
    localStorage.setItem('starter-react:auth', '{bad json');
    expect(getSession()).toBeUndefined();
    sessionStorage.setItem('starter-react:auth', JSON.stringify({ accessToken: 'token', username: 'other' }));
    expect(getSession()).toBeUndefined();
  });
});
