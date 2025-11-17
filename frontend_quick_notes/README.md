 # Quick Notes React App (Ocean Professional)
 
 A fast, lightweight note-taking app with a login screen, sidebar list, and editor panel.
 
 ## Highlights
 - Ocean Professional theme (clean, classic style)
 - Login (mock, email/username) and Logout
 - Create, view, edit, delete notes
 - Realtime multi-tab sync (BroadcastChannel with storage fallback)
 - LocalStorage persistence with optional remote API
 - Supabase optional direct mode + Realtime (INSERT/UPDATE/DELETE on public.notes)
 - Accessibility: ARIA labels, keyboard navigable
 - Shortcuts: Ctrl/Cmd+N (new), Ctrl/Cmd+S (save)
 - Optional API integration via `REACT_APP_API_BASE` (Next.js /api/notes or JSONPlaceholder)
 
 ## Theming and Design Tokens
 
 - Global styles live in `src/theme/index.css`. It imports `assets/common.css` (Figma tokens) and defines Ocean Professional CSS variables:
   - Colors: `--ocean-primary`, `--ocean-secondary`, `--ocean-success`, `--ocean-error`, `--ocean-bg`, `--ocean-surface`, `--ocean-text`, `--ocean-muted`
   - Spacing: `--space-*`
   - Radius: `--ocean-radius-*`
   - Shadows: `--ocean-shadow-*`
 - JS theme access is available via `src/theme/theme.js`:
   - `ThemeProvider` and `useTheme()` expose a theme object for component logic (do not hardcode secrets).
 - Reusable UI components are under `src/components/ui`:
   - `Button.jsx`, `IconButton.jsx`, `Card.jsx` (includes `NoteCard`), `Header.jsx`, `Sidebar.jsx`, `TextEditor.jsx`
 - The layout and styles reference `assets/stickynote-1-2.css` for spacing/structure mapping and typography helpers in `assets/common.css`.
 
 To tweak colors/spacing:
 1. Edit tokens in `assets/common.css` (design-level) or
 2. Adjust CSS variables in `src/theme/index.css` (app-level).
 
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
 - DELETE {base}/api/notes/:id
 
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
