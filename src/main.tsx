import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Providers } from './lib/providers';
import { ErrorBoundary } from './components/error-boundary';
import { initSentry } from './lib/sentry';
import App from './App';
import './app/globals.css';

// Initialize Sentry error monitoring
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Providers>
          <App />
        </Providers>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
