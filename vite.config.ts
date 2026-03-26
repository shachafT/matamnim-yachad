import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // auto-increment if 5173 is taken, but always pick the same base
    host: 'localhost',
  },
})
