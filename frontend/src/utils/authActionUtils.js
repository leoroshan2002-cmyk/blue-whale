export const AUTH_PENDING_ACTION_STORAGE = "haierah_pending_auth_action";

export const savePendingAuthAction = (action) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_PENDING_ACTION_STORAGE, JSON.stringify(action));
  } catch (error) {
    console.warn("Unable to save pending auth action", error);
  }
};

export const consumePendingAuthAction = () => {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(AUTH_PENDING_ACTION_STORAGE);
  if (!raw) return null;

  sessionStorage.removeItem(AUTH_PENDING_ACTION_STORAGE);

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Unable to parse pending auth action", error);
    return null;
  }
};
