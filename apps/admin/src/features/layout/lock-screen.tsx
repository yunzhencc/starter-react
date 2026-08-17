import type { InputRef } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Button, Input, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';

const storageKey = 'starter-react:lock-screen';

export interface LockScreenState {
  isLocked: boolean;
  password?: string;
}

export function getStoredLockScreen(): LockScreenState {
  if (typeof window === 'undefined') {
    return { isLocked: false };
  }

  try {
    const state = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null') as LockScreenState | null;
    return state?.isLocked && state.password ? state : { isLocked: false };
  }
  catch {
    return { isLocked: false };
  }
}

export function persistLockScreen(state: LockScreenState) {
  if (typeof window === 'undefined') {
    return;
  }
  if (state.isLocked && state.password) {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }
  else {
    window.localStorage.removeItem(storageKey);
  }
}

interface SetLockScreenModalProps {
  onCancel: () => void;
  onConfirm: (password: string) => void;
  open: boolean;
}

export function SetLockScreenModal({ onCancel, onConfirm, open }: SetLockScreenModalProps) {
  const inputRef = useRef<InputRef>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function close() {
    setPassword('');
    setError('');
    onCancel();
  }

  function submit() {
    if (!password) {
      setError('请输入锁屏密码');
      return;
    }
    onConfirm(password);
    setPassword('');
    setError('');
  }

  return (
    <Modal
      centered
      destroyOnHidden
      footer={null}
      open={open}
      title="锁定屏幕"
      onCancel={close}
      afterOpenChange={(visible) => {
        if (visible) {
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }}
    >
      <div className="lock-screen-modal">
        <img alt="React Starter" className="lock-screen-modal__avatar" src="/logo.svg" />
        <Input.Password
          ref={inputRef}
          autoComplete="new-password"
          placeholder="请输入锁屏密码"
          status={error ? 'error' : undefined}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
          onPressEnter={submit}
        />
        {error && <div className="lock-screen-modal__error">{error}</div>}
        <Button block className="lock-screen-modal__submit" type="primary" onClick={submit}>
          锁定
        </Button>
      </div>
    </Modal>
  );
}

interface LockScreenProps {
  onLogout: () => void;
  onUnlock: () => void;
  password: string;
}

export function LockScreen({ onLogout, onUnlock, password }: LockScreenProps) {
  const inputRef = useRef<InputRef>(null);
  const [now, setNow] = useState(() => new Date());
  const [showUnlockForm, setShowUnlockForm] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showUnlockForm) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [showUnlockForm]);

  function showForm() {
    setShowUnlockForm(true);
  }

  function submit() {
    if (value === password) {
      onUnlock();
      return;
    }
    setError('密码错误，请重新输入');
  }

  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const meridiem = now.getHours() < 12 ? '上午' : '下午';
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(now)}`;

  return (
    <div aria-label="锁定屏幕" aria-modal="true" className="lock-screen" role="dialog">
      {!showUnlockForm && (
        <button className="lock-screen__unlock-prompt" type="button" onClick={showForm}>
          <LockOutlined />
          <span>点击解锁</span>
        </button>
      )}

      {showUnlockForm
        ? (
            <form
              className="lock-screen__form"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <img alt="React Starter" className="lock-screen__avatar" src="/logo.svg" />
              <Input.Password
                ref={inputRef}
                autoComplete="current-password"
                placeholder="请输入锁屏密码"
                status={error ? 'error' : undefined}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError('');
                }}
                onPressEnter={submit}
              />
              {error && <div className="lock-screen__error">{error}</div>}
              <Button block htmlType="submit" type="primary">进入系统</Button>
              <Button block type="text" onClick={onLogout}>返回登录</Button>
              <Button block type="text" onClick={() => setShowUnlockForm(false)}>返回</Button>
            </form>
          )
        : (
            <div className="lock-screen__clock" aria-hidden="true">
              <div className="lock-screen__time-card">
                <span>{meridiem}</span>
                {hour}
              </div>
              <div className="lock-screen__time-card">{minute}</div>
            </div>
          )}

      <div className="lock-screen__date">
        {showUnlockForm && (
          <div>
            {hour}
            :
            {minute}
            {' '}
            <span>{meridiem}</span>
          </div>
        )}
        <div>{date}</div>
      </div>
    </div>
  );
}
