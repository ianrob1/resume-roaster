const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = path.join(__dirname, "..");
const pngPath = path.join(projectRoot, "public", "favicon-32.png");
const outPath = path.join(projectRoot, "app", "favicon.ico");

if (!fs.existsSync(pngPath)) {
  console.warn("scripts/generate-favicon: public/favicon-32.png not found, skipping");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
execSync(`npx png-to-ico "${pngPath}" > "${outPath}"`, {
  cwd: projectRoot,
  stdio: "inherit",
});
console.log("scripts/generate-favicon: wrote app/favicon.ico");
