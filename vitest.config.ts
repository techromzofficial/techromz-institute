import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  oxc: false,
  esbuild: { jsx: "automatic" },
  test: {
    // Keep the full suite within the local/Hostinger-sized memory budget.
    maxWorkers: 1,
    // Large existing jsdom admin-shell renders exceed 5s on this low-memory host.
    // Assertions and suite membership are unchanged; performance uses separate audits.
    testTimeout: 15000,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.test.{js,jsx,ts,tsx}"],
    exclude: ["Admin/**", "node_modules/**", ".next/**"],
  },
  resolve: { alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    "server-only": fileURLToPath(new URL("./src/tests/server-only.ts", import.meta.url)),
  } },
});
