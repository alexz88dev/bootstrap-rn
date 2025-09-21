#!/usr/bin/env node

// Clean interactive script for EAS builds

const { spawn } = require("child_process");
const {
  prompts,
  styles,
  buildProfiles,
  platforms,
} = require("./utils/prompts");
const { checkEASInstalled } = require("./utils/prerequisites");
const VersionManager = require("./utils/version-manager");

async function interactiveBuild() {
  styles.section("🏗️  EAS Build");

  try {
    // Check EAS CLI
    if (!checkEASInstalled()) {
      styles.warning("EAS CLI not found. Installing...");
      // Will be installed via bunx automatically
    }

    // Step 1: Choose profile
    const { profile } = await prompts({
      type: "select",
      name: "profile",
      message: "Build profile?",
      choices: Object.values(buildProfiles),
      initial: 0,
    });

    if (!profile) {
      styles.info("Build cancelled");
      return;
    }

    // Step 2: Choose location (not for production)
    let location = "cloud";
    if (profile !== "production") {
      const response = await prompts({
        type: "select",
        name: "location",
        message: "Build location?",
        choices: [
          {
            title: "☁️  Cloud (EAS)",
            value: "cloud",
            description: "Consistent, shareable builds",
          },
          {
            title: "💻 Local Machine",
            value: "local",
            description: "Faster, requires local setup",
          },
        ],
        initial: 0,
      });
      location = response.location || "cloud";
    }

    // Step 2.5: Custom channel for staging (optional)
    let customChannel = null;
    if (profile === "staging") {
      const { useCustomChannel } = await prompts({
        type: "confirm",
        name: "useCustomChannel",
        message: "Use a custom channel? (for feature branches/A-B testing)",
        initial: false,
      });

      if (useCustomChannel) {
        const { channel } = await prompts({
          type: "text",
          name: "channel",
          message: "Enter custom channel name:",
          initial: "feature-",
          validate: (value) =>
            value.length < 2
              ? "Channel name must be at least 2 characters"
              : true,
        });
        customChannel = channel;
      }
    }

    // Step 3: Choose platform
    const { platform } = await prompts({
      type: "select",
      name: "platform",
      message: "Platform?",
      choices: [
        { title: "📱 Both iOS and Android", value: "all" },
        { title: "🍎 iOS only", value: "ios" },
        { title: "🤖 Android only", value: "android" },
      ],
      initial: 0,
    });

    if (!platform) return;

    // Version management for staging and production builds
    const versionManager = new VersionManager();
    if (profile === "staging" || profile === "production") {
      await versionManager.checkVersionBump(profile);
    }

    // Note: Production builds will auto-submit to app stores (configured in eas.json)

    // Show summary
    const summaryData = {
      Profile: profile,
      Location: location === "local" ? "Local Machine" : "EAS Cloud",
      Platform: platform === "all" ? "iOS + Android" : platform,
    };

    if (customChannel) {
      summaryData["Channel"] = customChannel;
    }

    if (
      (profile === "staging" || profile === "production") &&
      location === "cloud"
    ) {
      summaryData["Auto-submit"] = "Yes (after build)";
    }

    styles.summary(summaryData);

    // Confirm
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message:
        profile === "production"
          ? "⚠️  Ready to create PRODUCTION build?"
          : "Ready to build?",
      initial: true,
    });

    if (!confirm) {
      styles.info("Build cancelled");
      return;
    }

    // Build command
    const command = "eas build";
    const args = ["--profile", profile];

    if (location === "local") {
      args.push("--local");
    }

    if (platform !== "all") {
      args.push("--platform", platform);
    } else {
      args.push("--platform", "all");
    }

    // Add custom channel if specified
    if (customChannel) {
      args.push("--channel", customChannel);
    }

    // Add auto-submit flag for staging and production cloud builds
    if (
      (profile === "staging" || profile === "production") &&
      location === "cloud"
    ) {
      args.push("--auto-submit");
    }

    // Execute build
    console.log(`\n🔨 Executing: ${command} ${args.join(" ")}\n`);

    const child = spawn("bunx", [command, ...args], {
      stdio: "inherit",
      shell: true,
    });

    child.on("error", (error) => {
      styles.error(`Failed to build: ${error.message}`);
      process.exit(1);
    });

    child.on("close", async (code) => {
      if (code !== 0) {
        styles.error(`Build failed with code ${code}`);
        process.exit(code);
      }

      styles.success("Build completed!");

      if (
        (profile === "staging" || profile === "production") &&
        location === "cloud"
      ) {
        console.log(
          "\n📤 Build will be auto-submitted to app stores (if configured)\n"
        );
        console.log("📊 Check submission status at: https://expo.dev\n");
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
interactiveBuild();
