import React from 'react';
import ThemedSidebar from './Sidebar';
import { NotesProvider } from '../../store/NotesContext';

export default {
  title: 'Layout/Sidebar',
  component: ThemedSidebar,
  decorators: [
    (Story) => (
      <NotesProvider>
        <div style={{ height: 420 }}>
          <Story />
        </div>
      </NotesProvider>
    ),
  ],
};

export const Default = () => <ThemedSidebar />;
