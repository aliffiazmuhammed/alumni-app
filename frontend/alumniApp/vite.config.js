import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://3.107.192.100:443', // Your backend server's address
        changeOrigin: true,  // This ensures that the origin of the request is changed to the target
        secure: false, // Set this to false because the backend is HTTP
        rewrite: (path) => path.replace(/^\/api/, ''),  // Optionally, rewrite the URL path if needed
      },
    },
  },
});
