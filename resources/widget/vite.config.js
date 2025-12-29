import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../../public/widget',
    emptyOutDir: true,
    lib: {
      entry: './src/index.js',
      name: 'IdScan',
      fileName: 'idscan'
    }
  }
});