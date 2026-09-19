import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import Container from './Container';
import reducer, { initialState } from './reducers/control';
import { loadHighScore, saveHighScore } from './storage';
import { applyThemeVars } from './theme';

import './App.css';

// Install the Night Owl palette on :root before the first paint so App.css
// resolves its var() references against real values rather than its static
// fallbacks. body also carries a hardcoded base tone in CSS, which covers the
// brief window before this module runs.
applyThemeVars();

// The high score is the one piece of state worth outliving the tab. It enters
// through preloadedState and is written back on change, which keeps the
// reducer pure — it never knows storage exists.
const store = createStore(reducer, {
  ...initialState,
  hScore: loadHighScore(),
});

let lastHighScore = store.getState().hScore;
store.subscribe(() => {
  const { hScore } = store.getState();
  if (hScore === lastHighScore) return;
  lastHighScore = hScore;
  saveHighScore(hScore);
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <Container />
    </Provider>
  </StrictMode>,
);
