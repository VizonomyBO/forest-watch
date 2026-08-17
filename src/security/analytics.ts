import ReactGA from "react-ga";
import { ENVIRONMENT, GA_UA } from "constants/global";
import { wasSensitiveAuthCallback } from "./authCallback";
import { buildAnalyticsPage, LocationForAnalytics } from "./telemetry";

let analyticsEnabled = false;

export function initializeAnalytics(): void {
  if (wasSensitiveAuthCallback || !GA_UA) return;

  ReactGA.initialize(GA_UA, { testMode: ENVIRONMENT === "test" });
  analyticsEnabled = true;
}

export function trackPage(location: LocationForAnalytics): void {
  if (!analyticsEnabled) return;

  const page = buildAnalyticsPage(location);
  ReactGA.set({ page });
  ReactGA.pageview(page);
}
