export const LEGACY_PERSISTED_USER_KEY = "reduxPersist:user";
export const persistenceConfig = {
  whitelist: ["app"]
};

export function clearLegacyPersistedUserState(storage?: Pick<Storage, "removeItem">): void {
  try {
    const targetStorage = storage || window.localStorage;
    targetStorage.removeItem(LEGACY_PERSISTED_USER_KEY);
  } catch {
    // Storage may be disabled by the browser. Authentication startup must
    // continue because bearer tokens are no longer restored from storage.
  }
}
