import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'frontend',
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    viteStaticCopy({
      targets: [
        // Kopiert den 'html-pages'-Ordner
        {
          src: 'html-pages/**/*',
          dest: 'html-pages',
        },
        // Kopiert den 'assets'-Ordner
        {
          src: 'assets/**/*',
          dest: 'assets',
        },
        // Kopiert den 'set-up'-Ordner
        {
          src: 'set-up/**/*',
          dest: 'set-up',
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/scripts'),
    },
  },
});
