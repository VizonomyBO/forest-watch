export type ApiErrorStatus = number | "network" | "unknown";

export class ApiError<TPayload = unknown> extends Error {
  status: ApiErrorStatus;
  payload: TPayload;
  requestId?: string;

  constructor(status: ApiErrorStatus, payload: TPayload, requestId?: string) {
    super(getErrorMessage(payload));
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.requestId = requestId;
  }
}

type UnauthorizedHandler = () => void;
type AuthTokenProvider = () => string | null | undefined;

let unauthorizedHandler: UnauthorizedHandler | undefined;
let authTokenProvider: AuthTokenProvider | undefined;

export const setUnauthorizedHandler = (handler?: UnauthorizedHandler) => {
  unauthorizedHandler = handler;
};

export const setAuthTokenProvider = (provider?: AuthTokenProvider) => {
  authTokenProvider = provider;
};

const getErrorMessage = (payload: unknown) => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return "Unexpected API error";
  }
};

const createRequestId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `fw-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const parseErrorPayload = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("json")) {
    try {
      return await response.json();
    } catch {
      return "The API returned an invalid JSON error response";
    }
  }

  const text = await response.text();
  return text || response.statusText || "Unexpected API error";
};

export type HttpRequestOptions = RequestInit & {
  token?: string | null;
};

export const httpRequest = async (url: string, options: HttpRequestOptions = {}) => {
  const { token, ...requestInit } = options;
  const headers = new Headers(requestInit.headers);
  const requestId = headers.get("X-Request-ID") || createRequestId();
  const requestOrigin = new URL(url, window.location.href).origin;
  const isSameOriginRequest = requestOrigin === window.location.origin;
  const authorizationWasSpecified = headers.has("Authorization");
  const resolvedToken = token === undefined ? authTokenProvider?.() : token;

  // Avoid turning cross-origin requests into unsupported CORS preflights. The
  // API can still return its own request ID, while same-origin proxy requests
  // receive the client-generated correlation header.
  if (isSameOriginRequest && !headers.has("X-Request-ID")) headers.set("X-Request-ID", requestId);
  if (resolvedToken && !authorizationWasSpecified) headers.set("Authorization", `Bearer ${resolvedToken}`);
  if (!headers.get("Authorization")) headers.delete("Authorization");
  const isAuthenticated = headers.has("Authorization");

  let response: Response;
  try {
    response = await window.fetch(url, { ...requestInit, headers });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("network", error instanceof Error ? error.message : "Network error", requestId);
  }

  const responseRequestId = response.headers.get("X-Request-ID") || requestId;
  if (!response.ok) {
    const payload = await parseErrorPayload(response);
    if (response.status === 401 && isAuthenticated) unauthorizedHandler?.();
    throw new ApiError(response.status || "unknown", payload, responseRequestId);
  }

  return response;
};

export const parseHttpResponse = async <TData>(response: Response): Promise<TData> => {
  if (response.status === 204) return undefined as unknown as TData;
  if (response.headers.get("content-type")?.includes("json")) return response.json();
  return (await response.blob()) as unknown as TData;
};

type QueryValue = string | number | boolean | null | undefined | Array<string | number | boolean>;

export const resolveApiUrl = (
  baseUrl: string | undefined,
  url: string,
  queryParams: Record<string, QueryValue> = {},
  pathParams: Record<string, string | number> = {}
) => {
  const path = url.replace(/\{\w*\}/g, key => encodeURIComponent(String(pathParams[key.slice(1, -1)] ?? "")));
  const search = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    (Array.isArray(value) ? value : [value]).forEach(item => search.append(key, String(item)));
  });

  const query = search.toString();
  return `${baseUrl || ""}${path}${query ? `?${query}` : ""}`;
};

export type GeneratedFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
};

export const generatedApiFetch = async <TData>(
  baseUrl: string | undefined,
  { url, method, body, headers, pathParams, queryParams, signal }: GeneratedFetcherOptions<any, any, any, any>
) => {
  const requestHeaders = new Headers(headers);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body && !isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (isFormData) requestHeaders.delete("Content-Type");

  const response = await httpRequest(resolveApiUrl(baseUrl, url, queryParams, pathParams), {
    signal,
    method: method.toUpperCase(),
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    headers: requestHeaders
  });

  return parseHttpResponse<TData>(response);
};
