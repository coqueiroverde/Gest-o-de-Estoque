import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: substitua "gestaodeestoque" pelo nome EXATO do seu repositório
export default defineConfig({
  plugins: [react()],
  base: '/gestaodeestoque/'
})
