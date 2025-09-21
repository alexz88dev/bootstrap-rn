export const stagingConfig = {
  APP_ENV: "staging",
  API_BASE_URL: "http://localhost:3000", // Uses DEV backend
  
  // Supabase Configuration (same as dev)
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "dev-anon-key",
  
  // RevenueCat Configuration (sandbox)
  REVENUECAT_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "dev-revenuecat-key",
  
  // AI Provider (same as dev)
  AI_PROVIDER_URL: process.env.EXPO_PUBLIC_AI_PROVIDER_URL || "http://localhost:3001",
  AI_PROVIDER_KEY: process.env.EXPO_PUBLIC_AI_PROVIDER_KEY || "dev-ai-key",
  
  // Analytics (optional for staging)
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  MIXPANEL_TOKEN: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || "",
  
  // Staging Settings
  DEBUG: false, // Release build, no debug
  LOG_LEVEL: "info",
  EAS_PROJECT_ID: "8385d647-791b-4998-b66e-c6b11e4939a0",
  CHANNEL: "staging",
  
  // Feature Flags
  FEATURES: {
    SKIP_IAP_VALIDATION: true, // Still skip for testing
    MOCK_IMAGE_PROCESSING: false,
    ENABLE_DEV_MENU: false,
    LOG_ANALYTICS_EVENTS: true,
    BYPASS_RATE_LIMITS: false,
  },
};

export default stagingConfig;
