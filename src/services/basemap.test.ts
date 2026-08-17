import { BasemapService, getPlanetTileUrl, normalizeIntegrationsApiPath } from "./basemap";

describe("Planet integrations boundary", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("accepts only same-origin API paths", () => {
    expect(normalizeIntegrationsApiPath("/api/integrations/")).toBe("/api/integrations");
    expect(normalizeIntegrationsApiPath("https://api.example.com/integrations")).toBe("");
    expect(normalizeIntegrationsApiPath("//api.example.com/integrations")).toBe("");
  });

  it("does not contact Planet or another provider when the proxy is not configured", async () => {
    global.fetch = jest.fn();
    const service = new BasemapService("");

    await expect(service.getPlanetBasemaps()).resolves.toEqual({ mosaics: [] });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("loads mosaics through the same-origin proxy without a provider credential", async () => {
    const response = { mosaics: [] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => response
    });
    const service = new BasemapService("/api/integrations/");

    await expect(service.getPlanetBasemaps()).resolves.toEqual(response);
    expect(global.fetch).toHaveBeenCalledWith("/api/integrations/planet/mosaics?pageSize=1000", {
      credentials: "same-origin",
      headers: { Accept: "application/json" }
    });
    expect(JSON.stringify((global.fetch as jest.Mock).mock.calls)).not.toContain("api_key");
  });

  it("builds a credential-free, encoded tile proxy URL", () => {
    expect(getPlanetTileUrl("monthly mosaic", "cir", "/api/integrations")).toBe(
      "/api/integrations/planet/tiles/monthly%20mosaic/gmap/{z}/{x}/{y}.png?proc=cir"
    );
    expect(getPlanetTileUrl("monthly mosaic", "", "")).toBeNull();
  });
});
