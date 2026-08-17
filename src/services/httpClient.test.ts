import { ApiError, generatedApiFetch, httpRequest, setAuthTokenProvider, setUnauthorizedHandler } from "./httpClient";

describe("httpClient", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    window.fetch = fetchMock;
    setUnauthorizedHandler(undefined);
    setAuthTokenProvider(undefined);
  });

  it("uses the central token provider unless a request explicitly omits auth", async () => {
    setAuthTokenProvider(() => "current-session");
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await httpRequest("https://api.example.test/areas");
    expect((fetchMock.mock.calls[0][1].headers as Headers).get("Authorization")).toBe("Bearer current-session");

    await httpRequest("https://api.example.test/login", { headers: { Authorization: "" } });
    expect((fetchMock.mock.calls[1][1].headers as Headers).has("Authorization")).toBe(false);
  });

  it("adds authentication but does not generate CORS-sensitive headers for cross-origin requests", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await httpRequest("https://api.example.test/areas", { token: "secret-token" });

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer secret-token");
    expect(headers.has("X-Request-ID")).toBe(false);

    await httpRequest("https://api.example.test/public");
    expect((fetchMock.mock.calls[1][1].headers as Headers).has("Authorization")).toBe(false);
  });

  it("adds generated request metadata to same-origin requests", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await httpRequest("/api/areas");

    expect((fetchMock.mock.calls[0][1].headers as Headers).get("X-Request-ID")).toBeTruthy();
  });

  it("normalizes API failures and invokes the unauthorized handler for authenticated 401s", async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Session expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "X-Request-ID": "server-request-id" }
      })
    );

    await expect(httpRequest("https://api.example.test/private", { token: "expired" })).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      payload: { message: "Session expired" },
      requestId: "server-request-id"
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("does not send an empty authorization header or log out for a public 401", async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    fetchMock.mockResolvedValue(new Response("Invalid credentials", { status: 401 }));

    await expect(
      httpRequest("https://api.example.test/login", { headers: { Authorization: "" } })
    ).rejects.toMatchObject({ status: 401 });
    expect((fetchMock.mock.calls[0][1].headers as Headers).has("Authorization")).toBe(false);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("preserves abort errors and normalizes other network errors", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    fetchMock.mockRejectedValueOnce(abortError).mockRejectedValueOnce(new Error("offline"));

    await expect(httpRequest("https://api.example.test/slow")).rejects.toBe(abortError);
    const request = httpRequest("https://api.example.test/fail");
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ status: "network" });
  });

  it("serializes JSON, encodes paths and arrays, and lets the browser set multipart boundaries", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
    );

    await generatedApiFetch("https://api.example.test", {
      url: "/areas/{id}",
      method: "post",
      body: { name: "Forest" },
      pathParams: { id: "a/b" },
      queryParams: { tag: ["one", "two"] }
    });

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example.test/areas/a%2Fb?tag=one&tag=two");
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ name: "Forest" }));
    expect((fetchMock.mock.calls[0][1].headers as Headers).get("Content-Type")).toBe("application/json");

    await generatedApiFetch("https://api.example.test", {
      url: "/uploads",
      method: "post",
      body: new FormData(),
      headers: { "Content-Type": "multipart/form-data" }
    });
    expect((fetchMock.mock.calls[1][1].headers as Headers).has("Content-Type")).toBe(false);
  });
});
