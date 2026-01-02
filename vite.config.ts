/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'

// Necessário para recriar o __dirname em projetos ES Modules (type: "module")
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: true, // Necessário para o Docker expor a rede
    port: 5173,
    watch: {
      // CRÍTICO PARA WINDOWS + DOCKER:
      // O sistema de arquivos do Windows (via WSL2) às vezes não notifica mudanças.
      // O polling força o Vite a verificar mudanças periodicamente.
      usePolling: true, 
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
})