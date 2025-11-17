# Contributing - Frontend Quick Notes

This document covers Storybook and visual regression workflows.

## Storybook

- Start: `npm run storybook`
  - Opens: http://localhost:6006
  - Global theme toolbar lets you switch between:
    - ocean (Ocean Professional)
    - quicknote (Quick Note Community)
  - We set `data-theme` on `<html>` and load `src/theme/index.css` so CSS variables drive visuals.

- Build static: `npm run build-storybook`
  - Output: `storybook-static/`

- Location of stories:
  - `src/components/ui/*.stories.jsx` for UI components (Button, IconButton, Card, TextEditor)
  - `src/components/ui/Header.stories.jsx` and `Sidebar.stories.jsx` for layout pieces

Tip: Prefer using existing UI components with minimal mocks. For Sidebar we wrap with `NotesProvider` to satisfy hooks.

## Visual Regression (Local)

We scaffolded Playwright tests that take screenshots of selected stories in both themes. This avoids external services while enabling diffs.

- Run:
  - `npm run test-visual`
  - Steps:
    1) Build Storybook (static)
    2) Serve on http://localhost:6007
    3) Run Playwright tests in `storybook-tests/`
- Config:
  - `storybook-tests/playwright.config.js`
  - `storybook-tests/tests/visual.spec.js`

Baselines are created on first run. If you intentionally change visuals, update snapshots locally and commit them according to your team policy.

## Notes

- Do not hardcode secrets; environment variables are used for runtime features.
- Do not modify backend as part of UI Storybook work.
- CI: ensure Playwright dependencies are installed in pipeline runners if running visual tests in CI.
