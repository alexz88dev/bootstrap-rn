// Shared prompt configurations and utilities

const prompts = require("prompts");

// Visual styling for prompts
const styles = {
  section: (title) => console.log(`\n${title}\n`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  summary: (config) => {
    console.log("\n📋 Configuration Summary:");
    Object.entries(config).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log("");
  },
};

// Common prompt configurations
const confirmProduction = {
  type: "confirm",
  name: "confirmProd",
  message: "⚠️  This will affect PRODUCTION users. Are you sure?",
  initial: false,
};

const platforms = {
  all: { title: "📱 All platforms", value: "all" },
  ios: { title: "🍎 iOS", value: "ios" },
  android: { title: "🤖 Android", value: "android" },
  web: { title: "🌐 Web", value: "web" },
};

const environments = {
  development: { title: "🛠️  Development", value: "development" },
  staging: { title: "🧪 Staging", value: "staging" },
  production: { title: "🚀 Production", value: "production" },
};

const buildProfiles = {
  development: {
    title: "🛠️  Development",
    value: "development",
    description: "Dev client with debug features",
  },
  staging: {
    title: "🧪 Staging",
    value: "staging",
    description: "Release build with dev backend",
  },
  production: {
    title: "🚀 Production",
    value: "production",
    description: "Store-ready build",
  },
};

module.exports = {
  prompts,
  styles,
  confirmProduction,
  platforms,
  environments,
  buildProfiles,
};
