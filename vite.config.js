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
      '/api': {
        target: 'https://fool-mulch-unroll.ngrok-free.dev/',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});