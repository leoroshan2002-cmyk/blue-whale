export const CATALOG_UPDATE_EVENT = 'haierah-catalog-updated';

export const notifyCatalogChanged = (reason = 'catalog-updated') => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('haierah-catalog-version', `${Date.now()}:${reason}`);
  } catch {
    // Ignore storage errors and continue with the in-tab event.
  }

  window.dispatchEvent(new CustomEvent(CATALOG_UPDATE_EVENT, { detail: { reason } }));
};

export const subscribeToCatalogChanges = (callback) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const handleCatalogEvent = (event) => {
    callback(event?.detail?.reason || 'catalog-updated');
  };

  const handleStorageEvent = (event) => {
    if (event.key === 'haierah-catalog-version') {
      callback(event.newValue || 'catalog-updated');
    }
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      callback('visibility-change');
    }
  };

  window.addEventListener(CATALOG_UPDATE_EVENT, handleCatalogEvent);
  window.addEventListener('storage', handleStorageEvent);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleVisibilityChange);

  return () => {
    window.removeEventListener(CATALOG_UPDATE_EVENT, handleCatalogEvent);
    window.removeEventListener('storage', handleStorageEvent);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleVisibilityChange);
  };
};
