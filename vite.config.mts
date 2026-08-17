import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, transformWithOxc } from "vite";

const legacyJsxPlugin = {
  name: "forest-watcher-legacy-jsx",
  enforce: "pre" as const,
  async transform(code: string, id: string) {
    const filename = id.split("?", 1)[0].replace(/\\/g, "/");
    if (!filename.includes("/src/") || !filename.endsWith(".js")) return null;

    return transformWithOxc(code, id, {
      lang: "jsx",
      jsx: { runtime: "automatic" },
      sourcemap: true
    });
  }
};

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), "REACT_APP_");
  const browserEnv = {
    ...loadedEnv,
    NODE_ENV: mode === "production" ? "production" : "development"
  };

  return {
    plugins: [legacyJsxPlugin, react()],
    resolve: {
      mainFields: ["browser", "module", "main"],
      tsconfigPaths: true
    },
    define: {
      "process.env": JSON.stringify(browserEnv)
    },
    server: {
      port: 3000
    },
    optimizeDeps: {
      entries: ["index.html"],
      rolldownOptions: {
        moduleTypes: {
          ".js": "jsx"
        }
      }
    },
    build: {
      outDir: "build"
    }
  };
});
