import React from 'react';
import Button from './Button';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    controls: { expanded: true },
  },
  args: {
    children: 'Click me',
  },
};

export const Default = (args) => <Button {...args} />;

export const Primary = (args) => <Button {...args} variant="primary">Primary</Button>;

export const Danger = (args) => <Button {...args} variant="danger">Danger</Button>;

export const Ghost = (args) => <Button {...args} variant="ghost">Ghost</Button>;

export const Icon = (args) => (
  <Button {...args} variant="icon" aria-label="Star" title="Star">
    ⭐
  </Button>
);
