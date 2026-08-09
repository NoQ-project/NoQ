import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,  // ✅ Explicit frontend port
    host: 'localhost',
    proxy: {
      "/api": {
        target: "http://localhost:8000",  // ✅ FIXED: Changed from 5000 to 8000
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),  // Remove /api prefix
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,  // Disable in production for smaller bundle
  },
});