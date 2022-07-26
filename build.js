import fs from "fs";
import { build } from "esbuild";

const { dependencies, peerDependencies } = JSON.parse(
  fs.readFileSync("package.json", "utf8")
);

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true
};

build({
  ...sharedConfig,
  outfile: "dist/index.js",
  platform: "neutral",
  external: Object.keys({ ...dependencies, ...peerDependencies })
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
