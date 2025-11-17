import React from 'react';
import '../src/theme/index.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: { color: /(background|color)$/i, date: /Date$/i },
  },
  backgrounds: {
    default: 'surface',
    values: [
      { name: 'surface', value: 'var(--ocean-surface)' },
      { name: 'bg', value: 'var(--ocean-bg)' },
      { name: 'white', value: '#ffffff' },
    ],
  },
};

const ThemeWrapper = ({ themeKey = 'ocean', children }) => {
  // apply data-theme to html element for CSS variables to take effect
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeKey);
  }
  return <div style={{ padding: 16 }}>{children}</div>;
};

export const globalTypes = {
  themeKey: {
    name: 'Theme',
    description: 'Global theme key',
    defaultValue: 'ocean',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'ocean', title: 'Ocean Professional' },
        { value: 'quicknote', title: 'Quick Note Community' },
      ],
      dynamicTitle: true,
    },
  },
};

export const decorators = [
  (Story, context) => {
    const themeKey = context.globals.themeKey || 'ocean';
    return (
      <ThemeWrapper themeKey={themeKey}>
        <Story />
      </ThemeWrapper>
    );
  },
];
