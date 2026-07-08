import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isProduction = process.env.PRODUCTION === "true";

export default defineConfig({
  base: isProduction ? "/sync-watch/" : "/",
  plugins: [react(), tailwindcss()],
});
