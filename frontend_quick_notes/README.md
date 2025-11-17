 # Quick Notes React App (Ocean Professional + Quick Note Community)

 A fast, lightweight note-taking app with a login screen, sidebar list, and editor panel.

 ## Highlights
 - Multi-theme support:
   - Ocean Professional (default)
   - Quick Note Community (Figma-derived)
 - Login (mock, email/username) and Logout
 - Create, view, edit, delete notes
 - Realtime multi-tab sync (BroadcastChannel with storage fallback)
 - LocalStorage persistence with optional remote API
 - Supabase optional direct mode + Realtime (INSERT/UPDATE/DELETE on public.notes)
 - Accessibility: ARIA labels, keyboard navigable
 - Shortcuts: Ctrl/Cmd+N (new), Ctrl/Cmd+S (save)
 - Optional API integration via `REACT_APP_API_BASE` (Next.js /api/notes or JSONPlaceholder)

 ## Design System and Theme Layers

 Global theme CSS is loaded once in `src/index.js`:

 ```js
 import './theme/index.css';
 ```

 Base tokens from Figma are imported in `src/theme/index.css` via `src/assets/common.css`. Theme variables are split into layers:
 - `src/theme/themes/ocean.css` – variables under `[data-theme="ocean"]` (and default)
 - `src/theme/themes/quickNoteCommunity.css` – variables under `[data-theme="quicknote"]` mapping Figma tokens from `assets/quick-note-community-102-1860.css`

 Runtime theme is applied by setting `[data-theme="<key>"]` on `<html>`. The app persists the selection in `localStorage` under `app_theme`.

 JS theme provider:
 - `src/theme/theme.js`
   - `ThemeProvider` manages themeKey ('ocean' | 'quicknote'), writes `[data-theme]`, and persists to `localStorage`.
   - `useTheme()` exposes `{ theme, themeKey, setTheme }`.

 Header includes a minimal ThemeSwitcher:
 - `src/components/ui/Header.jsx` adds a button to toggle between themes.

 ### Add a new theme
 1. Create a CSS variables file in `src/theme/themes/<name>.css` with a `[data-theme="<name>"]` block that defines the same variable contract:
    - `--ocean-primary`, `--ocean-secondary`, `--ocean-success`, `--ocean-error`
    - `--ocean-bg`, `--ocean-surface`, `--ocean-text`, `--ocean-muted`
    - `--ocean-shadow-*`, `--ocean-radius-*`, `--space-*`
 2. Import the new file in `src/theme/index.css`.
 3. Extend the registry in `src/theme/theme.js` to include a JS theme object.
 4. Update any UI element (e.g., Header) to allow selecting the new theme key, or build a settings screen.

 Tip: Provide fallbacks in your theme CSS (e.g., `var(--color-000000, #000)`) to avoid runtime breaks.

 ## Scripts
 - `npm start` – run locally
 - `npm test` – unit tests
 - `npm run build` – production build

 See USAGE.md for details.

 ## Environment and API Integration

 This app reads configuration from environment variables (Create React App style). For API integration a single base URL is derived in this order:
 1. `REACT_APP_API_BASE` (preferred)
 2. `REACT_APP_BACKEND_URL` (fallback alias)

 The base URL should point to a backend exposing REST routes:
 - GET    {base}/api/notes
 - POST   {base}/api/notes
 - PUT    {base}/api/notes/:id
 - DELETE {base}/api/notes/:id}

 Alternatively, you can point to JSONPlaceholder for demo:
 - `REACT_APP_API_BASE=https://jsonplaceholder.typicode.com`
   - List: GET /posts
   - Create/Update/Delete: /posts CRUD (non-persistent, mapped to local fields)

 Feature flags are controlled by `REACT_APP_FEATURE_FLAGS` (JSON string). Example:

 ```
 REACT_APP_FEATURE_FLAGS={"notes_mock":true,"useSupabaseDirect":false}
 ```

 - `notes_mock`: Forces the app to use local in-memory/localStorage repository even if API is configured. Useful when backend is offline.
 - `useSupabaseDirect`: Enables direct Supabase Realtime integration when Supabase env vars are set (see USAGE.md).

 Security notes:
 - No secrets are hardcoded. Supabase and other keys must be provided via env.
 - The app avoids logging sensitive values.

 ### Quick Start
 1. Copy `.env.example` to `.env` and adjust values.
 2. Optionally set `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL`.
 3. Optionally set `REACT_APP_FEATURE_FLAGS` to control mock behavior.
 4. `npm start`

 If the API is unreachable, the app gracefully falls back to cached/local storage.
