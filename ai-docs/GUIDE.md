# AllerScan Development Guide

## 🎯 Just 3 Commands

```bash
bun start  # Start dev server OR build & run locally
bun build  # Create EAS builds (local or cloud)
bun ota    # Push over-the-air updates
```

That's it. Everything you need is in these 3 interactive commands.

## 📱 `bun start` - Everything Starts Here

### What it does

Combines development server and local builds in one command:

- **Start Dev Server** → Connect to Expo Go, Dev Client, or Web
- **Build & Run Locally** → Build and run on device/simulator (2-5 min)

### Common Workflows

#### Quick Development

```bash
bun start
→ Start Dev Server
→ Expo Go
→ All platforms
→ Start coding!
```

#### Test Native Features

```bash
bun start
→ Build & Run Locally
→ iOS/Android
→ Debug
→ Development
→ Simulator
```

## 🏗️ `bun build` - Create Builds

### What it does

Creates installable builds using EAS:

- Choose profile (Development/Staging/Production)
- Choose location (Cloud or Local)
- Choose platform (iOS/Android/Both)
- Optional auto-submit for production

### Common Workflows

#### Development Build

```bash
bun build
→ Development
→ Cloud/Local
→ Platform
→ Creates dev client build
```

#### Production Release

```bash
bun build
→ Production
→ Cloud (always)
→ Both platforms
→ Auto-submit? Yes
```

## 📡 `bun ota` - Over-The-Air Updates

### What it does

Push JavaScript updates to existing apps without rebuilding:

- Choose environment (Development/Staging/Production)
- Enter update message
- Confirm (extra safety for production)

### Common Workflows

#### Quick Fix

```bash
bun ota
→ Development
→ "Fixed navigation bug"
→ Publish
```

#### Production Hotfix

```bash
bun ota
→ Production ⚠️
→ "Critical login fix"
→ Confirm production update
```

## 🔄 Complete Development Flow

### 1. Starting a Feature

```bash
bun start → Start Dev Server → Expo Go
# Quick iteration with hot reload
```

### 2. Adding Native Code

```bash
bun start → Build & Run Locally → iOS → Debug
# Test native features directly
```

### 3. Sharing with Team

```bash
bun build → Staging → Cloud → Share link
# Team can download and test
```

### 4. Production Release

```bash
bun build → Production → Both → Auto-submit
# Goes to app stores
```

### 5. Emergency Fix

```bash
bun ota → Production → "Fix description"
# Updates live apps immediately
```

## 🛠️ Utility Commands

```bash
bun clean    # Clean all caches and builds
bun reset    # Reset project to template
bun lint     # Check code quality
bun ios      # Direct iOS build (no prompts)
bun android  # Direct Android build (no prompts)
```

## 💡 Tips

- **Start with `bun start`** - It handles both server and local builds
- **Use Cloud builds** for sharing, Local builds for speed
- **Test OTA updates** in development before production
- **Everything is interactive** - just follow the prompts

---

Simple. Clean. Powerful. Just 3 commands for everything! 🚀
