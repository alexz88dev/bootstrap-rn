export const developmentConfig = {
  APP_ENV: "development",
  API_BASE_URL: "http://localhost:3000",
  
  // Supabase Configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "dev-anon-key",
  
  // RevenueCat Configuration
  REVENUECAT_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "dev-revenuecat-key",
  
  // Seedream 4.0 AI Configuration
  SEEDREAM_API_KEY: process.env.EXPO_PUBLIC_SEEDREAM_API_KEY || "",
  SEEDREAM_API_URL: process.env.EXPO_PUBLIC_SEEDREAM_API_URL || "https://api.seedream.ai/v4",
  
  // Legacy AI Provider (deprecated - use Seedream instead)
  AI_PROVIDER_URL: process.env.EXPO_PUBLIC_AI_PROVIDER_URL || "http://localhost:3001",
  AI_PROVIDER_KEY: process.env.EXPO_PUBLIC_AI_PROVIDER_KEY || "dev-ai-key",
  
  // Analytics
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  MIXPANEL_TOKEN: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || "",
  
  // Development Settings
  DEBUG: true,
  LOG_LEVEL: "debug",
  EAS_PROJECT_ID: "8385d647-791b-4998-b66e-c6b11e4939a0",
  CHANNEL: "development",
  
  // Feature Flags
  FEATURES: {
    SKIP_IAP_VALIDATION: true,
    MOCK_IMAGE_PROCESSING: true, // Use mock until Seedream API key is configured
    ENABLE_DEV_MENU: true,
    LOG_ANALYTICS_EVENTS: true,
    BYPASS_RATE_LIMITS: true,
    USE_SEEDREAM_MOCK: true, // Mock Seedream responses in development
  },
};

export default developmentConfig;
