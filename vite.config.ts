import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5713,
    allowedHosts: ['scopuli.local'] // 👈 This allows your intranet address safely
  }
});
