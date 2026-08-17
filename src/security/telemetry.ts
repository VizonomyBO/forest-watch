export const ANALYTICS_QUERY_PARAMETER_ALLOWLIST: readonly string[] = [];
const SENSITIVE_FIELD_NAME =
  /^(authorization|cookie|set-cookie|token|confirmtoken|access_token|refresh_token|id_token)$/i;
const URL_FIELD_NAME = /^(url|uri|referrer|referer)$/i;
const SENSITIVE_QUERY_VALUE = /([?&](?:token|confirmToken|access_token|refresh_token|id_token|code|state)=)[^&#\s]*/gi;
const BEARER_VALUE = /Bearer\s+[^\s,;]+/gi;

export interface LocationForAnalytics {
  pathname: string;
  search?: string;
}

export function buildAnalyticsPage(location: LocationForAnalytics): string {
  // Query parameters must be explicitly reviewed and added to the allowlist
  // before they can be included. The initial allowlist is intentionally empty.
  return location.pathname;
}

export function stripUrlQueryAndFragment(value: string): string {
  const queryIndex = value.indexOf("?");
  const fragmentIndex = value.indexOf("#");
  const indexes = [queryIndex, fragmentIndex].filter(index => index >= 0);

  return indexes.length > 0 ? value.slice(0, Math.min(...indexes)) : value;
}

function sanitizeString(value: string, fieldName?: string): string {
  if (fieldName && SENSITIVE_FIELD_NAME.test(fieldName)) {
    return "[Filtered]";
  }

  const withoutUrlQuery = fieldName && URL_FIELD_NAME.test(fieldName) ? stripUrlQueryAndFragment(value) : value;
  return withoutUrlQuery.replace(SENSITIVE_QUERY_VALUE, "$1[Filtered]").replace(BEARER_VALUE, "Bearer [Filtered]");
}

function sanitizeValue(value: unknown, fieldName?: string): unknown {
  if (typeof value === "string") {
    return sanitizeString(value, fieldName);
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.keys(value).reduce<Record<string, unknown>>((sanitized, key) => {
      sanitized[key] = sanitizeValue((value as Record<string, unknown>)[key], key);
      return sanitized;
    }, {});
  }

  return value;
}

export function sanitizeTelemetryEvent<T>(event: T): T {
  return sanitizeValue(event) as T;
}
