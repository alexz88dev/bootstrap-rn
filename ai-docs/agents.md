# AI Agent Implementation Guide - MyCar Portrait

## Project Overview

**MyCar Portrait** is a premium iOS app that allows users to:

1. Upload a photo of their car
2. Automatically blur license plates and faces for privacy
3. Remove the background using AI
4. Preview their car in a CarPlay widget frame
5. Unlock the widget for iPhone & CarPlay with styles

**Core Value Proposition:** Upload car photo → auto-blur plates → remove background → preview in CarPlay widget → unlock once → get premium widget on iPhone & CarPlay.

## Business Model

- **Unlock (non-consumable): $8.99** → widget + 3 included styles + 100 Credits
- **Credits (consumable):** unlock permanent styles (30 Credits each)
- **Credit Packs:**
  - 40 Credits: $3.99
  - 120 Credits: $9.99
  - 260 Credits: $19.99
  - 520 Credits: $34.99

## Tech Stack Requirements

- **Frontend:** React Native (Expo SDK 54)
- **Backend:** Supabase (Database + Storage + Edge Functions)
- **Package Manager:** Bun (not npm/yarn)
- **Build System:** EAS Build
- **Analytics:** Firebase Analytics + Mixpanel/PostHog
- **IAP Management:** RevenueCat (recommended) or direct StoreKit
- **Image Processing:** AI provider via Supabase Edge Functions
- **Widget:** WidgetKit (SwiftUI) with systemSmall support

## Implementation Tasks

### Phase 1: Backend Setup (Supabase)

#### Task 1.1: Database Schema

Create the following tables with RLS policies:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apple_id_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credits ledger for tracking transactions
CREATE TABLE credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  source TEXT NOT NULL,
  receipt_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Available styles catalog
CREATE TABLE styles (
  style_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  cost INT DEFAULT 30,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User's unlocked styles
CREATE TABLE user_styles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  style_id TEXT REFERENCES styles(style_id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(user_id, style_id)
);

-- User's processed assets
CREATE TABLE assets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  portrait_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rate limiting table
CREATE TABLE processing_limits (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INT DEFAULT 0,
  PRIMARY KEY(user_id, date)
);
```

**RLS Policies Required:**

- Users can only access their own records
- Service role for Edge Functions to manage all tables

#### Task 1.2: Seed Styles Data

Populate the styles table with:

- **Included (free with unlock):** Minimal, Dark Gradient, Asphalt
- **Locked (30 credits each):** Neon, Blueprint, Frosted Glass, Sunset, Carbon Weave, Bokeh Night, Garage Glow, Cinematic Rain, Retro Film

#### Task 1.3: Storage Buckets

Create storage bucket:

- `portraits/` - Public read, write only via Edge Functions
- Store final 1024x1024 PNGs only (< 1MB)

### Phase 2: Edge Functions (Supabase)

#### Task 2.1: processCutout Function

```typescript
// Input: { imageUrl or base64, userId }
// Output: { portrait_url, processingMs }
```

Requirements:

- Detect and blur license plates (priority 1)
- Detect and blur faces if present
- Call AI provider for background removal
- Save final PNG to portraits bucket
- Target P50 < 2.5s, P90 < 5s
- Implement rate limiting (5/day pre-unlock, 10/day post-unlock)

#### Task 2.2: iapGrant Function

```typescript
// Triggered by RevenueCat webhook or client receipt
// Verifies purchase and grants credits/unlock
```

Requirements:

- Validate receipt authenticity
- For unlock_plus_899: Grant 100 credits + mark user as unlocked
- For credit packs: Grant appropriate credits
- Atomic transaction with credits_ledger

#### Task 2.3: creditsSpend Function

```typescript
// Input: { userId, styleId }
// Output: { success, balance_after }
```

Requirements:

- Atomic transaction
- Check balance >= 30
- Deduct credits from ledger
- Add style to user_styles
- Return new balance

### Phase 3: React Native App

#### Task 3.1: Project Setup

- Initialize new Expo project (SDK 54)
- Configure EAS Build profiles
- Set up TypeScript
- Install core dependencies:
  - expo-camera
  - expo-image-picker
  - expo-in-app-purchases
  - @supabase/supabase-js
  - react-native-reanimated
  - expo-notifications

#### Task 3.2: Core Screens

**1. Onboarding Screen**

- "Your car, your CarPlay widget" messaging
- Get Started button
- Privacy disclaimer

**2. Photo Upload Screen**

- Camera/Library picker
- Upload progress indicator
- Error handling for poor quality photos
- Tips: "Best results with ¾ angle, good lighting"

**3. Preview Screen** (Conversion Engine)

- Display cutout in CarPlay widget frame mockup
- Cycle through 3 included styles
- Loading state during processing
- Unlock CTA: "$8.99 - Includes Widget + 3 Styles + 100 Credits"

**4. Paywall Screen**

- Single clean design
- Clear value proposition
- Purchase button
- Restore purchases
- "Not now" option

**5. Style Gallery**

- Credits balance header
- Grid of available styles
- Locked styles show credit cost (30)
- Apply style functionality
- Buy more credits CTA

**6. Widget Setup Guide**

- Step-by-step instructions
- Screenshots
- "I've added it" confirmation

**7. Home Screen**

- Current portrait display
- Change Photo action
- Change Style action
- Credits balance
- Buy Credits button

#### Task 3.3: Supabase Integration

- Authentication (anonymous or Apple Sign In)
- Image upload to Edge Functions
- Credits management
- Style unlocking
- Asset management

#### Task 3.4: IAP Integration

- Configure RevenueCat SDK
- Product IDs:
  - unlock_plus_899
  - credits_40_399
  - credits_120_999
  - credits_260_1999
  - credits_520_3499
- Purchase flow
- Restore purchases
- Receipt validation

#### Task 3.5: Push Notifications

Schedule re-engagement notifications:

- +24h: "Your car portrait is waiting"
- +72h: "Add your car as a widget"
- +7d: "Turn iPhone & CarPlay into your garage"
- Monthly for buyers: "New styles available"

### Phase 4: iOS Native Components

#### Task 4.1: WidgetKit Extension

- SwiftUI widget supporting systemSmall
- Read portrait.png from App Group
- Static snapshot (no animation)
- Works on iPhone lock screen and CarPlay

#### Task 4.2: App Group Configuration

- Configure shared container
- Save portrait.png from React Native
- Read from Widget Extension

### Phase 5: Analytics Implementation

#### Task 5.1: Firebase Analytics Setup

- Initialize SDK
- Configure auto-tracking
- Custom event implementation

#### Task 5.2: Event Tracking

Implement all required events with proper parameters:

1. `open_first` - source, ad_group, keyword
2. `photo_uploaded` - from, file_size_kb, plate_detected
3. `cutout_ready` - latency_ms, mask_confidence
4. `preview_shown` - styles_shown, time_since_open_ms
5. `paywall_shown` - time_since_open_ms
6. `purchase_success` - product_id, price_usd
7. `credits_balance_set` - balance
8. `style_unlocked` - style_id, cost_credits
9. `credits_purchased` - product_id, qty, price_usd
10. `widget_guide_shown`
11. `notification_scheduled/tapped` - type

### Phase 6: App Store Preparation

#### Task 6.1: ASO Content

- App Name: "MyCar Portrait: CarPlay Widget"
- Subtitle: "Your car on iPhone & CarPlay"
- Keywords: carplay,car,widget,photo,background,cutout,portrait,lockscreen
- Description focusing on value proposition
- Localization: EN, RO initially

#### Task 6.2: Store Assets

- Screenshots (iPhone + CarPlay mockups)
- App icon
- Preview video (optional)
- NO OEM logos or brand names
- User photos only

#### Task 6.3: Apple Search Ads

Configure 2 ad groups:

1. CarPlay Widget keywords
2. Photo Cutout keywords

### Phase 7: Testing & QA

#### Critical Test Cases:

1. **Privacy:** Verify plate/face blurring works
2. **Performance:** Test on slow networks
3. **IAP:** Purchase, restore, credit spending
4. **Widget:** Verify CarPlay display
5. **Image Size:** Ensure < 1MB final images
6. **Rate Limiting:** Test daily limits
7. **Credits:** Verify atomic transactions
8. **Notifications:** Test scheduling and tapping

### Phase 8: Launch Preparation

#### Pre-Launch Checklist:

- [ ] Supabase production environment configured
- [ ] Edge Functions deployed and tested
- [ ] IAP products approved by Apple
- [ ] RevenueCat webhook configured
- [ ] Analytics verified (events flowing)
- [ ] Privacy Policy URL active
- [ ] Support URL/email configured
- [ ] ASA campaigns ready
- [ ] Widget tested on real CarPlay

## Success Metrics

### Target KPIs:

- CPC ≤ $0.60
- Tap→Install ≥ 40%
- Install→Purchase ≥ 15%
- Credits spend ≥ 70%
- Top-up attach ≥ 15%
- ARPU D30 ≈ $8.99 + credit revenue
- CPA ≤ $6

### Performance Targets:

- Image processing P50 < 2.5s
- Preview visible < 6s from upload
- Widget image < 1MB
- App size < 50MB

## Compliance Requirements

### Non-Negotiable:

1. **Always blur license plates** before any processing
2. **No OEM logos/renders** in app or store
3. **User photos only** for all media
4. **Privacy-first:** Transient server processing
5. **Safety copy:** "Do not interact while driving"
6. **WidgetKit:** Static snapshots only
7. **CarPlay frame:** Apple-style only, no OEM clones

## Development Guidelines

### Code Quality:

- TypeScript for all JS/TS code
- Swift for iOS native components
- Proper error handling throughout
- Comprehensive logging for debugging
- Unit tests for critical paths
- Integration tests for IAP flow

### Architecture Principles:

- Offline-first where possible
- Optimistic UI updates
- Graceful degradation
- Progressive enhancement
- Accessibility support

### Security:

- No sensitive data in logs
- Secure storage for receipts
- HTTPS only for all requests
- Input validation on all forms
- Rate limiting on all endpoints

## AI Agent Instructions

When implementing any component:

1. **Read First:**

   - This entire agents.md file
   - The business requirements above
   - Any existing code in the project

2. **Follow Standards:**

   - Use Bun (not npm) for package management
   - Use TypeScript with strict mode
   - Follow React Native best practices
   - Implement proper error boundaries

3. **Test Everything:**

   - Manual testing on simulator
   - Edge cases (no network, bad images)
   - IAP sandbox testing
   - Widget on actual device

4. **Document Changes:**

   - Update relevant documentation
   - Add inline code comments
   - Create migration guides if needed

5. **Optimize for Launch:**
   - Performance over features
   - Revenue generation focus
   - User experience polish
   - App Store approval readiness

## Questions to Resolve

Before starting implementation, clarify:

1. Which AI provider for background removal? (SeedDream v4, Remove.bg, etc.)
2. RevenueCat or direct StoreKit implementation?
3. Mixpanel or PostHog for analytics?
4. Specific style background prompts/assets ready?
5. Test devices available for CarPlay testing?

## Next Steps

1. Set up Supabase project with schema
2. Create Edge Functions stubs
3. Initialize React Native project
4. Implement core upload → process → preview flow
5. Add IAP and credits system
6. Build Widget Extension
7. Polish and test
8. Submit to App Store

---

**Remember:** This is a v1 launch focused on proving the concept and generating revenue. Keep scope tight, ship fast, iterate based on data.
