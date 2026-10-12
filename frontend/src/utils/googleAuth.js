let googleScriptPromise = null;
let googleInitialized = false;
let googleInitializedClientId = null;
let googleResponseHandler = null;
let googleErrorHandler = null;

export const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google auth is unavailable in this environment.'));
      return;
    }

    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Could not load Google SDK.')), { once: true });
      return;
    }

    if (googleScriptPromise) {
      googleScriptPromise.then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    googleScriptPromise = new Promise((scriptResolve, scriptReject) => {
      script.onload = () => scriptResolve(window.google);
      script.onerror = () => scriptReject(new Error('Could not load Google SDK.'));
      document.head.appendChild(script);
    });

    googleScriptPromise.then(resolve).catch(reject);
  });
};

const hasValidGoogleClientId = (clientId) => typeof clientId === 'string' && clientId.trim().length > 0 && clientId.includes('.apps.googleusercontent.com');

const logGoogleAuthDebug = (clientId) => {
  if (typeof window !== 'undefined') {
    console.info('[GoogleAuth] origin:', window.location.origin, 'clientId:', clientId);
  }
};

const handleGoogleCredentialResponse = (response) => {
  if (!response?.credential) {
    googleErrorHandler?.('Google login failed. Please try again.');
    return;
  }

  googleResponseHandler?.(response.credential);
};

const initializeGoogle = ({ clientId, onSuccess, onError, autoSelect = false }) => {
  if (!window.google?.accounts?.id) {
    throw new Error('Google auth SDK is not available right now.');
  }

  googleResponseHandler = onSuccess;
  googleErrorHandler = onError;

  if (googleInitialized && googleInitializedClientId === clientId) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleCredentialResponse,
    auto_select: autoSelect,
    cancel_on_tap_outside: true,
  });

  googleInitialized = true;
  googleInitializedClientId = clientId;
};

export const triggerGoogleLogin = async ({ clientId, onSuccess, onError }) => {
  if (!hasValidGoogleClientId(clientId)) {
    onError?.('Google sign-in is not configured. Add a valid VITE_GOOGLE_CLIENT_ID from Google Cloud Console and allow this origin in the OAuth client settings.');
    return;
  }

  try {
    await loadGoogleScript();

    if (!window.google?.accounts?.id) {
      onError?.('Google auth SDK is not available right now.');
      return;
    }

    initializeGoogle({ clientId, onSuccess, onError, autoSelect: false });

    const renderedButton = document.createElement('div');
    renderedButton.style.width = '100%';
    renderedButton.style.display = 'flex';
    renderedButton.style.justifyContent = 'center';
    document.body.appendChild(renderedButton);

    try {
      window.google.accounts.id.renderButton(renderedButton, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 280,
        text: 'continue_with',
      });

      const firstButton = renderedButton.querySelector('div[role="button"]');
      if (firstButton) {
        firstButton.click();
      }
    } catch (renderError) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          onError?.('Google sign-in is blocked in this browser. Please use email sign-up or add the correct Google origin in Cloud Console.');
        }
      });
    } finally {
      setTimeout(() => renderedButton.remove(), 2000);
    }
  } catch (error) {
    onError?.(error?.message || 'Google sign-in failed.');
  }
};

export const renderGoogleButton = ({ clientId, container, onSuccess, onError }) => {
  if (!container) return;

  if (!hasValidGoogleClientId(clientId)) {
    container.innerHTML = '';
    onError?.('Google sign-in is not configured. Add a valid VITE_GOOGLE_CLIENT_ID from Google Cloud Console and allow this origin in the OAuth client settings.');
    return;
  }

  const render = async () => {
    try {
      await loadGoogleScript();
      if (!window.google?.accounts?.id) {
        onError?.('Google auth SDK is not available right now.');
        return;
      }

      logGoogleAuthDebug(clientId);
      container.innerHTML = '';

      initializeGoogle({ clientId, onSuccess, onError, autoSelect: false });

      const width = Math.max(container.clientWidth || 280, 280);

      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width,
        text: 'continue_with',
        logo_alignment: 'center',
      });
    } catch (error) {
      onError?.(error?.message || 'Google sign-in failed.');
    }
  };

  render();
};
