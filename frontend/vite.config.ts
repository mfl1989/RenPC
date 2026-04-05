import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 局域网 / 127.0.0.1 でも届くようにし、localhost 解決の差で繋がらないケースを減らす
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
    proxy: {
      // 開発時は同一オリジンで /api を叩き、CORS・ポート変更の影響を受けにくくする
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
