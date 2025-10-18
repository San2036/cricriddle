import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.AZURE_STORAGE_CONNECTION_STRING': JSON.stringify(env.VITE_AZURE_STORAGE_CONNECTION_STRING),
        // Add Buffer for Azure SDK
        global: {}
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          // Polyfills for Node.js modules
          buffer: 'buffer',
          stream: 'stream-browserify',
          util: 'util'
        }
      },
      optimizeDeps: {
        esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: 'globalThis'
          }
        }
      }
    };
});
