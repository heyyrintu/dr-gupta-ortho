import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            // keep three.js in its own chunk so pages without 3D stay light
            manualChunks: { three: ['three'] },
          },
    },
  },
}));
