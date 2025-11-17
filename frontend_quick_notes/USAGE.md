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
