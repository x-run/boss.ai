/* ── GIS Type Declarations ── */

interface GisCredentialResponse {
  credential: string;
  select_by: string;
}

interface GisButtonConfig {
  type: "standard" | "icon";
  theme: "outline" | "filled_blue" | "filled_black";
  size: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GisCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, config: GisButtonConfig) => void;
  prompt: () => void;
  disableAutoSelect: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

/* ── Script Loading ── */

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

/**
 * Dynamically load the GIS client script.
 * Resolves when `window.google.accounts` is available.
 * Idempotent: subsequent calls return the same promise.
 */
export function loadGisScript(): Promise<void> {
  if (scriptLoaded && window.google?.accounts) {
    return Promise.resolve();
  }
  if (scriptLoading) {
    return scriptLoading;
  }

  scriptLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services script"));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

/* ── Initialize + Render ── */

/**
 * Initialize GIS and render the Sign-In button into a container element.
 * @param container - the DOM element to render the button into
 * @param onCredential - callback receiving the raw JWT credential string
 */
export async function initializeAndRenderButton(
  container: HTMLElement,
  onCredential: (credential: string) => void,
): Promise<void> {
  await loadGisScript();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  if (!clientId) {
    throw new Error(
      "VITE_GOOGLE_CLIENT_ID is not set in environment variables",
    );
  }

  const google = window.google;
  if (!google?.accounts) {
    throw new Error("Google Identity Services not available");
  }

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: GisCredentialResponse) => {
      onCredential(response.credential);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  google.accounts.id.renderButton(container, {
    type: "standard",
    theme: "filled_black",
    size: "large",
    text: "continue_with",
    shape: "pill",
    logo_alignment: "left",
    width: 320,
    locale: "ja",
  });
}
