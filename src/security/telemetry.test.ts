import { buildAnalyticsPage, sanitizeTelemetryEvent, stripUrlQueryAndFragment } from "./telemetry";

describe("telemetry security", () => {
  it("tracks only the pathname and drops every query parameter by default", () => {
    expect(
      buildAnalyticsPage({
        pathname: "/areas",
        search: "?token=jwt-secret&confirmToken=invite-secret&safe=value"
      })
    ).toBe("/areas");
  });

  it("removes query strings and fragments from URLs", () => {
    expect(stripUrlQueryAndFragment("https://example.com/areas?token=jwt-secret#section")).toBe(
      "https://example.com/areas"
    );
  });

  it("redacts credentials throughout telemetry payloads", () => {
    const sanitized = sanitizeTelemetryEvent({
      request: {
        url: "https://example.com/areas?token=jwt-secret",
        headers: {
          Authorization: "Bearer jwt-secret",
          Referer: "https://example.com/areas?confirmToken=invite-secret"
        }
      },
      extra: {
        token: "jwt-secret",
        message: "callback failed at /areas?token=jwt-secret"
      }
    });

    expect(JSON.stringify(sanitized)).not.toContain("jwt-secret");
    expect(JSON.stringify(sanitized)).not.toContain("invite-secret");
    expect(sanitized.request.url).toBe("https://example.com/areas");
    expect(sanitized.request.headers.Authorization).toBe("[Filtered]");
    expect(sanitized.request.headers.Referer).toBe("https://example.com/areas");
  });
});
