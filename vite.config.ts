import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/Starcraft-map-picker-frontend",
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true, 
        rewrite: (path) => path.replace(/^\/api/, '/'),
      },
    },
   
  },
  plugins: [react()],
});
