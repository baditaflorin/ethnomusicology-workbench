import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const generatedPaths = [
  "docs/404.html",
  "docs/assets",
  "docs/build-info.json",
  "docs/favicon.svg",
  "docs/manifest.webmanifest",
  "docs/pwa-192.svg",
  "docs/pwa-512.svg",
  "docs/sw.js"
];

for (const path of generatedPaths) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

if (existsSync("docs")) {
  for (const file of readdirSync("docs")) {
    if (/^workbox-.+\.js$/.test(file)) {
      rmSync(join("docs", file), { force: true });
    }
  }
}
