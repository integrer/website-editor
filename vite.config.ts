import { UserConfigExport } from "vite";
import viteReact from "@vitejs/plugin-react";
import viteLegacyPlugin from "@vitejs/plugin-legacy";
import * as path from "node:path";

const prod = process.env.NODE_ENV === "production";

const config: UserConfigExport = () => {
  const minify = prod;
  const mainModulePath = path.join(__dirname, "src", "index.tsx");
  return {
    plugins: [viteReact(), prod && viteLegacyPlugin()],
    build: {
      outDir: "dist",
      sourcemap: !minify,
      minify,
      rollupOptions: {
        treeshake: {
          preset: "recommended",
          moduleSideEffects: (id) => id === mainModulePath || /(?<!\.module)\.(?:s[ac]|c)ss$/.test(id),
        }
      },
      output: {
        format: "esm",
      },
    },
  };
};

export default config;
