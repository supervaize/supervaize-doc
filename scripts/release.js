#!/usr/bin/env node

/**
 * Release script (GitButler workflow).
 * Creates an empty release commit on a fresh branch, opens a PR with `but pr new`,
 * then squash-merges it so the commit landing on main carries the PR title
 * (e.g. "feat: version bump (#14)"). CI reads that message to pick the bump type.
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

// Map version type to commit message prefix (matched by .github/workflows/deploy.yml)
const commitMessages = {
  patch: "fix: version bump",
  minor: "feat: version bump",
  major: "feat!: version bump [BREAKING CHANGE]",
};

const run = (cmd) => execSync(cmd, { cwd: rootDir, stdio: "inherit" });

try {
  const commitMessage = commitMessages[versionType];
  const branch = `release-${versionType}-${Date.now()}`;

  console.log(`Creating ${versionType} release on branch ${branch}...`);

  // Uncommitted changes are left alone; commit them separately before releasing.
  run("but pull");
  run(`but commit --empty -b ${branch} -m "${commitMessage}"`);
  run(`but pr new ${branch} -m "${commitMessage}"`);

  // Squash merge: a merge commit would hide the bump type from CI.
  run(`gh pr merge ${branch} --squash --delete-branch`);
  run("but pull");

  console.log(`\n✓ Release merged to main!`);
  console.log(`CI/CD will automatically bump the ${versionType} version.`);
} catch (error) {
  console.error("\n✗ Release failed:", error.message);
  process.exit(1);
}
