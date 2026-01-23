#!/usr/bin/env node

/**
 * Sync version from package.json to README.md and other files
 * This ensures the version is maintained in a single source of truth
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Read package.json
const packageJsonPath = join(rootDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;
const versionWithV = `v${version}`;

// Update README.md if it has version markers
const readmePath = join(rootDir, "README.md");
if (readFileSync(readmePath, "utf-8").includes("<!-- VERSION:")) {
  const readmeContent = readFileSync(readmePath, "utf-8");
  const readmeUpdated = readmeContent.replace(
    /<!-- VERSION:START -->.*?<!-- VERSION:END -->/,
    `<!-- VERSION:START -->${versionWithV}<!-- VERSION:END -->`
  );
  writeFileSync(readmePath, readmeUpdated, "utf-8");
  console.log(`✓ Updated version in README.md to ${versionWithV}`);
} else {
  console.log(`ℹ README.md doesn't have version markers, skipping`);
}

console.log(`✓ Version ${version} synced from package.json`);
