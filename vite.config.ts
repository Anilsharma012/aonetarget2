import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Dev server config
    server: {
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 5000,
      strictPort: true,
      cors: true,
      open: true,
      allowedHosts: true,

      proxy: {
        "/api": {
          target: "http://127.0.0.1:3001",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },

    // Preview build config
    preview: {
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 5000,
    },

    // Path alias
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },

    // Env variables
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

    // Build output
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
