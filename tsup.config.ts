import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  shims: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
