import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/Starcraft-map-picker-frontend",
  server: {
    port: 3000,
    proxy: {
      '/maps': {
        target: 'http://192.168.1.72:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/maps/, '/maps'),
      },
    },
   
  },
  plugins: [react()],
});
