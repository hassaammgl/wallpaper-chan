import { defineConfig } from 'vite'
import reactSwc from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), reactSwc()],
})
