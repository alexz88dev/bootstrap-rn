export const stagingConfig = {
  APP_ENV: "staging",
  API_BASE_URL: "http://localhost:3000", // Uses DEV backend
  SUPABASE_URL: "https://your-dev-project.supabase.co", // Same as dev
  SUPABASE_ANON_KEY: "your-dev-anon-key", // Same as dev
  SENTRY_DSN: "", // No Sentry for staging
  DEBUG: false, // Release build, no debug
  LOG_LEVEL: "info",
  EAS_PROJECT_ID: "8385d647-791b-4998-b66e-c6b11e4939a0",
  CHANNEL: "staging",
};

export default stagingConfig;
