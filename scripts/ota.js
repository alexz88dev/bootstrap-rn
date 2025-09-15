#!/usr/bin/env node

// Clean interactive script for EAS Updates (OTA)

const { spawn } = require("child_process");
const { prompts, styles, environments, confirmProduction } = require("./utils/prompts");

async function interactiveUpdate() {
  styles.section("📡 Over-The-Air Update");

  try {
    // Step 1: Choose environment
    const { environment } = await prompts({
      type: "select",
      name: "environment",
      message: "Target environment?",
      choices: [
        environments.development,
        environments.staging,
        { ...environments.production, description: "⚠️  Live users" },
      ],
      initial: 0,
    });

    if (!environment) {
      styles.info("Update cancelled");
      return;
    }

    // Step 2: Enter message
    const { message } = await prompts({
      type: "text",
      name: "message",
      message: "Update message (describe what changed):",
      validate: (value) => 
        value.length < 3 ? "Message must be at least 3 characters" : true,
    });

    if (!message) return;

    // Step 3: Production confirmation
    if (environment === "production") {
      const { confirmProd } = await prompts(confirmProduction);
      
      if (!confirmProd) {
        styles.info("Production update cancelled for safety");
        return;
      }
    }

    // Show summary
    styles.summary({
      Environment: environment,
      Message: message,
      Impact: environment === "production" ? "⚠️  LIVE USERS" : "Internal testing",
    });

    // Final confirmation
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: environment === "production" 
        ? "⚠️  Ready to update PRODUCTION?" 
        : "Ready to publish update?",
      initial: true,
    });

    if (!confirm) {
      styles.info("Update cancelled");
      return;
    }

    // Build command
    const command = "eas update";
    const args = ["--branch", environment, "--message", message];

    // Execute
    console.log(`\n🔨 Executing: ${command} --branch ${environment} --message "${message}"\n`);

    const child = spawn("bunx", [command, ...args], {
      stdio: "inherit",
      shell: true,
    });

    child.on("error", (error) => {
      styles.error(`Failed to publish update: ${error.message}`);
      process.exit(1);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        styles.error(`Update failed with code ${code}`);
        process.exit(code);
      }

      styles.success(`Update published to ${environment}!`);
      
      if (environment === "production") {
        console.log("\n🎉 Production users will receive the update automatically");
        console.log("📊 Monitor rollout at: https://expo.dev\n");
      } else {
        console.log(`\n✅ ${environment} builds will receive the update on next app launch\n`);
      }
    });
  } catch (error) {
    if (error.message) {
      styles.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Handle CTRL+C gracefully
process.on("SIGINT", () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

// Run the script
interactiveUpdate();
