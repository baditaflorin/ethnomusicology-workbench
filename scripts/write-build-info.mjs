import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

const readGit = (command, fallback) => {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
};

const info = {
  version: process.env.VITE_APP_VERSION ?? packageJson.version,
  commit: process.env.VITE_BUILD_COMMIT ?? readGit("git rev-parse --short HEAD", "local"),
  fullCommit: readGit("git rev-parse HEAD", "local"),
  repository: "https://github.com/baditaflorin/ethnomusicology-workbench",
  support: "https://www.paypal.com/paypalme/florinbadita"
};

mkdirSync("public", { recursive: true });
writeFileSync("public/build-info.json", `${JSON.stringify(info, null, 2)}\n`);
