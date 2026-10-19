import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const missingClientId = !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_OAUTH');

export default function GoogleAuthButton({ onCredential, disabled = false }) {
  const buttonRef = useRef(null);
  const credentialHandlerRef = useRef(onCredential);
  const [loadError, setLoadError] = useState('');

  useEffect(() => { credentialHandlerRef.current = onCredential; }, [onCredential]);

  useEffect(() => {
    if (missingClientId) return undefined;

    let cancelled = false;
    let script = null;
    let onScriptError = null;
    const renderGoogleButton = () => {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => credential && credentialHandlerRef.current(credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(buttonRef.current.parentElement?.clientWidth || 360, 360),
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      script = document.querySelector(`script[src="${GOOGLE_SCRIPT}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = GOOGLE_SCRIPT;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderGoogleButton);
      onScriptError = () => setLoadError('Google sign-in could not load. Check your connection.');
      script.addEventListener('error', onScriptError);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener('load', renderGoogleButton);
      if (onScriptError) script?.removeEventListener('error', onScriptError);
    };
  }, []);

  return (
    <div>
      <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center', opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }} />
      {(loadError || (missingClientId ? 'Google sign-in needs a Google OAuth Client ID.' : '')) && (
        <p role="status" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          {loadError || 'Google sign-in needs a Google OAuth Client ID.'}
        </p>
      )}
    </div>
  );
}
