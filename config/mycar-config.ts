/**
 * MyCar Portrait Configuration
 * Central configuration for all app-specific settings
 */

export const MyCarConfig = {
  // App Metadata
  app: {
    name: 'MyCar Portrait',
    tagline: 'Your car on iPhone & CarPlay',
    version: '0.1.0',
    buildNumber: 1,
  },

  // In-App Purchase Products
  iap: {
    products: {
      unlock: {
        id: 'unlock_plus_899',
        price: 8.99,
        credits: 100,
        includedStyles: ['minimal', 'dark_gradient', 'asphalt'],
        description: 'Widget + 3 Styles + 100 Credits',
      },
      creditPacks: [
        { id: 'credits_40_399', credits: 40, price: 3.99 },
        { id: 'credits_120_999', credits: 120, price: 9.99 },
        { id: 'credits_260_1999', credits: 260, price: 19.99 },
        { id: 'credits_520_3499', credits: 520, price: 34.99 },
      ],
    },
  },

  // Style Configuration
  styles: {
    creditCost: 30,
    free: [
      { id: 'minimal', name: 'Minimal', included: true },
      { id: 'dark_gradient', name: 'Dark Gradient', included: true },
      { id: 'asphalt', name: 'Asphalt', included: true },
    ],
    premium: [
      { id: 'neon', name: 'Neon' },
      { id: 'blueprint', name: 'Blueprint' },
      { id: 'frosted_glass', name: 'Frosted Glass' },
      { id: 'sunset', name: 'Sunset' },
      { id: 'carbon_weave', name: 'Carbon Weave' },
      { id: 'bokeh_night', name: 'Bokeh Night' },
      { id: 'garage_glow', name: 'Garage Glow' },
      { id: 'cinematic_rain', name: 'Cinematic Rain' },
      { id: 'retro_film', name: 'Retro Film' },
    ],
  },

  // Image Processing
  imageProcessing: {
    outputSize: 1024,
    outputFormat: 'png',
    maxFileSize: 1048576, // 1MB in bytes
    compressionQuality: 0.9,
    rateLimits: {
      preUnlock: 5, // per day
      postUnlock: 10, // per day
    },
  },

  // Performance Targets
  performance: {
    targetP50: 2500, // 2.5 seconds
    targetP90: 5000, // 5 seconds
    maxProcessingTime: 10000, // 10 seconds timeout
  },

  // Analytics Events
  analytics: {
    events: {
      // Onboarding
      OPEN_FIRST: 'open_first',
      ONBOARDING_COMPLETE: 'onboarding_complete',
      
      // Photo Processing
      PHOTO_UPLOADED: 'photo_uploaded',
      CUTOUT_READY: 'cutout_ready',
      PROCESSING_ERROR: 'processing_error',
      
      // Conversion
      PREVIEW_SHOWN: 'preview_shown',
      PAYWALL_SHOWN: 'paywall_shown',
      PAYWALL_DISMISSED: 'paywall_dismissed',
      
      // Purchases
      PURCHASE_INITIATED: 'purchase_initiated',
      PURCHASE_SUCCESS: 'purchase_success',
      PURCHASE_FAILED: 'purchase_failed',
      PURCHASE_RESTORED: 'purchase_restored',
      
      // Credits
      CREDITS_BALANCE_SET: 'credits_balance_set',
      CREDITS_SPENT: 'credits_spent',
      CREDITS_PURCHASED: 'credits_purchased',
      
      // Styles
      STYLE_UNLOCKED: 'style_unlocked',
      STYLE_APPLIED: 'style_applied',
      STYLE_PREVIEW: 'style_preview',
      
      // Widget
      WIDGET_GUIDE_SHOWN: 'widget_guide_shown',
      WIDGET_SETUP_COMPLETE: 'widget_setup_complete',
      
      // Engagement
      NOTIFICATION_SCHEDULED: 'notification_scheduled',
      NOTIFICATION_TAPPED: 'notification_tapped',
      APP_OPENED: 'app_opened',
    },
  },

  // Push Notification Templates
  notifications: {
    reengagement: [
      {
        delay: 86400000, // 24 hours
        title: 'Your car portrait is waiting',
        body: 'Complete your setup and add your car to your home screen',
      },
      {
        delay: 259200000, // 72 hours
        title: 'Add your car as a widget',
        body: 'Show off your ride on your iPhone and CarPlay',
      },
      {
        delay: 604800000, // 7 days
        title: 'Turn iPhone & CarPlay into your garage',
        body: 'Your personalized car widget is just one tap away',
      },
    ],
    monthly: {
      title: 'New styles available!',
      body: 'Check out the latest backgrounds for your car portrait',
    },
  },

  // Widget Configuration
  widget: {
    sizes: ['systemSmall'],
    refreshInterval: 3600, // 1 hour in seconds
    platforms: ['ios', 'carplay'],
  },

  // API Endpoints (will be configured per environment)
  api: {
    supabase: {
      // These will be loaded from environment variables
      url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    },
    revenueCat: {
      apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '',
    },
  },

  // Feature Flags
  features: {
    enableAnalytics: true,
    enableCrashReporting: true,
    enableNotifications: true,
    enableDebugMode: __DEV__,
    requireUnlockForWidget: true,
  },

  // App Store Configuration
  appStore: {
    appId: '', // Will be assigned by Apple
    keywords: [
      'carplay',
      'car',
      'widget',
      'photo',
      'background',
      'cutout',
      'portrait',
      'lockscreen',
    ],
    primaryCategory: 'Lifestyle',
    secondaryCategory: 'Photo & Video',
  },

  // Support
  support: {
    email: 'support@mycarportrait.app',
    privacyUrl: 'https://mycarportrait.app/privacy',
    termsUrl: 'https://mycarportrait.app/terms',
  },
};

export type StyleConfig = typeof MyCarConfig.styles.free[0] | typeof MyCarConfig.styles.premium[0];
export type CreditPackConfig = typeof MyCarConfig.iap.products.creditPacks[0];
export type NotificationConfig = typeof MyCarConfig.notifications.reengagement[0];

export default MyCarConfig;