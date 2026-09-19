import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import Container from './Container';
import reducer from './reducers/control';
import { applyThemeVars } from './theme';

import './App.css';

// Install the Night Owl palette on :root before the first paint so App.css
// resolves its var() references against real values rather than its static
// fallbacks. body also carries a hardcoded base tone in CSS, which covers the
// brief window before this module runs.
applyThemeVars();

const store = createStore(reducer);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <Container />
    </Provider>
  </StrictMode>,
);
