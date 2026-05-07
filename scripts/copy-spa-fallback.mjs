import { copyFileSync, existsSync } from "node:fs";

if (!existsSync("docs/index.html")) {
  throw new Error("docs/index.html does not exist. Run vite build first.");
}

copyFileSync("docs/index.html", "docs/404.html");
