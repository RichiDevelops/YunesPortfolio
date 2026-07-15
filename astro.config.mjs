import { defineConfig } from "astro/config";

export default defineConfig({
  server: { host: "0.0.0.0", port: 8080 },
  vite: {
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
      allowedHosts: true,
    },
  },
});
