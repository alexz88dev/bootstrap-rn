#!/usr/bin/env node

// Enhanced OTA script with rollback and custom channel support

const { spawn } = require("child_process");
const {
  prompts,
  styles,
  environments,
  confirmProduction,
} = require("./utils/prompts");

async function interactiveUpdate() {
  styles.section("📡 Over-The-Air Update");

  try {
    // Step 1: Choose action
    const { action } = await prompts({
      type: "select",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { title: "📤 Publish new update", value: "publish" },
        { title: "↩️  Rollback to previous update", value: "rollback" },
        { title: "📊 View update history", value: "history" },
      ],
      initial: 0,
    });

    if (!action) {
      styles.info("Update cancelled");
      return;
    }

    if (action === "history") {
      await viewUpdateHistory();
      return;
    }

    // Step 2: Choose channel
    const { channel } = await prompts({
      type: "select",
      name: "channel",
      message: "Select update channel:",
      choices: [
        {
          title: "🛠️  Development",
          value: "development",
          description: "Dev builds with debug features",
        },
        {
          title: "🧪 Staging",
          value: "staging",
          description: "Testing release builds",
        },
        {
          title: "🚀 Production",
          value: "production",
          description: "⚠️  Live users - be careful!",
        },
        {
          title: "🎯 Custom Channel...",
          value: "custom",
          description: "Feature branches, A/B tests, beta groups",
        },
      ],
      initial: 1, // Default to staging (safer than production)
    });

    let finalChannel = channel;

    // If custom channel selected, get the channel name
    if (channel === "custom") {
      console.log("\n💡 Custom channels are useful for:");
      console.log("  • Feature branches (feature-payment, feature-auth)");
      console.log("  • A/B testing (experiment-v2, new-ui-test)");
      console.log("  • Beta testing groups (beta-testers, early-access)");
      console.log("  • Regional rollouts (us-west, eu-central)");
      console.log("  • Gradual rollouts (10-percent, 50-percent)\n");

      const { customChannel } = await prompts({
        type: "text",
        name: "customChannel",
        message: "Enter custom channel name:",
        initial: "feature-",
        validate: (value) =>
          value.length < 2
            ? "Channel name must be at least 2 characters"
            : true,
      });

      if (!customChannel) {
        styles.info("Update cancelled");
        return;
      }

      finalChannel = customChannel;
    }

    if (!finalChannel) {
      styles.info("Update cancelled");
      return;
    }

    if (action === "rollback") {
      await handleRollback(finalChannel);
    } else {
      await handlePublish(finalChannel);
    }
  } catch (error) {
    if (error.message) {
      styles.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

async function handlePublish(channel) {
  // Enter message
  const { message } = await prompts({
    type: "text",
    name: "message",
    message: "Update message (describe what changed):",
    validate: (value) =>
      value.length < 3 ? "Message must be at least 3 characters" : true,
  });

  if (!message) return;

  // Production confirmation
  if (channel === "production") {
    const { confirmProd } = await prompts(confirmProduction);

    if (!confirmProd) {
      styles.info("Production update cancelled for safety");
      return;
    }
  }

  // Show summary
  styles.summary({
    Action: "Publish Update",
    Channel: channel,
    Message: message,
    Impact:
      channel === "production"
        ? "⚠️  LIVE USERS"
        : channel === "staging"
        ? "Internal testing"
        : `Custom: ${channel}`,
  });

  // Final confirmation
  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message:
      channel === "production"
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
  const args = ["--branch", channel, "--message", message];

  // Execute
  console.log(
    `\n🔨 Executing: ${command} --branch ${channel} --message "${message}"\n`
  );

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

    styles.success(`Update published to ${channel}!`);

    if (channel === "production") {
      console.log(
        "\n🎉 Production users will receive the update automatically"
      );
      console.log("📊 Monitor rollout at: https://expo.dev\n");
    } else {
      console.log(
        `\n✅ ${channel} builds will receive the update on next app launch\n`
      );
    }
  });
}

async function handleRollback(channel) {
  console.log(`\n🔍 Fetching update history for channel: ${channel}...\n`);

  // First, get the list of updates
  const listChild = spawn(
    "bunx",
    ["eas", "update:list", "--branch", channel, "--json"],
    {
      shell: true,
    }
  );

  let output = "";
  listChild.stdout.on("data", (data) => {
    output += data.toString();
  });

  listChild.on("close", async (code) => {
    if (code !== 0) {
      styles.error("Failed to fetch update history");
      return;
    }

    try {
      const updates = JSON.parse(output);

      if (!updates || updates.length === 0) {
        styles.warning("No updates found for this channel");
        return;
      }

      // Show recent updates
      const choices = updates.slice(0, 10).map((update, index) => ({
        title: `${update.message || "No message"} (${new Date(
          update.createdAt
        ).toLocaleString()})`,
        value: update.id,
        description: `ID: ${update.id.substring(0, 8)}...`,
        disabled: index === 0 ? "(current)" : false,
      }));

      const { updateId } = await prompts({
        type: "select",
        name: "updateId",
        message: "Select update to rollback to:",
        choices,
      });

      if (!updateId) {
        styles.info("Rollback cancelled");
        return;
      }

      // Confirm rollback
      const { confirmRollback } = await prompts({
        type: "confirm",
        name: "confirmRollback",
        message:
          channel === "production"
            ? "⚠️  Confirm PRODUCTION rollback?"
            : "Confirm rollback?",
        initial: false,
      });

      if (!confirmRollback) {
        styles.info("Rollback cancelled");
        return;
      }

      // Execute rollback
      console.log(`\n↩️  Rolling back to update: ${updateId}\n`);

      const rollbackChild = spawn(
        "bunx",
        [
          "eas",
          "update",
          "--branch",
          channel,
          "--republish",
          "--update-id",
          updateId,
        ],
        {
          stdio: "inherit",
          shell: true,
        }
      );

      rollbackChild.on("close", (code) => {
        if (code === 0) {
          styles.success("Rollback successful!");
          console.log(`\n✅ ${channel} has been rolled back\n`);
        } else {
          styles.error("Rollback failed");
        }
      });
    } catch (error) {
      styles.error("Failed to parse update history");
      console.error(error);
    }
  });
}

async function viewUpdateHistory() {
  const { channel } = await prompts({
    type: "text",
    name: "channel",
    message: "Enter channel name to view history:",
    initial: "production",
  });

  if (!channel) return;

  console.log(`\n📊 Fetching history for channel: ${channel}...\n`);

  const child = spawn("bunx", ["eas", "update:list", "--branch", channel], {
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log("\n✅ History displayed above\n");
    }
  });
}

// Handle CTRL+C gracefully
process.on("SIGINT", () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

// Run the script
interactiveUpdate();
