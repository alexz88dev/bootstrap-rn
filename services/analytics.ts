/**
 * Analytics Service for MyCar Portrait
 * Handles all event tracking and user analytics
 */

import { config } from "@/config";
import { MyCarConfig } from "@/config/mycar-config";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Event parameter types
interface BaseEventParams {
  timestamp?: string;
  session_id?: string;
  user_id?: string;
}

interface PhotoUploadedParams extends BaseEventParams {
  from: "camera" | "gallery";
  file_size_kb: number;
  plate_detected: boolean;
}

interface CutoutReadyParams extends BaseEventParams {
  latency_ms: number;
  mask_confidence?: number;
}

interface PreviewShownParams extends BaseEventParams {
  styles_shown: string[];
  time_since_open_ms: number;
}

interface PaywallShownParams extends BaseEventParams {
  time_since_open_ms: number;
  trigger: string;
}

interface PurchaseSuccessParams extends BaseEventParams {
  product_id: string;
  price_usd: number;
  credits_granted?: number;
}

interface StyleUnlockedParams extends BaseEventParams {
  style_id: string;
  cost_credits: number;
  remaining_credits: number;
}

interface CreditsPurchasedParams extends BaseEventParams {
  product_id: string;
  qty: number;
  price_usd: number;
}

interface NotificationParams extends BaseEventParams {
  type: string;
  action: "scheduled" | "tapped" | "dismissed";
}

// User properties
interface UserProperties {
  user_id?: string;
  is_unlocked: boolean;
  credits_balance: number;
  styles_owned: number;
  portraits_created: number;
  app_version: string;
  device_type: string;
  os_version: string;
  first_open_date?: string;
  last_purchase_date?: string;
}

class AnalyticsService {
  private initialized = false;
  private sessionId: string;
  private userId: string | null = null;
  private firebaseAnalytics: any = null;
  private mixpanelClient: any = null;
  private eventQueue: Array<{ event: string; params: any }> = [];
  private isDebug: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isDebug = config.DEBUG || false;
  }

  /**
   * Initialize analytics services
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize Firebase Analytics
      if (config.FIREBASE_API_KEY && config.FIREBASE_API_KEY !== "") {
        await this.initializeFirebase(config.FIREBASE_API_KEY);
      }

      // Initialize Mixpanel or PostHog
      if (config.MIXPANEL_TOKEN && config.MIXPANEL_TOKEN !== "") {
        await this.initializeMixpanel(config.MIXPANEL_TOKEN);
      }

      // Set user ID if provided
      if (userId) {
        await this.setUserId(userId);
      }

      // Set default user properties
      await this.setUserProperties(await this.getDefaultUserProperties());

      // Process any queued events
      await this.processEventQueue();

      this.initialized = true;
      console.log("Analytics initialized successfully");
    } catch (error) {
      console.error("Failed to initialize analytics:", error);
    }
  }

  /**
   * Initialize Firebase Analytics
   */
  private async initializeFirebase(apiKey: string): Promise<void> {
    try {
      // In a real implementation, you would initialize Firebase here
      // For Expo, we'll use a web-based approach or native module
      if (this.isDebug) {
        console.log(
          "[Analytics] Firebase would be initialized with key:",
          apiKey.substring(0, 10) + "..."
        );
      }

      // Mock implementation for now
      this.firebaseAnalytics = {
        logEvent: (event: string, params: any) => {
          if (this.isDebug) {
            console.log(`[Firebase] Event: ${event}`, params);
          }
        },
        setUserId: (userId: string) => {
          if (this.isDebug) {
            console.log(`[Firebase] User ID: ${userId}`);
          }
        },
        setUserProperties: (properties: any) => {
          if (this.isDebug) {
            console.log("[Firebase] User Properties:", properties);
          }
        },
      };
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
    }
  }

  /**
   * Initialize Mixpanel
   */
  private async initializeMixpanel(token: string): Promise<void> {
    try {
      if (this.isDebug) {
        console.log(
          "[Analytics] Mixpanel would be initialized with token:",
          token.substring(0, 10) + "..."
        );
      }

      // Mock implementation for now
      this.mixpanelClient = {
        track: (event: string, params: any) => {
          if (this.isDebug) {
            console.log(`[Mixpanel] Event: ${event}`, params);
          }
        },
        identify: (userId: string) => {
          if (this.isDebug) {
            console.log(`[Mixpanel] Identify: ${userId}`);
          }
        },
        people: {
          set: (properties: any) => {
            if (this.isDebug) {
              console.log("[Mixpanel] People Properties:", properties);
            }
          },
        },
      };
    } catch (error) {
      console.error("Failed to initialize Mixpanel:", error);
    }
  }

  /**
   * Set user ID for analytics
   */
  async setUserId(userId: string): Promise<void> {
    this.userId = userId;

    if (this.firebaseAnalytics) {
      this.firebaseAnalytics.setUserId(userId);
    }

    if (this.mixpanelClient) {
      this.mixpanelClient.identify(userId);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Partial<UserProperties>): Promise<void> {
    if (this.firebaseAnalytics) {
      this.firebaseAnalytics.setUserProperties(properties);
    }

    if (this.mixpanelClient?.people) {
      this.mixpanelClient.people.set(properties);
    }
  }

  /**
   * Get default user properties
   */
  private async getDefaultUserProperties(): Promise<Partial<UserProperties>> {
    return {
      app_version: Application.nativeApplicationVersion || "1.0.0",
      device_type: Device.modelName || "Unknown",
      os_version: `${Platform.OS} ${Platform.Version}`,
      is_unlocked: false,
      credits_balance: 0,
      styles_owned: 3, // Default included styles
      portraits_created: 0,
    };
  }

  /**
   * Track event
   */
  private async trackEvent(event: string, params: any = {}): Promise<void> {
    // Add common parameters
    const enrichedParams = {
      ...params,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
      platform: Platform.OS,
      app_version: Application.nativeApplicationVersion,
    };

    // If not initialized, queue the event
    if (!this.initialized) {
      this.eventQueue.push({ event, params: enrichedParams });
      return;
    }

    // Log to console in debug mode
    if (this.isDebug || MyCarConfig.features.enableDebugMode) {
      console.log(`📊 [Analytics] ${event}:`, enrichedParams);
    }

    // Send to Firebase
    if (this.firebaseAnalytics) {
      this.firebaseAnalytics.logEvent(event, enrichedParams);
    }

    // Send to Mixpanel
    if (this.mixpanelClient) {
      this.mixpanelClient.track(event, enrichedParams);
    }
  }

  /**
   * Process queued events
   */
  private async processEventQueue(): Promise<void> {
    while (this.eventQueue.length > 0) {
      const { event, params } = this.eventQueue.shift()!;
      await this.trackEvent(event, params);
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // ============================================
  // Public Event Tracking Methods
  // ============================================

  /**
   * Track app open
   */
  async trackOpenFirst(
    source?: string,
    adGroup?: string,
    keyword?: string
  ): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.OPEN_FIRST, {
      source,
      ad_group: adGroup,
      keyword,
    });
  }

  /**
   * Track photo uploaded
   */
  async trackPhotoUploaded(params: PhotoUploadedParams): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.PHOTO_UPLOADED, params);
  }

  /**
   * Track cutout ready
   */
  async trackCutoutReady(params: CutoutReadyParams): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.CUTOUT_READY, params);
  }

  /**
   * Track preview shown
   */
  async trackPreviewShown(params: PreviewShownParams): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.PREVIEW_SHOWN, params);
  }

  /**
   * Track paywall shown
   */
  async trackPaywallShown(params: PaywallShownParams): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.PAYWALL_SHOWN, params);
  }

  /**
   * Track paywall dismissed
   */
  async trackPaywallDismissed(): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.PAYWALL_DISMISSED);
  }

  /**
   * Track purchase initiated
   */
  async trackPurchaseInitiated(productId: string): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.PURCHASE_INITIATED, {
      product_id: productId,
    });
  }

  /**
   * Track purchase success
   */
  async trackPurchaseSuccess(params: PurchaseSuccessParams): Promise<void> {
    await this.trackEvent(
      MyCarConfig.analytics.events.PURCHASE_SUCCESS,
      params
    );

    // Update user properties
    await this.setUserProperties({
      is_unlocked: params.product_id === "unlock_plus_899",
      last_purchase_date: new Date().toISOString(),
    });
  }

  /**
   * Track purchase failed
   */
  async trackPurchaseFailed(productId: string, error: string): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.PURCHASE_FAILED, {
      product_id: productId,
      error,
    });
  }

  /**
   * Track credits balance set
   */
  async trackCreditsBalanceSet(balance: number): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.CREDITS_BALANCE_SET, {
      balance,
    });

    // Update user property
    await this.setUserProperties({
      credits_balance: balance,
    });
  }

  /**
   * Track style unlocked
   */
  async trackStyleUnlocked(params: StyleUnlockedParams): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.STYLE_UNLOCKED, params);
  }

  /**
   * Track style applied
   */
  async trackStyleApplied(styleId: string): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.STYLE_APPLIED, {
      style_id: styleId,
    });
  }

  /**
   * Track widget guide shown
   */
  async trackWidgetGuideShown(): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.WIDGET_GUIDE_SHOWN);
  }

  /**
   * Track widget setup complete
   */
  async trackWidgetSetupComplete(): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.WIDGET_SETUP_COMPLETE);
  }

  /**
   * Track notification scheduled
   */
  async trackNotificationScheduled(type: string): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.NOTIFICATION_SCHEDULED, {
      type,
      action: "scheduled",
    } as NotificationParams);
  }

  /**
   * Track notification tapped
   */
  async trackNotificationTapped(type: string): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.NOTIFICATION_TAPPED, {
      type,
      action: "tapped",
    } as NotificationParams);
  }

  /**
   * Track app opened
   */
  async trackAppOpened(source?: string): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.APP_OPENED, {
      source,
    });
  }

  /**
   * Track processing error
   */
  async trackProcessingError(error: string, step?: string): Promise<void> {
    await this.trackEvent(MyCarConfig.analytics.events.PROCESSING_ERROR, {
      error,
      step,
    });
  }

  /**
   * Track screen view (for navigation analytics)
   */
  async trackScreenView(screenName: string, params?: any): Promise<void> {
    await this.trackEvent("screen_view", {
      screen_name: screenName,
      ...params,
    });
  }

  /**
   * Start new session
   */
  startNewSession(): void {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
export default analytics;
