import { test, expect } from '@playwright/test';

// Helper to open story via storyId
async function openStory(page, id, theme) {
  const url = `/iframe.html?id=${encodeURIComponent(id)}&args=&viewMode=story`;
  await page.goto(url);
  // Set theme by toggling data-theme; mirrors Storybook toolbar decorator
  await page.addInitScript((t) => {
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
  // Wait for story root to render
  await page.waitForSelector('#storybook-root');
  await page.waitForTimeout(200); // allow CSS to settle
}

test.describe('Storybook visual snapshots', () => {
  const stories = [
    'ui-button--default',
    'ui-button--primary',
    'ui-iconbutton--basic',
    'ui-card--basic',
    'ui-card--note-card-item',
    'layout-header--default',
    'layout-sidebar--default',
    'ui-texteditor--basic',
  ];

  const themes = ['ocean', 'quicknote'];

  for (const id of stories) {
    for (const theme of themes) {
      test(`snapshot: ${id} [${theme}]`, async ({ page }) => {
        await openStory(page, id, theme);
        const root = page.locator('#storybook-root');
        await expect(root).toHaveScreenshot(`${id}__${theme}.png`, { animations: 'disabled', scale: 'css' });
      });
    }
  }
});
