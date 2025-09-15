import Constants from "expo-constants";
import developmentConfig from "./environments/development";
import productionConfig from "./environments/production";
import stagingConfig from "./environments/staging";

// Get environment from Constants.expoConfig or fallback to NODE_ENV
const getAppEnv = (): string => {
  // EAS builds will set this via environment variables in eas.json
  if (Constants.expoConfig?.extra?.APP_ENV) {
    return Constants.expoConfig.extra.APP_ENV;
  }

  // Fallback to process.env for local development
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  return "development";
};

const appEnv = getAppEnv();

const configs = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

// Export the current environment config
export const config =
  configs[appEnv as keyof typeof configs] || developmentConfig;

// Export individual configs for direct access if needed
export { developmentConfig, productionConfig, stagingConfig };

// Export utility functions
export const isDevelopment = () => appEnv === "development";
export const isStaging = () => appEnv === "staging";
export const isProduction = () => appEnv === "production";
export const getEnvironment = () => appEnv;

export default config;
