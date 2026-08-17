import fs from "fs";
import path from "path";

describe("authentication callback bootstrap", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    delete window.__FW_SENSITIVE_AUTH_CALLBACK__;
    jest.resetModules();
  });

  it("removes credentials from the visible URL before the GTM loader", () => {
    const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
    const bootstrap = html.match(
      /<!--\s*This must remain the first executable script[\s\S]*?-->\s*<script>([\s\S]*?)<\/script>/
    );

    expect(bootstrap).not.toBeNull();
    expect(html.indexOf("This must remain the first executable script")).toBeLessThan(
      html.indexOf("googletagmanager.com/gtm.js")
    );

    window.history.replaceState(
      null,
      "",
      "/areas?token=jwt-secret&confirmToken=invite-secret&safe=value#access_token=fragment-secret&map"
    );
    window.eval(bootstrap![1]);

    expect(window.location.pathname + window.location.search + window.location.hash).toBe("/areas?safe=value#map");
    expect(window.location.href).not.toContain("fragment-secret");
    expect(window.__FW_SENSITIVE_AUTH_CALLBACK__).toEqual({
      token: "jwt-secret",
      confirmToken: "invite-secret",
      hadSensitiveParameters: true
    });
  });

  it("consumes callback credentials once and removes the temporary global", () => {
    window.__FW_SENSITIVE_AUTH_CALLBACK__ = {
      token: "jwt-secret",
      confirmToken: "invite-secret",
      hadSensitiveParameters: true
    };

    jest.isolateModules(() => {
      const callback = require("./authCallback") as typeof import("./authCallback");

      expect(window.__FW_SENSITIVE_AUTH_CALLBACK__).toBeUndefined();
      expect(callback.wasSensitiveAuthCallback).toBe(true);
      expect(callback.consumeSensitiveAuthCallback()).toEqual({
        token: "jwt-secret",
        confirmToken: "invite-secret"
      });
      expect(callback.consumeSensitiveAuthCallback()).toEqual({});
    });
  });
});
