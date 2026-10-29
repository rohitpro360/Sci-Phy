import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prevents "Invalid hook call" / "useRef of null" from duplicate React copies
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
  },
})