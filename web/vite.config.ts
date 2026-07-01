import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    // Local dev against `func start` in ./api
    proxy: {
      '/api': 'http://localhost:7071',
    },
  },
});
