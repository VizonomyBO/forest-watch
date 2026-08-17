export interface SensitiveAuthCallback {
  token?: string;
  confirmToken?: string;
}

declare global {
  interface Window {
    __FW_SENSITIVE_AUTH_CALLBACK__?: SensitiveAuthCallback & {
      hadSensitiveParameters?: boolean;
    };
  }
}

const rawCallback = window.__FW_SENSITIVE_AUTH_CALLBACK__;

// The inline bootstrap in public/index.html is the only code allowed to place
// callback credentials on window. Consume and remove it before integrations
// such as Sentry or Google Analytics are initialized.
delete window.__FW_SENSITIVE_AUTH_CALLBACK__;

let pendingCallback: SensitiveAuthCallback = {
  token: typeof rawCallback?.token === "string" ? rawCallback.token : undefined,
  confirmToken: typeof rawCallback?.confirmToken === "string" ? rawCallback.confirmToken : undefined
};

export const wasSensitiveAuthCallback = Boolean(rawCallback?.hadSensitiveParameters);

export function consumeSensitiveAuthCallback(): SensitiveAuthCallback {
  const callback = pendingCallback;
  pendingCallback = {};
  return callback;
}
