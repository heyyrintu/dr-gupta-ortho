import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: { env: Record<string, string | undefined> }; // no @types/node in this project

// BASE_PATH lets the same build run under a sub-path, e.g. the GitHub Pages preview at /<repo>/.
export default defineConfig(({ isSsrBuild }) => ({
  base: process.env.BASE_PATH || '/',
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
