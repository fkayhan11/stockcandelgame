import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Standard Vite & TanStack Start core configuration.
 * Configures API reverse proxies, SSR server hooks, and static prerender crawler.
 */
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/yahoo": {
        target: "https://query1.finance.yahoo.com",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/yahoo/, ""),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
      prerender: {
        routes: ["/", "/play", "/market", "/skins", "/stats"],
        crawlLinks: true,
      },
    }),
    react(),
  ],
});
