 # Quick Notes - Frontend
 
 - Single page layout with:
   - Sidebar: search, list, add note
   - Main panel: editor with live preview
 - Persistence: localStorage by default
 - Optional API base URL via REACT_APP_API_BASE (not enabled by default)
 - Feature flags: REACT_APP_FEATURE_FLAGS JSON (e.g. {"useRemoteApi": false})
 - Accessibility: labeled controls, roles, aria-live regions
 - Shortcuts: Ctrl/Cmd+N (new), Ctrl/Cmd+S (save)
 - Theme: Ocean Professional (primary #1E3A8A, secondary #F59E0B)
 
 ## Development
 - npm start
 - npm test
 
 ## Environment
 Copy .env.example to .env and adjust values as needed.
 
 ### Option A: Connect to Next.js API (/api/notes)
 
 The app can call a Next.js backend that exposes REST routes under `/api/notes`.
 
 1) Start your Next.js app (or API service) on a port, e.g. http://localhost:3001
 2) In this React app, set the environment variable:
 
 - REACT_APP_API_BASE=http://localhost:3001
 
 3) Start the React app: `npm start`
 
 With REACT_APP_API_BASE set, the app will:
 - Use remote API for notes list/create/update/delete
 - Normalize server fields (created_at/updated_at) to createdAt/updatedAt
 - Cache the latest results in localStorage as a fallback
 - Preserve realtime multi-tab sync via BroadcastChannel/localStorage
 
 If the API is unreachable, the app automatically falls back to localStorage.
 
 NOTE:
 - Do not change preview/start scripts; use REACT_APP_API_BASE to toggle remote mode.
 - Other environment variables supported: REACT_APP_FEATURE_FLAGS, REACT_APP_NODE_ENV, etc.
