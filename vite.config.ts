import { defineConfig } from "vite";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: fileURLToPath(new URL("./", import.meta.url)) }],
  },
  base: "/",
});
