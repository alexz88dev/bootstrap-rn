#!/usr/bin/env node

// Unified start script - handles both dev server and local builds

const { spawn } = require("child_process");
const { prompts, styles, platforms, environments } = require("./utils/prompts");
const { checkPlatformRequirements } = require("./utils/prerequisites");

async function unifiedStart() {
  styles.section("🚀 Start Development");

  try {
    // Step 1: Choose what to do
    const { action } = await prompts({
      type: "select",
      name: "action",
      message: "What would you like to do?",
      choices: [
        {
          title: "📱 Start Dev Server",
          value: "server",
          description: "Connect to Expo Go or Dev Client",
        },
        {
          title: "🔨 Build & Run Locally",
          value: "build",
          description: "Build and run on device/simulator",
        },
      ],
      initial: 0,
    });

    if (!action) {
      styles.info("Cancelled");
      return;
    }

    if (action === "server") {
      await startDevServer();
    } else {
      await buildAndRun();
    }
  } catch (error) {
    if (error.message) {
      styles.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

async function startDevServer() {
  // Choose client type
  const { clientType } = await prompts({
    type: "select",
    name: "clientType",
    message: "How would you like to connect?",
    choices: [
      {
        title: "📱 Expo Go",
        value: "expo",
        description: "Standard client, no build required",
      },
      {
        title: "🛠️  Development Client",
        value: "dev-client",
        description: "Custom build with native modules",
      },
      {
        title: "🌐 Web Browser",
        value: "web",
        description: "Run in browser",
      },
    ],
    initial: 0,
  });

  if (!clientType) return;

  // Choose platform (not for web)
  let platform = "all";
  if (clientType !== "web") {
    const response = await prompts({
      type: "select",
      name: "platform",
      message: "Which platform?",
      choices: [
        platforms.all,
        platforms.ios,
        platforms.android,
      ],
      initial: 0,
    });
    platform = response.platform || "all";
  }

  // Clear cache option
  const { clearCache } = await prompts({
    type: "confirm",
    name: "clearCache",
    message: "Clear cache?",
    initial: false,
  });

  // Build command
  let command = "expo start";
  const args = [];

  if (clientType === "dev-client") {
    args.push("--dev-client");
  } else if (clientType === "web") {
    args.push("--web");
  }

  if (platform !== "all" && clientType !== "web") {
    args.push(`--${platform}`);
  }

  if (clearCache) {
    args.push("--clear");
  }

  // Execute
  console.log(`\n🔨 Executing: ${command} ${args.join(" ")}\n`);

  const child = spawn("bunx", [command, ...args], {
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (error) => {
    styles.error(`Failed to start: ${error.message}`);
    process.exit(1);
  });
}

async function buildAndRun() {
  // Choose platform
  const { platform } = await prompts({
    type: "select",
    name: "platform",
    message: "Which platform?",
    choices: [
      { ...platforms.ios, description: "Requires Xcode" },
      { ...platforms.android, description: "Requires Android Studio" },
    ],
    initial: 0,
  });

  if (!platform) return;

  // Check prerequisites
  const issues = checkPlatformRequirements(platform);
  if (issues.length > 0) {
    styles.error("Prerequisites missing:");
    issues.forEach((issue) => console.log(`  - ${issue}`));
    
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      message: "Try anyway?",
      initial: false,
    });
    
    if (!proceed) return;
  }

  // Choose variant
  const { variant } = await prompts({
    type: "select",
    name: "variant",
    message: "Build variant?",
    choices: [
      {
        title: "🐛 Debug",
        value: "debug",
        description: "Development build with debugging",
      },
      {
        title: "🚀 Release",
        value: "release",
        description: "Optimized build without debugging",
      },
    ],
    initial: 0,
  });

  if (!variant) return;

  // Choose environment
  const { environment } = await prompts({
    type: "select",
    name: "environment",
    message: "Environment?",
    choices: Object.values(environments),
    initial: 0,
  });

  if (!environment) return;

  // Choose device
  const { device } = await prompts({
    type: "select",
    name: "device",
    message: "Where to run?",
    choices: [
      {
        title: platform === "ios" ? "📱 iOS Simulator" : "📱 Android Emulator",
        value: "simulator",
      },
      {
        title: "📲 Physical Device",
        value: "device",
        description: "Device must be connected",
      },
    ],
    initial: 0,
  });

  if (!device) return;

  // Summary
  styles.summary({
    Platform: platform,
    Variant: variant,
    Environment: environment,
    Device: device === "simulator" ? "Simulator/Emulator" : "Physical Device",
  });

  // Confirm
  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: "Ready to build and run?",
    initial: true,
  });

  if (!confirm) return;

  // Build command
  const command = `expo run:${platform}`;
  const args = [];
  
  if (variant === "release") {
    args.push("--variant", "release");
  }
  
  if (device === "device") {
    args.push("--device");
  }

  // Execute
  console.log(`\n🔨 Executing: ${command} ${args.join(" ")}`);
  console.log(`📍 Environment: APP_ENV=${environment}\n`);

  const child = spawn("bunx", [command, ...args], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      APP_ENV: environment,
    },
  });

  child.on("error", (error) => {
    styles.error(`Failed to run: ${error.message}`);
    process.exit(1);
  });

  child.on("close", (code) => {
    if (code !== 0) {
      styles.error(`Build failed with code ${code}`);
      process.exit(code);
    }
    styles.success("Build and run completed!");
  });
}

// Handle CTRL+C gracefully
process.on("SIGINT", () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

// Run the script
unifiedStart();