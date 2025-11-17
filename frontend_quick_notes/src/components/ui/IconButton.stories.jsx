import React from 'react';
import IconButton from './IconButton';

export default {
  title: 'UI/IconButton',
  component: IconButton,
};

export const Basic = (args) => (
  <IconButton {...args} label="Settings">⚙️</IconButton>
);
