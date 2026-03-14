import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM;
const isDebug = !!process.env.TAURI_ENV_DEBUG;

export default defineConfig({
  base: isTauriBuild ? "/" : "/handy-dev-tools/",
  plugins: [
    react(),
    ...(!isTauriBuild &&
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          (
            await import("@replit/vite-plugin-runtime-error-modal")
          ).default(),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: isTauriBuild ? "safari16" : "modules",
    minify: isDebug ? false : "esbuild",
    sourcemap: isDebug || !isTauriBuild,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["@/lib/utils"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: process.env.TAURI_DEV_HOST || false,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_"],
});
