import React from 'react';
import ThemedHeader from './Header';

export default {
  title: 'Layout/Header',
  component: ThemedHeader,
};

export const Default = () => (
  <div>
    <ThemedHeader onSave={() => {}} />
    <div style={{ padding: 16 }}>Content below header...</div>
  </div>
);
