const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const DEFAULT_BACKEND_PORT = "5000";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const buildHostBasedFallback = () => {
  if (typeof window === "undefined") {
    return `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  const browserHost = window.location.hostname;
  if (LOCALHOST_HOSTS.has(browserHost)) {
    return `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  return `${window.location.protocol}//${browserHost}:${DEFAULT_BACKEND_PORT}`;
};

const parseUrl = (value) => {
  try {
    return new URL(value);
  } catch (error) {
    return null;
  }
};

const rewriteLocalhostForRemoteClient = (parsedUrl) => {
  if (typeof window === "undefined") return parsedUrl;

  const browserHost = window.location.hostname;
  if (!browserHost || LOCALHOST_HOSTS.has(browserHost)) {
    return parsedUrl;
  }

  if (LOCALHOST_HOSTS.has(parsedUrl.hostname)) {
    parsedUrl.hostname = browserHost;
  }

  return parsedUrl;
};

export const resolveApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_APP_API_URL || "").trim();
  const fallback = buildHostBasedFallback();
  const raw = envUrl || fallback;

  const parsed = parseUrl(raw);
  if (!parsed) {
    return trimTrailingSlash(raw);
  }

  rewriteLocalhostForRemoteClient(parsed);
  return trimTrailingSlash(`${parsed.origin}${parsed.pathname}`);
};

export const resolveSocketUrl = () => {
  const baseUrl = resolveApiBaseUrl();
  const parsed = parseUrl(baseUrl);

  if (!parsed) {
    return baseUrl;
  }

  return parsed.origin;
};
