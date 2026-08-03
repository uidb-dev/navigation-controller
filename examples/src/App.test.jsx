import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { expect, it } from 'vitest';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const root = createRoot(div);
  act(() => { root.render(<App />); });

  expect(div.querySelector('.footerMenu')).toBeTruthy();

  act(() => { root.unmount(); });
  div.remove();
});
