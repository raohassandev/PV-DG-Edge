import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@pvdg/config": fromRoot("./packages/config/src/index.ts"),
      "@pvdg/db": fromRoot("./packages/db/src/index.ts"),
      "@pvdg/logger": fromRoot("./packages/logger/src/index.ts"),
      "@pvdg/shared": fromRoot("./packages/shared/src/index.ts")
    }
  },
  test: {
    globals: true,
    include: ["apps/**/*.test.ts", "packages/**/*.test.ts"]
  }
});
