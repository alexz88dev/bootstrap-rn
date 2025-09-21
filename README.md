# MyCar Portrait - CarPlay Widget App

## 🚗 Overview
MyCar Portrait is a premium iOS app that transforms your car photos into beautiful portraits with automatic background removal and privacy protection. Display your car as a widget on your iPhone lock screen and CarPlay dashboard.

## ✨ Key Features
- 📸 **Smart Photo Processing**: Automatic license plate and face blurring for privacy
- 🎨 **AI Background Removal**: Clean cutouts of your car with professional quality
- 🖼️ **CarPlay Widget**: Display your car portrait on iPhone and CarPlay
- 🎭 **Premium Styles**: Unlock various artistic backgrounds and effects
- 💳 **Credit System**: Flexible purchasing options for additional styles

## 🛠️ Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Backend**: Supabase (Database + Storage + Edge Functions)
- **Build System**: EAS Build
- **Package Manager**: Bun
- **IAP**: RevenueCat
- **Analytics**: Firebase Analytics
- **Native**: WidgetKit (iOS)

## 📱 Development Setup

### Prerequisites
- Node.js 18+
- Bun package manager
- Expo CLI
- EAS CLI
- iOS Simulator (for local testing)
- Apple Developer Account (for device testing)

### Installation
```bash
# Install dependencies
bun install

# Start development server
bun start

# Build for testing
bun build
```

## 🏗️ Project Structure
```
mycar-portrait/
├── app/                    # Expo Router screens
├── components/             # Reusable React components
├── config/                 # Environment configurations
├── scripts/               # Build and deployment scripts
├── ai-docs/               # AI agent documentation
├── TODO.md               # Implementation tracking
└── ios/                  # Native iOS code (widget extension)
```

## 📋 Implementation Status

See [TODO.md](./TODO.md) for detailed implementation tracking.

### Current Phase: Project Setup & Cleanup
- ✅ Project initialized with Expo SDK 54
- ✅ EAS Build configured
- 🚧 Cleaning up legacy code
- ⏳ Setting up Supabase backend

## 💰 Business Model
- **Unlock**: $8.99 (Widget + 3 Styles + 100 Credits)
- **Credits**: Used to unlock additional styles (30 credits each)
- **Credit Packs**: Various sizes from $3.99 to $34.99

## 🎯 Target Metrics
- CPC ≤ $0.60
- Install→Purchase ≥ 15%
- Image processing < 2.5s
- App size < 50MB

## 📝 Commands

### Development
```bash
bun start       # Start dev server or local build
bun build       # Create EAS builds
bun ota         # Push OTA updates
bun version     # Check version info
```

### Build Profiles
- `development`: Debug build with dev backend
- `staging`: Release build with dev backend
- `production`: Release build with production backend

## 🔐 Environment Variables

Required environment variables for each environment:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `REVENUECAT_API_KEY`: RevenueCat API key
- `AI_PROVIDER_KEY`: Background removal API key

## 🧪 Testing

### Key Test Areas
1. **Privacy**: License plate and face blurring
2. **Performance**: Image processing speed
3. **IAP**: Purchase and restore flows
4. **Widget**: CarPlay compatibility
5. **Credits**: Transaction integrity

## 📱 App Store Information

- **Name**: MyCar Portrait: CarPlay Widget
- **Category**: Lifestyle / Photo & Video
- **Age Rating**: 4+
- **Languages**: English, Romanian (initial)

## 🚀 Deployment

### Staging Build
```bash
bun build
# Select: Staging → Cloud
```

### Production Release
```bash
bun build
# Select: Production → Cloud
# Will prompt for version bump
```

### OTA Update
```bash
bun ota
# Select environment and channel
```

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📚 Documentation

- [Implementation Guide](./ai-docs/agents.md)
- [TODO List](./TODO.md)
- [Quick Start](./ai-docs/QUICK_START.md)
- [Build Guide](./ai-docs/GUIDE.md)

---

**Current Status**: 🚧 Active Development - Phase 1: Project Setup