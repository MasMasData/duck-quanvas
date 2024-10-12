import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

function copyDuckDBFiles() {
  return {
    name: 'copy-duckdb-files',
    writeBundle() {
      const files = [
        'duckdb-mvp.wasm',
        'duckdb-eh.wasm',
        'duckdb-browser-mvp.worker.js',
        'duckdb-browser-eh.worker.js'
      ];

      files.forEach(file => {
        const srcPath = resolve(__dirname, 'public', file);
        const destPath = resolve(__dirname, 'dist', file);
        copyFileSync(srcPath, destPath);
      });
    }
  }
}
export default defineConfig({
  plugins: [
    react(),
    copyDuckDBFiles()
    ],
  base: '/duck-quanvas/',
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm']
  },
  build: {
    commonjsOptions: {
      include: [/@duckdb\/duckdb-wasm/, /node_modules/]
    }
  }
})
