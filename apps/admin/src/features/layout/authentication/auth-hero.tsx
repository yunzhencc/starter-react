import { AnimatedCharacters } from '@yunzhen/shadcn-ui/components/animated-characters';
import { useEffect, useState } from 'react';
import authSlogan from '@/assets/images/auth-slogan.svg';

type AuthHeroEffect = 'careercompass' | 'slogan';

const authHeroEffect: AuthHeroEffect = 'careercompass';

interface LoginState {
  isTyping: boolean;
  passwordLength: number;
  showPassword: boolean;
}

export function AuthHero() {
  const [loginState, setLoginState] = useState<LoginState>({ isTyping: false, passwordLength: 0, showPassword: false });

  useEffect(() => {
    const syncLoginState = () => {
      const password = document.querySelector<HTMLInputElement>('input[autocomplete="current-password"]');
      const activeElement = document.activeElement;
      setLoginState({
        isTyping: activeElement instanceof HTMLInputElement && (activeElement.autocomplete === 'username' || activeElement.autocomplete === 'current-password'),
        passwordLength: password?.value.length ?? 0,
        showPassword: password?.type === 'text',
      });
    };
    const syncAfterEvent = () => window.requestAnimationFrame(syncLoginState);
    const observer = new MutationObserver(syncLoginState);

    observer.observe(document.body, { attributeFilter: ['type'], attributes: true, subtree: true });
    document.addEventListener('click', syncAfterEvent);
    document.addEventListener('focusin', syncLoginState);
    document.addEventListener('focusout', syncAfterEvent);
    document.addEventListener('input', syncLoginState);
    const frame = window.requestAnimationFrame(syncLoginState);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('click', syncAfterEvent);
      document.removeEventListener('focusin', syncLoginState);
      document.removeEventListener('focusout', syncAfterEvent);
      document.removeEventListener('input', syncLoginState);
    };
  }, []);

  if (authHeroEffect === 'slogan') {
    return (
      <div aria-hidden="true" className="auth-page-layout__slogan">
        <img alt="" className="auth-page-layout__slogan-image" src={authSlogan} />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="auth-page-layout__careercompass-characters">
      <AnimatedCharacters {...loginState} />
    </div>
  );
}
