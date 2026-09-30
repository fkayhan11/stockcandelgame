import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Vite & TanStack Start core configuration.
 * Configures API reverse proxies, SSR server hooks, and static prerender crawler.
 */
export default defineConfig({
  vite: {
    server: {
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
  },
  tanstackStart: {
    server: { entry: "server" },
    prerender: {
      routes: ["/", "/play", "/market", "/skins", "/stats"],
      crawlLinks: true,
    },
  },
});
