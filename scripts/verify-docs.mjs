import { readFileSync, statSync } from "node:fs";

const index = readFileSync("docs/index.html", "utf8");
const stats = statSync("docs/index.html");

if (stats.size < 500) {
  throw new Error("docs/index.html is unexpectedly small.");
}

if (!index.includes("Ethnomusicology Workbench")) {
  throw new Error("docs/index.html is missing the app title.");
}

if (!index.includes("/ethnomusicology-workbench/assets/")) {
  throw new Error("docs/index.html is missing the GitHub Pages base asset path.");
}
