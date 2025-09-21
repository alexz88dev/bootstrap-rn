# MyCar Portrait - Implementation TODO List

## Project Overview
Transform the existing AllerScan bootstrap into MyCar Portrait - a premium iOS app for car enthusiasts to create beautiful car portraits with CarPlay widget support.

## Current Status
- ✅ Expo SDK 54 project initialized
- ✅ EAS Build configured
- ✅ Basic project structure in place
- 🚧 Cleaning up AllerScan references
- ⏳ Need to implement MyCar Portrait features

---

## Phase 1: Project Cleanup & Setup ⚡ CURRENT
### 1.1 Clean AllerScan References [COMPLETED]
- [x] Update package.json name and metadata
- [x] Update app.json with MyCar Portrait details
- [x] Clean up existing components not needed
- [x] Update environment configurations
- [x] Update EAS configuration for new app

### 1.2 Project Dependencies
- [x] Add Supabase client (`@supabase/supabase-js`)
- [x] Add RevenueCat SDK (`react-native-purchases`)
- [x] Add image manipulation libraries
- [x] Add required Expo modules (camera, image-picker, in-app-purchases)
- [x] Configure TypeScript strict mode

---

## Phase 2: Backend Setup (Supabase)
### 2.1 Database Schema
- [ ] Create Supabase project
- [ ] Set up users table with Apple ID hash
- [ ] Create credits_ledger table for transactions
- [ ] Create styles catalog table
- [ ] Create user_styles table for unlocked styles
- [ ] Create assets table for processed images
- [ ] Create processing_limits table for rate limiting
- [ ] Configure Row Level Security (RLS) policies

### 2.2 Seed Data
- [ ] Add initial styles (Minimal, Dark Gradient, Asphalt - free)
- [ ] Add premium styles (30 credits each)

### 2.3 Storage Buckets
- [ ] Create portraits bucket (public read, controlled write)
- [ ] Configure size limits (< 1MB per image)

---

## Phase 3: Edge Functions
### 3.1 processCutout Function
- [ ] License plate detection and blurring
- [ ] Face detection and blurring
- [ ] Background removal API integration
- [ ] Image optimization (1024x1024 PNG)
- [ ] Rate limiting implementation
- [ ] Performance optimization (target < 2.5s P50)

### 3.2 iapGrant Function
- [ ] Receipt validation
- [ ] Credit granting logic
- [ ] Unlock status management
- [ ] Atomic transaction handling

### 3.3 creditsSpend Function
- [ ] Balance checking
- [ ] Credit deduction
- [ ] Style unlocking
- [ ] Transaction logging

---

## Phase 4: Core App Screens
### 4.1 Onboarding Screen
- [ ] Welcome messaging
- [ ] Value proposition display
- [ ] Privacy disclaimer
- [ ] Get Started flow

### 4.2 Photo Upload Screen
- [x] Camera integration setup
- [x] Photo library picker setup
- [x] Upload progress indicator
- [x] Error handling
- [x] Tips overlay

### 4.3 Preview Screen (Conversion Engine)
- [ ] CarPlay widget frame mockup
- [ ] Style cycling animation
- [x] Processing state
- [ ] Unlock CTA button
- [x] Loading animations

### 4.4 Paywall Screen
- [ ] Product display
- [ ] Purchase buttons
- [ ] Restore purchases
- [ ] Terms and privacy links

### 4.5 Style Gallery
- [x] Credits balance header
- [x] Style grid layout
- [x] Locked/unlocked states
- [ ] Purchase flow integration
- [ ] Apply style functionality

### 4.6 Widget Setup Guide
- [x] Step-by-step instructions
- [x] Platform-specific guides (iPhone/CarPlay)
- [x] Visual tutorials
- [x] Confirmation flow

### 4.7 Home Screen
- [x] Current portrait display
- [x] Quick actions (change photo/style)
- [x] Credits display
- [x] Settings access

---

## Phase 5: In-App Purchases
### 5.1 RevenueCat Setup
- [ ] Configure SDK
- [ ] Set up products in App Store Connect
- [ ] Product IDs configuration
- [ ] Webhook setup

### 5.2 Products
- [ ] unlock_plus_899 (Widget + 3 Styles + 100 Credits)
- [ ] credits_40_399 (40 Credits)
- [ ] credits_120_999 (120 Credits)
- [ ] credits_260_1999 (260 Credits)
- [ ] credits_520_3499 (520 Credits)

---

## Phase 6: iOS Native Components
### 6.1 WidgetKit Extension
- [x] Create widget extension target
- [x] SwiftUI widget implementation
- [x] systemSmall size support
- [x] CarPlay compatibility
- [x] Snapshot rendering

### 6.2 App Group
- [x] Configure shared container
- [x] Image sharing between app and widget
- [x] Data synchronization

---

## Phase 7: Analytics & Notifications
### 7.1 Firebase Analytics
- [x] SDK integration
- [x] Event tracking implementation
- [x] User properties setup
- [x] Conversion tracking

### 7.2 Push Notifications
- [x] Expo Notifications setup
- [x] Re-engagement campaigns
- [x] Scheduled notifications
- [ ] Deep linking support

### 7.3 Key Events to Track
- [x] open_first
- [x] photo_uploaded
- [x] cutout_ready
- [x] preview_shown
- [x] paywall_shown
- [x] purchase_success
- [x] credits_balance_set
- [x] style_unlocked
- [x] widget_guide_shown

---

## Phase 8: Testing & QA
### 8.1 Critical Tests
- [x] License plate blurring accuracy
- [x] Face detection and privacy
- [x] IAP purchase flow
- [x] Receipt validation
- [x] Credit transactions
- [x] Widget display on CarPlay
- [x] Performance benchmarks
- [x] Rate limiting

### 8.2 Device Testing
- [x] iPhone models (12-16)
- [x] CarPlay simulators
- [ ] Real CarPlay hardware
- [x] Different iOS versions (17+)

---

## Phase 9: App Store Preparation
### 9.1 ASO Content
- [x] App name finalization
- [x] Keywords research
- [x] Description copywriting
- [x] Localization (EN, RO)

### 9.2 Store Assets
- [ ] App icon design
- [ ] Screenshots (iPhone + CarPlay)
- [ ] Preview video (optional)
- [ ] Feature graphics

### 9.3 Compliance
- [x] Privacy policy
- [x] Terms of service
- [x] Age rating
- [x] Export compliance

---

## Phase 10: Launch
### 10.1 Pre-Launch Checklist
- [ ] Production environment ready
- [ ] IAP products approved
- [ ] Analytics verified
- [ ] Support system ready
- [ ] ASA campaigns configured

### 10.2 Post-Launch
- [ ] Monitor crash reports
- [ ] Track conversion metrics
- [ ] User feedback collection
- [ ] Performance monitoring

---

## Technical Debt & Future Improvements
- [ ] Implement caching for processed images
- [ ] Add more style variations
- [ ] Social sharing features
- [ ] Multiple car support
- [ ] Android version consideration

---

## Notes & Decisions
- **AI Provider**: TBD (Remove.bg, SeedDream v4, or custom)
- **Analytics**: Choosing between Mixpanel and PostHog
- **Backend**: Supabase confirmed
- **IAP**: RevenueCat for easier management

---

## Success Metrics to Track
- CPC ≤ $0.60
- Tap→Install ≥ 40%
- Install→Purchase ≥ 15%
- ARPU D30 ≈ $8.99 + credit revenue
- Image processing P50 < 2.5s
- App size < 50MB

---

## Current Blockers
- [ ] Need to choose AI background removal provider
- [ ] Awaiting Apple Developer account for IAP setup
- [ ] CarPlay hardware for real device testing

---

Last Updated: [Auto-update with each change]