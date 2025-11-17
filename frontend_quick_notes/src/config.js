const parseJsonSafe = (str, fallback) => {
  try {
    if (!str) return fallback;
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// PUBLIC_INTERFACE
export function getEnvConfig() {
  /** Returns runtime configuration derived from environment variables.
   * - REACT_APP_API_BASE: Optional backend base URL (Next.js /api/notes or JSONPlaceholder).
   * - REACT_APP_BACKEND_URL: Backwards-compat alias for API base.
   * - REACT_APP_FEATURE_FLAGS: JSON string for toggling features.
   *
   * When REACT_APP_API_BASE is 'https://jsonplaceholder.typicode.com', sets externalJsonPlaceholder=true.
   */
  const apiBase =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '';
  const externalJsonPlaceholder =
    apiBase.replace(/\/*$/, '') === 'https://jsonplaceholder.typicode.com';

  return {
    apiBase,
    wsUrl: process.env.REACT_APP_WS_URL || '',
    nodeEnv: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development',
    featureFlags: parseJsonSafe(process.env.REACT_APP_FEATURE_FLAGS, {}),
    externalJsonPlaceholder,
  };
}
