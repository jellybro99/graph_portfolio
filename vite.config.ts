/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

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
      // The processed JSON assets are gitignored build output, so tests resolve
      // them to checked-in fixtures. These entries must come before "@".
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
