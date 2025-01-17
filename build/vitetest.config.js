/** @type {import('vite').UserConfig} */

import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import vue2 from "@vitejs/plugin-vue2";
import vue2Jsx from "@vitejs/plugin-vue2-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    sequence: {
      shuffle: true,
    },
    coverage: {
      all: false,
      include: ["src/components/*"],
      exclude: ["src/components/pdfHelper/*", "src/components/__tests__/*"],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
  build: {
    assetsDir: "static",
  },
  plugins: [
    vue2(),
    vue2Jsx(),
    legacy({
      targets: ["ie >= 11"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../src", import.meta.url)),
    },
  },
});
