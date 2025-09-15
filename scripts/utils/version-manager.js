#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const prompts = require("prompts");

/**
 * Version Manager for AllerScan
 * 
 * Handles:
 * - App version (user-facing version like 1.0.0)
 * - Build numbers (auto-incremented by EAS)
 * - Runtime version (fingerprint-based for OTA compatibility)
 */

class VersionManager {
  constructor() {
    this.appJsonPath = path.join(process.cwd(), "app.json");
    this.appJson = JSON.parse(fs.readFileSync(this.appJsonPath, "utf8"));
  }

  getCurrentVersion() {
    return this.appJson.expo.version;
  }

  async checkVersionBump(profile) {
    // Only prompt for version bump on production builds
    if (profile !== "production") {
      return false;
    }

    const currentVersion = this.getCurrentVersion();
    console.log(`\n📦 Current app version: ${currentVersion}\n`);

    const { shouldBump } = await prompts({
      type: "confirm",
      name: "shouldBump",
      message: "Would you like to bump the app version?",
      initial: false,
    });

    if (!shouldBump) {
      return false;
    }

    const { bumpType } = await prompts({
      type: "select",
      name: "bumpType",
      message: "Select version bump type:",
      choices: [
        { 
          title: `Patch (${this.getNextVersion(currentVersion, "patch")})`, 
          value: "patch",
          description: "Bug fixes and minor changes"
        },
        { 
          title: `Minor (${this.getNextVersion(currentVersion, "minor")})`, 
          value: "minor",
          description: "New features, backwards compatible"
        },
        { 
          title: `Major (${this.getNextVersion(currentVersion, "major")})`, 
          value: "major",
          description: "Breaking changes"
        },
        { 
          title: "Custom", 
          value: "custom",
          description: "Enter a custom version"
        },
      ],
      initial: 0,
    });

    if (!bumpType) {
      return false;
    }

    let newVersion;
    if (bumpType === "custom") {
      const { customVersion } = await prompts({
        type: "text",
        name: "customVersion",
        message: "Enter custom version:",
        initial: currentVersion,
        validate: (value) => {
          if (!/^\d+\.\d+\.\d+$/.test(value)) {
            return "Version must be in format X.Y.Z (e.g., 1.2.3)";
          }
          return true;
        },
      });
      newVersion = customVersion;
    } else {
      newVersion = this.getNextVersion(currentVersion, bumpType);
    }

    // Update app.json
    this.appJson.expo.version = newVersion;
    fs.writeFileSync(this.appJsonPath, JSON.stringify(this.appJson, null, 2) + "\n");

    console.log(`\n✅ Version bumped from ${currentVersion} to ${newVersion}\n`);
    return true;
  }

  getNextVersion(currentVersion, bumpType) {
    const [major, minor, patch] = currentVersion.split(".").map(Number);

    switch (bumpType) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
      default:
        return currentVersion;
    }
  }

  getRuntimeVersionInfo() {
    const policy = this.appJson.expo.runtimeVersion?.policy || "fingerprint";
    
    console.log(`\n🔍 Runtime Version Policy: ${policy}`);
    
    if (policy === "fingerprint") {
      console.log(`
ℹ️  Using fingerprint-based runtime version:
   - Automatically detects native code changes
   - Enables EAS build caching when native deps don't change
   - OTA updates work within same runtime version
   - New runtime = new native build required
`);
    }
    
    return policy;
  }

  getVersionSummary() {
    const buildNumberIos = this.appJson.expo.ios?.buildNumber || "1";
    const versionCodeAndroid = this.appJson.expo.android?.versionCode || 1;
    
    return {
      "App Version": this.appJson.expo.version,
      "iOS Build": buildNumberIos,
      "Android Build": versionCodeAndroid,
      "Runtime Policy": this.appJson.expo.runtimeVersion?.policy || "fingerprint",
    };
  }
}

// Export for use in other scripts
module.exports = VersionManager;

// Allow direct execution for testing
if (require.main === module) {
  const manager = new VersionManager();
  console.log("\n📱 Current Version Info:");
  console.table(manager.getVersionSummary());
  manager.getRuntimeVersionInfo();
}
