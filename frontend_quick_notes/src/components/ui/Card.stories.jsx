import React from 'react';
import { Card, NoteCard } from './Card';
import Button from './Button';

export default {
  title: 'UI/Card',
  component: Card,
};

export const Basic = () => (
  <Card style={{ padding: 16, maxWidth: 360 }}>
    <h3 style={{ marginTop: 0 }}>Card title</h3>
    <p>This is a basic card surface.</p>
    <Button variant="primary">Action</Button>
  </Card>
);

export const NoteCardItem = () => (
  <div style={{ width: 420 }}>
    <NoteCard
      title="My Note"
      content="Preview of the content goes here..."
      timestamp={new Date().toISOString()}
      active={false}
      onClick={() => {}}
      actions={<Button>Delete</Button>}
    />
  </div>
);
