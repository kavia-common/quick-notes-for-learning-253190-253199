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
    * - REACT_APP_API_BASE: Optional backend base URL for Next.js API (e.g. http://localhost:3001).
    * - REACT_APP_BACKEND_URL: Backwards-compat alias for API base.
    * - REACT_APP_FEATURE_FLAGS: JSON string for toggling features.
    */
   return {
     apiBase:
       process.env.REACT_APP_API_BASE ||
       process.env.REACT_APP_BACKEND_URL ||
       '',
     wsUrl: process.env.REACT_APP_WS_URL || '',
     nodeEnv: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development',
     featureFlags: parseJsonSafe(process.env.REACT_APP_FEATURE_FLAGS, {}),
   };
 }
