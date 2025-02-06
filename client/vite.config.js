import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Автоматически открывать браузер при запуске сервера
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // URL вашего бэкенда
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist', // Папка, в которую будет собираться проект
    sourcemap: true, // Создание source maps для удобства отладки
  },
});