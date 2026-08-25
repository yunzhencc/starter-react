import type { InputRef } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from '@yunzhen/locales';
import { lockScreen, unlockScreen, useAccessStore } from '@yunzhen/stores';
import { Button, Input, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';

interface LockScreenModalProps {
  avatar: string;
  avatarAlt?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  text?: string;
}

export function LockScreenModal({ avatar, avatarAlt = '应用标志', onOpenChange, open, text }: LockScreenModalProps) {
  const { t } = useTranslation();
  const inputRef = useRef<InputRef>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function close() {
    setPassword('');
    setError('');
    onOpenChange(false);
  }

  function submit() {
    if (!password) {
      setError(t('ui.lockScreen.placeholder'));
      return;
    }
    lockScreen(password);
    close();
  }

  return (
    <Modal
      centered
      destroyOnHidden
      footer={null}
      open={open}
      title={t('ui.lockScreen.title')}
      afterOpenChange={(visible) => {
        if (visible) {
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }}
      onCancel={close}
    >
      <div className="lock-screen-modal">
        <img alt={avatarAlt} className="lock-screen-modal__avatar" src={avatar} />
        {text && <div className="lock-screen-modal__text">{text}</div>}
        <Input.Password
          ref={inputRef}
          autoComplete="new-password"
          placeholder={t('ui.lockScreen.placeholder')}
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
          {t('ui.lockScreen.screenButton')}
        </Button>
      </div>
    </Modal>
  );
}

interface LockScreenProps {
  avatar: string;
  avatarAlt?: string;
  onLogout?: () => void;
}

export function LockScreen({ avatar, avatarAlt = '应用标志', onLogout }: LockScreenProps) {
  const { i18n, t } = useTranslation();
  const isLockScreen = useAccessStore(state => state.isLockScreen);
  const lockScreenPassword = useAccessStore(state => state.lockScreenPassword);
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
    if (!isLockScreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLockScreen]);

  useEffect(() => {
    if (showUnlockForm) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [showUnlockForm]);

  if (!isLockScreen) {
    return null;
  }

  function submit() {
    if (value === lockScreenPassword) {
      unlockScreen();
      return;
    }
    setError(t('ui.lockScreen.wrongPassword'));
  }

  const locale = i18n.resolvedLanguage ?? i18n.language;
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const meridiem = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true })
    .formatToParts(now)
    .find(part => part.type === 'dayPeriod')
    ?.value;
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now)}`;

  return (
    <div aria-label={t('ui.lockScreen.title')} aria-modal="true" className="lock-screen" role="dialog">
      {!showUnlockForm && (
        <button className="lock-screen__unlock-prompt" type="button" onClick={() => setShowUnlockForm(true)}>
          <LockOutlined aria-hidden />
          <span>{t('ui.lockScreen.unlock')}</span>
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
              <img alt={avatarAlt} className="lock-screen__avatar" src={avatar} />
              <Input.Password
                ref={inputRef}
                autoComplete="current-password"
                placeholder={t('ui.lockScreen.placeholder')}
                status={error ? 'error' : undefined}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError('');
                }}
                onPressEnter={submit}
              />
              {error && <div className="lock-screen__error">{error}</div>}
              <Button block htmlType="submit" type="primary">{t('ui.lockScreen.entry')}</Button>
              {onLogout && <Button block type="text" onClick={onLogout}>{t('ui.lockScreen.backToLogin')}</Button>}
              <Button block type="text" onClick={() => setShowUnlockForm(false)}>{t('ui.back')}</Button>
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
