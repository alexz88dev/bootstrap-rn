# MyCar Portrait - Testing Checklist

## 1. Privacy & Security Testing ✅ CRITICAL

### License Plate Detection
- [ ] Test with various license plate formats (US, EU, custom)
- [ ] Test with multiple plates in one image
- [ ] Test with partially visible plates
- [ ] Test with decorative/vanity plates
- [ ] Verify blur is applied before any processing
- [ ] Verify blur cannot be reversed

### Face Detection
- [ ] Test with driver/passenger visible
- [ ] Test with people in background
- [ ] Test with reflections showing faces
- [ ] Verify all faces are blurred

### Data Security
- [ ] Verify original images deleted from server after processing
- [ ] Test account deletion removes all user data
- [ ] Verify no PII in analytics
- [ ] Check secure API communications (HTTPS only)
- [ ] Test data encryption at rest

## 2. Image Processing Pipeline

### Upload Flow
- [ ] Camera capture (portrait/landscape)
- [ ] Gallery selection
- [ ] File size limits (< 10MB)
- [ ] Supported formats (JPEG, PNG, HEIF)
- [ ] Network interruption handling
- [ ] Upload progress accuracy

### Processing Quality
- [ ] Background removal accuracy (90%+ target)
- [ ] Edge detection quality
- [ ] Transparency handling
- [ ] Color preservation
- [ ] Shadow/reflection handling
- [ ] Multiple car colors (white, black, metallic)

### Performance Benchmarks
- [ ] Processing time < 3s (P50)
- [ ] Processing time < 5s (P90)
- [ ] Widget update < 1s
- [ ] App launch < 2s
- [ ] Screen transitions smooth (60fps)

## 3. In-App Purchases

### Purchase Flow
- [ ] Unlock purchase ($8.99)
- [ ] Each credit pack tier
- [ ] Purchase restoration
- [ ] Receipt validation
- [ ] Network error handling
- [ ] Sandbox testing
- [ ] Production testing

### Credit System
- [ ] Credit balance updates
- [ ] Credit spending (30 per style)
- [ ] Insufficient credits handling
- [ ] Credit grant on unlock (100 credits)
- [ ] Transaction history

### RevenueCat Integration
- [ ] User identification
- [ ] Purchase events
- [ ] Subscription status (should be none)
- [ ] Webhook handling

## 4. Widget Testing

### iOS Widget
- [ ] Small size display
- [ ] Medium size display
- [ ] Widget gallery preview
- [ ] Home screen placement
- [ ] Lock screen display (iOS 16+)
- [ ] Widget refresh on image update
- [ ] Dark mode support

### CarPlay
- [ ] Widget display on CarPlay home
- [ ] Image quality on CarPlay
- [ ] Update sync between phone and CarPlay
- [ ] Different CarPlay screen sizes
- [ ] Wireless CarPlay compatibility

### Widget Data
- [ ] App group data sharing
- [ ] Image caching
- [ ] Memory usage < 30MB
- [ ] Offline functionality

## 5. User Interface

### Onboarding
- [ ] First launch experience
- [ ] Skip functionality
- [ ] Privacy disclosure display
- [ ] Smooth transitions

### Core Screens
- [ ] Home screen layout (all states)
- [ ] Upload screen (camera/gallery)
- [ ] Processing animation
- [ ] Preview screen with styles
- [ ] Gallery grid performance
- [ ] Settings menu

### Paywall
- [ ] Price display accuracy
- [ ] Feature list clarity
- [ ] Purchase button functionality
- [ ] Restore button
- [ ] Close/dismiss behavior

### Accessibility
- [ ] VoiceOver support
- [ ] Dynamic type support
- [ ] Color contrast (WCAG AA)
- [ ] Tap target sizes (44x44 minimum)
- [ ] Keyboard navigation

## 6. Device Compatibility

### iPhone Models
- [ ] iPhone 12 series
- [ ] iPhone 13 series
- [ ] iPhone 14 series
- [ ] iPhone 15 series
- [ ] iPhone 16 series
- [ ] iPhone SE (3rd gen)

### iOS Versions
- [ ] iOS 17.0
- [ ] iOS 17.5
- [ ] iOS 18.0
- [ ] iOS 18.1+

### Orientations
- [ ] Portrait mode (primary)
- [ ] Landscape (where applicable)
- [ ] Rotation handling

## 7. Analytics & Tracking

### Event Firing
- [ ] App open events
- [ ] Photo upload tracking
- [ ] Processing complete events
- [ ] Purchase events
- [ ] Style unlock events
- [ ] Widget setup tracking

### User Properties
- [ ] Credits balance updates
- [ ] Unlock status
- [ ] Styles owned count
- [ ] App version tracking

## 8. Push Notifications

### Permission Flow
- [ ] Permission request timing
- [ ] Permission denial handling
- [ ] Settings deep link

### Notification Types
- [ ] Processing complete
- [ ] Purchase confirmation
- [ ] Low credits warning
- [ ] Re-engagement (24h, 72h, 7d)

### Delivery
- [ ] Foreground handling
- [ ] Background delivery
- [ ] Notification tap actions

## 9. Error Handling

### Network Errors
- [ ] No internet connection
- [ ] Slow connection (timeout)
- [ ] API failures
- [ ] Retry mechanisms

### Processing Errors
- [ ] Invalid image format
- [ ] Corrupted image
- [ ] Server processing failure
- [ ] Rate limit exceeded

### User Feedback
- [ ] Error messages clarity
- [ ] Recovery actions available
- [ ] Support contact option

## 10. Performance Testing

### Memory Management
- [ ] Memory leaks check
- [ ] Image cache limits
- [ ] Background memory usage
- [ ] Widget memory usage

### Battery Usage
- [ ] Processing impact
- [ ] Background refresh
- [ ] Widget update frequency

### Storage
- [ ] Cache cleanup
- [ ] Image compression
- [ ] Storage warnings

## 11. Edge Cases

### Unusual Images
- [ ] Multiple cars in one image
- [ ] Toy cars/models
- [ ] Car drawings/artwork
- [ ] Non-car vehicles
- [ ] Very dark/bright images

### Account States
- [ ] New user flow
- [ ] Returning user
- [ ] User with 0 credits
- [ ] User with many styles
- [ ] Deleted account recovery

## 12. App Store Compliance

### Metadata
- [ ] Screenshots accuracy
- [ ] Description accuracy
- [ ] Age rating appropriate
- [ ] Keywords relevant

### Guidelines
- [ ] No copyright infringement
- [ ] Privacy compliance
- [ ] IAP guidelines followed
- [ ] No car brand logos shown

## 13. Localization

### Languages
- [ ] English (US) - Primary
- [ ] Romanian - Secondary
- [ ] Text truncation
- [ ] Date/time formats
- [ ] Currency display

## 14. Integration Testing

### End-to-End Flows
- [ ] New user: Onboard → Upload → Process → Preview → Purchase → Widget
- [ ] Returning user: Open → Gallery → Change style → Update widget
- [ ] Purchase flow: Paywall → Purchase → Credits → Unlock style
- [ ] Support flow: Settings → Contact → Email client

## 15. Regression Testing

### After Each Update
- [ ] Core functionality unchanged
- [ ] Previous purchases retained
- [ ] User data preserved
- [ ] Widget continues working
- [ ] Settings maintained

## Test Execution Priority

1. **P0 - Critical** (Must pass before launch)
   - Privacy & Security
   - Purchase flow
   - Core image processing
   - Widget basic functionality

2. **P1 - High** (Should pass before launch)
   - All device compatibility
   - Performance benchmarks
   - Error handling
   - Analytics

3. **P2 - Medium** (Can be fixed post-launch)
   - Edge cases
   - Some accessibility features
   - Advanced widget features

## Test Environment Setup

```bash
# Development Testing
APP_ENV=development
Mock IAP enabled
Local Supabase

# Staging Testing  
APP_ENV=staging
Sandbox IAP
Dev Supabase

# Production Testing
APP_ENV=production
Real IAP
Production Supabase
```

## Sign-off Criteria

- [ ] All P0 tests passing
- [ ] 95% of P1 tests passing
- [ ] No critical crashes in 100 sessions
- [ ] Performance benchmarks met
- [ ] Privacy compliance verified
- [ ] App Store guidelines met

---

**Testing Lead:** _________________  
**Date Completed:** _________________  
**Version Tested:** _________________  
**Approved for Release:** [ ] Yes [ ] No