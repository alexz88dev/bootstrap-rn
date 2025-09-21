export const productionConfig = {
  APP_ENV: "production",
  API_BASE_URL: "https://api.mycarportrait.app",
  
  // Supabase Configuration (production)
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL_PROD || "https://your-prod-project.supabase.co",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_PROD || "your-prod-anon-key",
  
  // RevenueCat Configuration (production)
  REVENUECAT_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_PROD || "prod-revenuecat-key",
  
  // AI Provider (production)
  AI_PROVIDER_URL: process.env.EXPO_PUBLIC_AI_PROVIDER_URL_PROD || "https://ai.mycarportrait.app",
  AI_PROVIDER_KEY: process.env.EXPO_PUBLIC_AI_PROVIDER_KEY_PROD || "prod-ai-key",
  
  // Analytics (production)
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_PROD || "",
  MIXPANEL_TOKEN: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN_PROD || "",
  
  // Error Tracking
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || "https://your-prod-sentry-dsn",
  
  // Production Settings
  DEBUG: false,
  LOG_LEVEL: "error",
  EAS_PROJECT_ID: "8385d647-791b-4998-b66e-c6b11e4939a0",
  CHANNEL: "production",
  
  // Feature Flags
  FEATURES: {
    SKIP_IAP_VALIDATION: false,
    MOCK_IMAGE_PROCESSING: false,
    ENABLE_DEV_MENU: false,
    LOG_ANALYTICS_EVENTS: false,
    BYPASS_RATE_LIMITS: false,
  },
};

export default productionConfig;
