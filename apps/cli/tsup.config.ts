import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  platform: "node",
  noExternal: ["@sira/core"],
  external: ["gray-matter", "js-yaml", "simple-git", "zod", "commander"],
  banner: {
    js: "#!/usr/bin/env node",
  },
});
