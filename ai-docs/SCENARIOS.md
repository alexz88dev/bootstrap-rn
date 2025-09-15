# 📚 AllerScan Development & Release Scenarios

## Overview

This guide covers all common development and release workflows for the AllerScan app, from initial setup to production deployment. Each scenario includes the exact commands, what happens behind the scenes, and decision points.

## 🎯 Quick Decision Tree

```
What changed?
├── JS/React only
│   ├── Quick fix needed → OTA Update
│   └── New feature → Build Staging → Test → OTA or Build Prod
├── Native modules/Expo SDK
│   ├── Development → Build Dev Client locally
│   └── Release → Build Prod (new runtime, no cache)
└── Assets/Config only
    └── Same as JS (OTA compatible)
```

## 📱 Development Scenarios

### Scenario 1: First-Time Setup (No Dev Client)

**When:** Starting fresh on the project or after a clean install

```bash
bun start
→ Start development server
→ "No dev client found. Build one now?" → Yes
→ iOS/Android → Choose platform
→ Local/Cloud → Choose local for faster iteration
```

**What happens:**
- Builds development client with debug configuration
- Installs on device/simulator
- Starts Metro bundler
- Enables hot reload for JS changes

### Scenario 2: Daily Development (Dev Client Exists)

**When:** Regular development with existing dev client

```bash
bun start
→ Start development server
```

**What happens:**
- Starts Metro bundler
- Connects to existing dev client
- Hot reload enabled for JS changes
- No rebuild needed unless native deps change

### Scenario 3: Testing Native Changes Locally

**When:** Added new native module or changed native configuration

```bash
bun start
→ Build and run locally
→ iOS/Android
→ Development (for dev client)
```

**What happens:**
- Rebuilds native app with changes
- Installs fresh build
- New runtime version if fingerprint changed
- Requires full rebuild (no cache)

## 🧪 Testing Scenarios

### Scenario 4: Testing Release Build (Staging)

**When:** Need to test production-like behavior before release

```bash
bun build
→ Staging
→ Cloud
→ iOS/Android/All
```

**What happens:**
- Creates release build configuration
- Points to development backend
- Build cached if no native changes
- Distributes via internal testing

**Testing flow:**
1. Install staging build on test devices
2. Test all features with dev backend
3. Verify release optimizations work
4. Check performance and bundle size

### Scenario 5: Feature Branch Testing

**When:** Testing specific features with select testers

```bash
bun build
→ Staging
→ Cloud
→ Custom channel? → "feature-xyz"
→ iOS/Android
```

**What happens:**
- Creates build on custom channel
- Only specified testers get updates
- Isolated from main staging channel
- Perfect for A/B testing

## 🚀 Production Release Scenarios

### Scenario 6: Production Release (JS-Only Changes)

**When:** Bug fixes or features with no native changes

```bash
bun build
→ Production
→ Cloud
→ iOS/Android/All
→ "Bump app version?" → Yes
→ Patch (1.0.0 → 1.0.1)
```

**What happens:**
- ✅ **Build CACHED** (same fingerprint)
- ⚡ **Fast build** (~2-5 minutes vs 20-30)
- 💰 **Cost savings** (uses cached artifacts)
- 🚀 **Auto-submits** to App Store/Play Store
- Same runtime version maintained

### Scenario 7: Production Release (Native Changes)

**When:** Updated Expo SDK, added native modules, or changed app.json

```bash
bun build
→ Production
→ Cloud
→ iOS/Android/All
→ "Bump app version?" → Yes
→ Minor (1.0.1 → 1.1.0)
```

**What happens:**
- ❌ **Build NOT cached** (fingerprint changed)
- 🔄 **New runtime version** generated
- 🏗️ **Full native build** required (20-30 min)
- 🚀 **Auto-submits** to stores
- Old app versions can't receive OTA updates

## 📡 OTA Update Scenarios

### Scenario 8: Quick Fix via OTA

**When:** Urgent bug fix that's JS-only

```bash
bun ota
→ Production channel
→ "Publish update?" → Yes
```

**What happens:**
- Builds JS bundle only
- Uploads to EAS Update servers
- All compatible apps receive update
- No app store review needed
- Instant deployment (5-10 minutes)

**Compatibility:**
- ✅ Works if runtime version matches
- ❌ Fails if runtime version differs

### Scenario 9: Staged OTA Rollout

**When:** Want to test updates with subset of users

```bash
# First to staging
bun ota
→ Staging channel
→ "Publish update?" → Yes

# After verification, to production
bun ota
→ Production channel
→ "Publish update?" → Yes
```

### Scenario 10: OTA Rollback

**When:** Published OTA has issues

```bash
bun ota
→ Production channel
→ Rollback to previous
→ Select update to rollback to
→ Confirm
```

**What happens:**
- Reverts to previous update
- Instant fix for all users
- No new build needed

### Scenario 11: Channel-Specific Updates

**When:** Different features for different user groups

```bash
bun ota
→ Custom channel → "beta-testers"
→ "Publish update?" → Yes
```

**Use cases:**
- Beta features
- A/B testing
- Gradual rollouts
- Region-specific features

## 📊 Version Management Scenarios

### Scenario 12: Check Current Versions

**When:** Need to know current version state

```bash
bun version
```

**Shows:**
- App version (user-facing)
- Build numbers (iOS/Android)
- Runtime version policy
- Cache status

### Scenario 13: Major Version Release

**When:** Breaking changes or major redesign

```bash
bun build
→ Production
→ "Bump app version?" → Yes
→ Major (1.1.0 → 2.0.0)
```

**Considerations:**
- Communicate changes to users
- Update app store descriptions
- Plan migration strategy
- Consider forced update mechanism

## 🔍 Build Cache Scenarios

### When Builds ARE Cached

✅ **Cached scenarios:**
- JavaScript/TypeScript changes
- Asset updates (images, fonts)
- Environment variable changes
- Style changes
- Business logic updates

**Example:**
```bash
# First build (no cache)
bun build → Production
# Takes 20-30 minutes, costs ~$2-5

# Second build (JS changes only)
bun build → Production  
# Takes 2-5 minutes, costs ~$0.20-0.50
# Shows: "Using cached build artifacts"
```

### When Builds are NOT Cached

❌ **Not cached scenarios:**
- Expo SDK updates
- Native module additions/updates
- app.json changes (certain fields)
- iOS/Android config changes
- Package updates that affect native code

## 🚨 Emergency Scenarios

### Scenario 14: Critical Production Bug

**Decision flow:**
```
Is it JS-only?
├── Yes → OTA Update (5 min)
└── No → Is it blocking?
    ├── Yes → Emergency build + expedited review
    └── No → Schedule for next release
```

### Scenario 15: Failed App Store Submission

```bash
# Check rejection reason
# Fix issues
bun build
→ Production
→ Don't bump version (resubmit same version)
→ Auto-submit again
```

## 📋 Best Practices

### Daily Development
1. Use dev client for fast iteration
2. Test on real devices regularly
3. Keep dev client updated with native changes

### Before Production
1. Test on staging first
2. Verify on both iOS and Android
3. Check bundle sizes
4. Test offline functionality

### Version Bumping
- **Patch (x.x.1)**: Bug fixes, minor updates
- **Minor (x.1.0)**: New features, native updates
- **Major (1.0.0)**: Breaking changes, redesigns

### OTA Updates
1. Test on staging channel first
2. Monitor crash reports after deployment
3. Have rollback plan ready
4. Communicate major changes

## 🎬 Complete Workflow Example

### Monday: Development
```bash
bun start → Dev server
# Work on new feature
```

### Tuesday: Native Module Added
```bash
bun start → Build locally → Development
# Test with new native module
```

### Wednesday: Staging Test
```bash
bun build → Staging → Cloud
# Share with QA team
```

### Thursday: Bug Fix via OTA
```bash
bun ota → Staging
# QA reports issue fixed
```

### Friday: Production Release
```bash
bun build → Production → Cloud
→ Bump version → Minor (1.0.0 → 1.1.0)
# Auto-submits to stores
# New runtime version due to native module
```

### Next Week: Hotfix
```bash
bun ota → Production
# JS-only fix deployed instantly
# No app store review needed
```

## 📖 Reference

### Command Summary
```bash
bun start   # Dev server or local builds
bun build   # Create installable builds
bun ota     # Push over-the-air updates
bun version # Check version information
```

### Channel Mapping
- `development` → Dev builds only
- `staging` → Testing with dev backend
- `production` → Live users
- `custom-*` → Feature branches

### Backend Mapping
- Development: `http://localhost:3000` (placeholder)
- Production: TBD

### Build Times (Approximate)
- Local dev build: 5-10 minutes
- Cloud build (cached): 2-5 minutes
- Cloud build (no cache): 20-30 minutes
- OTA update: 1-2 minutes

---

For more details, see:
- [GUIDE.md](./GUIDE.md) - Complete development guide
- [QUICK_START.md](./QUICK_START.md) - Quick command reference
- [INDEX.md](./INDEX.md) - Documentation overview
