import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // `@/…` imports resolve through tsconfig paths.
    tsConfigPaths(),
    tailwindcss(),
    // Vercel sets VERCEL=1 during its build; the preset then emits
    // .vercel/output. Anywhere else the default preset builds a Node server
    // you can start with `node dist/server/index.mjs`.
    nitro({ preset: process.env.VERCEL ? "vercel" : undefined }),
    tanstackStart(),
    viteReact(),
  ],
});
