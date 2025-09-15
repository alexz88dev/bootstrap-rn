#!/usr/bin/env node

/**
 * Version Info Script
 * Run with: bun version
 */

const VersionManager = require("./utils/version-manager");
const { styles } = require("./utils/prompts");

async function showVersionInfo() {
  const manager = new VersionManager();
  
  styles.section("📱 AllerScan Version Information");
  
  // Show current versions
  console.table(manager.getVersionSummary());
  
  // Show runtime version info
  manager.getRuntimeVersionInfo();
  
  // Show build cache info
  console.log(`
🚀 Build Caching Status:
   - Fingerprint-based caching enabled
   - Builds cache when native dependencies unchanged
   - Significantly faster build times for JS-only changes
   - Cache keys: development-cache, staging-cache, production-cache
`);
  
  console.log("\n💡 Run 'bun build' to create a new build with version management");
}

showVersionInfo().catch(console.error);
