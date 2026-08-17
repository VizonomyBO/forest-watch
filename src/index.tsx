import store from "store";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import * as Sentry from "@sentry/browser";
import { BrowserRouter as Router } from "react-router-dom";
import { SENTRY_DSN, ENVIRONMENT } from "./constants/global";
import App from "components/app/AppContainer";
import "./main.css";
import "./index.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sanitizeTelemetryEvent } from "security/telemetry";
import { clearLegacyPersistedUserState, persistenceConfig } from "security/storage";
import "security/authCallback";
import { LOGOUT } from "modules/user";
import { setAuthTokenProvider, setUnauthorizedHandler } from "services/httpClient";

/** Initialise Sentry */
if (ENVIRONMENT !== "development") {
  Sentry.init({
    dsn: SENTRY_DSN,
    beforeSend: event => sanitizeTelemetryEvent(event),
    beforeBreadcrumb: breadcrumb => sanitizeTelemetryEvent(breadcrumb)
  });
}
// Export dispatch function for dispatching actions outside connect
function dispatch(action: any) {
  store.dispatch(action);
}

const queryClient = new QueryClient();

setUnauthorizedHandler(() => store.dispatch({ type: LOGOUT }));
setAuthTokenProvider(() => store.getState().user.token);

function startApp() {
  const container = document.getElementById("app");
  const root = createRoot(container!);
  root.render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    </QueryClientProvider>
  );
}

clearLegacyPersistedUserState();

persistStore(store, persistenceConfig, () => {
  startApp();
});

export { store, dispatch };
