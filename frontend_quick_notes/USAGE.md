 # Quick Notes - Frontend
 
 - Single page layout with:
   - Sidebar: search, list, add note
   - Main panel: editor with live preview
 - Persistence: localStorage by default
 - Optional API base URL via REACT_APP_API_BASE (not enabled by default)
 - Feature flags: REACT_APP_FEATURE_FLAGS JSON (e.g. {"useRemoteApi": false})
 - Optional Supabase direct mode with Realtime subscriptions to public.notes
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
 
 ### Option B: Use Public JSONPlaceholder (Demo)
 
 You can also use the public JSONPlaceholder API as a demo backend:
 
 - REACT_APP_API_BASE=https://jsonplaceholder.typicode.com
 
 Behavior in this mode:
 - Lists notes from GET /posts (first 50 items to keep payload small)
 - Field mapping: { id, title, body } ↔ { id, title, content }
 - Create/Update: sends/receives the "body" field instead of "content"
 - Timestamps (createdAt/updatedAt) are synthesized locally with new Date().toISOString()
 - Local cache in localStorage is maintained after operations
 
 Limitations:
 - JSONPlaceholder is a fake online REST API; writes are not persisted on the server.
 - After refresh, you will see the original list again (from /posts); local cache persists in your browser.
 
 ### Option C: Supabase Direct Mode + Realtime (Postgres Changes)
 
 Enable the app to subscribe directly to Supabase Realtime events (INSERT/UPDATE/DELETE) on the `public.notes` table.
 
 1) Set environment variables in your React app:
 
 - REACT_APP_FEATURE_FLAGS={"useSupabaseDirect":true}
 - REACT_APP_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
 - REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
 
 2) In your Supabase Dashboard:
 
 - Database -> Realtime -> Publications: ensure `supabase_realtime` publication includes `public.notes` table.
   If not, add `public.notes` to the publication.
 - Create table `public.notes` with columns:
   - id: uuid (default uuid_generate_v4()) or bigint
   - title: text
   - content: text
   - created_at: timestamptz default now()
   - updated_at: timestamptz default now() (and a trigger to update on changes if desired)
 - Optional: Configure RLS policies if RLS is enabled. This app does not include auth; for testing, you can disable RLS or create permissive policies for anon key as needed.
 
 3) Start the React app: `npm start`
 
 Behavior:
 - When `useSupabaseDirect` is true and both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set, the app will:
   - Create a Supabase client
   - Subscribe to realtime changes on `public.notes` using Postgres Changes
   - Dispatch UI updates on INSERT/UPDATE/DELETE
 - Local BroadcastChannel multi-tab sync remains active.
 - No secrets are logged.
 
 Limitations:
 - Without proper RLS policies or disabled RLS, direct anon access may fail.
 - CRUD operations are still handled by the existing repository (local/optional REST). Realtime provides live UI updates when other clients modify the table directly.
 
 NOTE:
 - Do not change preview/start scripts.
 - Other environment variables supported: REACT_APP_FEATURE_FLAGS, REACT_APP_NODE_ENV, etc.
