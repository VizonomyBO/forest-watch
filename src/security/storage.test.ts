import { clearLegacyPersistedUserState, LEGACY_PERSISTED_USER_KEY, persistenceConfig } from "./storage";

describe("authentication persistence", () => {
  it("never persists the user reducer that contains the bearer token", () => {
    expect(persistenceConfig.whitelist).toEqual(["app"]);
    expect(persistenceConfig.whitelist).not.toContain("user");
  });

  it("removes the previously persisted user reducer", () => {
    const removeItem = jest.fn();

    clearLegacyPersistedUserState({ removeItem });

    expect(removeItem).toHaveBeenCalledWith(LEGACY_PERSISTED_USER_KEY);
  });

  it("does not prevent startup when browser storage is unavailable", () => {
    expect(() =>
      clearLegacyPersistedUserState({
        removeItem: () => {
          throw new Error("storage disabled");
        }
      })
    ).not.toThrow();
  });
});
