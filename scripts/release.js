#!/usr/bin/env node

/**
 * Release script that creates a commit with appropriate message and pushes to main.
 * CI/CD will automatically detect the commit message and bump the version.
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const versionType = process.argv[2]; // patch, minor, or major

if (!["patch", "minor", "major"].includes(versionType)) {
  console.error("Usage: node scripts/release.js <patch|minor|major>");
  process.exit(1);
}

// Map version type to commit message prefix
const commitMessages = {
  patch: "fix: version bump",
  minor: "feat: version bump",
  major: "feat!: version bump [BREAKING CHANGE]",
};

try {
  const commitMessage = commitMessages[versionType];
  
  console.log(`Creating release commit for ${versionType} version bump...`);
  console.log(`Commit message: ${commitMessage}`);
  
  // Check if there are any changes to commit
  const status = execSync("git status --porcelain", {
    cwd: rootDir,
    encoding: "utf-8",
  }).trim();

  if (status) {
    // Commit any existing changes
    execSync(`git add -A`, { cwd: rootDir, stdio: "inherit" });
    execSync(`git commit -m "${commitMessage}"`, {
      cwd: rootDir,
      stdio: "inherit",
    });
  } else {
    // Create an empty commit if there are no changes
    execSync(`git commit --allow-empty -m "${commitMessage}"`, {
      cwd: rootDir,
      stdio: "inherit",
    });
  }

  // Push to main
  console.log("\nPushing to main...");
  execSync("git push origin main", {
    cwd: rootDir,
    stdio: "inherit",
  });

  console.log(`\n✓ Release commit pushed to main!`);
  console.log(`CI/CD will automatically bump the ${versionType} version.`);
} catch (error) {
  console.error("\n✗ Release failed:", error.message);
  process.exit(1);
}
