// Check prerequisites for various build types

const { execSync } = require("child_process");
const fs = require("fs");

function checkXcodeInstalled() {
  try {
    execSync("xcodebuild -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkAndroidStudioInstalled() {
  try {
    const androidHome = process.env.ANDROID_HOME;
    if (!androidHome) return false;
    return fs.existsSync(androidHome);
  } catch {
    return false;
  }
}

function checkEASInstalled() {
  try {
    execSync("bunx eas --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkPlatformRequirements(platform) {
  const requirements = [];
  
  if (platform === "ios") {
    if (!checkXcodeInstalled()) {
      requirements.push("Xcode is not installed");
    }
  }
  
  if (platform === "android") {
    if (!checkAndroidStudioInstalled()) {
      requirements.push("Android Studio/SDK is not configured");
    }
  }
  
  return requirements;
}

module.exports = {
  checkXcodeInstalled,
  checkAndroidStudioInstalled,
  checkEASInstalled,
  checkPlatformRequirements,
};
