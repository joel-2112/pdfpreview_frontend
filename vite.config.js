import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
      'localhost',
      'https://pdfpreview-adobe.vercel.app'
    ],
    proxy: {
    '/formvu-outputs': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
  }
});