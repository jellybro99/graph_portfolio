/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    alias: [
      // src/assets/processedProjects.json and processedGraphData.json are
      // gitignored prebuild artifacts, so a test that imports App (and, through
      // App, Graph) cannot resolve them on a fresh checkout: Vite fails the
      // transform before vi.mock can substitute anything. Resolve the two
      // specifiers to checked-in fixtures for tests only. They must precede
      // the "@" entry to win.
      {
        find: "@/assets/processedProjects.json",
        replacement: fileURLToPath(
          new URL("./test/fixtures/processedProjects.json", import.meta.url),
        ),
      },
      {
        find: "@/assets/processedGraphData.json",
        replacement: fileURLToPath(
          new URL("./test/fixtures/processedGraphData.json", import.meta.url),
        ),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});
