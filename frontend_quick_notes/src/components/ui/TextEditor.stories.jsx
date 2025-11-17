import React, { useState } from 'react';
import TextEditor from './TextEditor';

export default {
  title: 'UI/TextEditor',
  component: TextEditor,
};

export const Basic = () => {
  const [value, setValue] = useState('Hello notes!');
  return (
    <div style={{ height: 260 }}>
      <TextEditor value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
};
