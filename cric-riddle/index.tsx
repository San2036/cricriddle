
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Polyfill for Buffer needed by Azure Storage SDK
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
