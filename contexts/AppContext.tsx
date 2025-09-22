/**
 * Global App Context Provider
 * Manages app-wide state and services
 */

import { analytics } from "@/services/analytics";
import { imageProcessing } from "@/services/image-processing";
import { notifications } from "@/services/notifications";
import { revenueCat } from "@/services/revenue-cat";
import { Style, SupabaseService, User } from "@/services/supabase";
import { widgetManager } from "@/services/widget-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isUnlocked: boolean;
  credits: number;

  // App state
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  currentPortraitUrl: string | null;
  currentStyleId: string | null;

  // Collections
  unlockedStyles: string[];
  availableStyles: Style[];

  // Widget state
  isWidgetConfigured: boolean;
  isCarPlayConnected: boolean;
}

interface AppContextValue extends AppState {
  // Auth methods
  signIn: (appleIdHash: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Purchase methods
  purchaseUnlock: () => Promise<boolean>;
  purchaseCredits: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;

  // Style methods
  unlockStyle: (styleId: string) => Promise<boolean>;
  applyStyle: (styleId: string) => Promise<void>;

  // Image methods
  uploadAndProcessImage: (imageUri: string) => Promise<string | null>;
  updateWidgetImage: (imageUri: string) => Promise<void>;

  // Credits methods
  spendCredits: (amount: number, reason: string) => Promise<boolean>;
  refreshCredits: () => Promise<void>;

  // App methods
  completeOnboarding: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  checkWidgetStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>({
    user: null,
    isAuthenticated: false,
    isUnlocked: false,
    credits: 0,
    isLoading: true,
    hasCompletedOnboarding: false,
    currentPortraitUrl: null,
    currentStyleId: "minimal",
    unlockedStyles: ["minimal", "dark_gradient", "asphalt"],
    availableStyles: [],
    isWidgetConfigured: false,
    isCarPlayConnected: false,
  });

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize app services and load saved state
   */
  const initializeApp = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Load saved user data
      const savedUserId = await AsyncStorage.getItem("user_id");
      const hasCompletedOnboarding =
        (await AsyncStorage.getItem("onboarding_completed")) === "true";

      // Initialize services
      await analytics.initialize(savedUserId || undefined);
      await notifications.initialize();

      if (savedUserId) {
        await loadUserData(savedUserId);
        await revenueCat.initialize(savedUserId);
      }

      // Load styles
      const styles = await SupabaseService.getAvailableStyles();

      // Check widget status
      const isWidgetConfigured = await widgetManager.isWidgetAdded();
      const isCarPlayConnected = await widgetManager.isCarPlayAvailable();

      setState((prev) => ({
        ...prev,
        availableStyles: styles,
        hasCompletedOnboarding,
        isWidgetConfigured,
        isCarPlayConnected,
        isLoading: false,
      }));

      // Track app open
      await analytics.trackAppOpened();
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Load user data from Supabase
   */
  const loadUserData = async (userId: string) => {
    try {
      const user = await SupabaseService.getCurrentUser(userId);
      if (!user) return;

      const credits = await SupabaseService.getUserCredits(userId);
      const unlockedStyles = await SupabaseService.getUserStyles(userId);
      const assets = await SupabaseService.getUserAssets(userId);

      const currentPortrait = assets[0]?.portrait_url || null;

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isUnlocked: user.is_unlocked,
        credits,
        unlockedStyles: [
          ...new Set([...prev.unlockedStyles, ...unlockedStyles]),
        ],
        currentPortraitUrl: currentPortrait,
      }));

      await analytics.setUserProperties({
        is_unlocked: user.is_unlocked,
        credits_balance: credits,
        styles_owned: unlockedStyles.length,
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  /**
   * Sign in with Apple ID
   */
  const signIn = async (appleIdHash: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      let user = await SupabaseService.getCurrentUser(appleIdHash);

      if (!user) {
        user = await SupabaseService.createUser(appleIdHash);
      }

      if (user) {
        await AsyncStorage.setItem("user_id", user.id);
        await loadUserData(user.id);
        await revenueCat.initialize(user.id);
        await analytics.setUserId(user.id);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("user_id");
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isUnlocked: false,
        credits: 0,
        currentPortraitUrl: null,
        unlockedStyles: ["minimal", "dark_gradient", "asphalt"],
      }));
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  /**
   * Purchase unlock
   */
  const purchaseUnlock = async (): Promise<boolean> => {
    try {
      await analytics.trackPurchaseInitiated("unlock_plus_899");
      const result = await revenueCat.purchase("unlock_plus_899");

      if (result.success) {
        await analytics.trackPurchaseSuccess({
          product_id: "unlock_plus_899",
          price_usd: 8.99,
          credits_granted: 100,
        });

        await notifications.notifyPurchaseComplete(
          "Widget Unlock + 100 Credits"
        );
        await refreshUserData();
        return true;
      } else {
        await analytics.trackPurchaseFailed(
          "unlock_plus_899",
          result.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Purchase failed:", error);
    }
    return false;
  };

  /**
   * Purchase credits
   */
  const purchaseCredits = async (productId: string): Promise<boolean> => {
    try {
      await analytics.trackPurchaseInitiated(productId);
      const result = await revenueCat.purchase(productId);

      if (result.success) {
        // Get credit amount from product ID
        const credits = parseInt(productId.split("_")[1]);
        const price = parseFloat(productId.split("_")[2]) / 100;

        await analytics.trackPurchaseSuccess({
          product_id: productId,
          price_usd: price,
          credits_granted: credits,
        });

        await notifications.notifyPurchaseComplete(`${credits} Credits`);
        await refreshUserData();
        return true;
      } else {
        await analytics.trackPurchaseFailed(
          productId,
          result.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Purchase failed:", error);
    }
    return false;
  };

  /**
   * Restore purchases
   */
  const restorePurchases = async () => {
    try {
      const result = await revenueCat.restorePurchases();
      if (result.success && result.restored.length > 0) {
        await refreshUserData();
      }
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  /**
   * Unlock a style
   */
  const unlockStyle = async (styleId: string): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const result = await SupabaseService.unlockStyle(state.user.id, styleId);

      if (result) {
        await analytics.trackStyleUnlocked({
          style_id: styleId,
          cost_credits: 30,
          remaining_credits: state.credits - 30,
        });

        setState((prev) => ({
          ...prev,
          credits: Math.max(0, prev.credits - 30),
          unlockedStyles: [...prev.unlockedStyles, styleId],
        }));

        // Check for low credits
        const newBalance = state.credits - 30;
        if (newBalance <= 30 && newBalance > 0) {
          await notifications.notifyLowCredits(newBalance);
        }

        return true;
      }
    } catch (error) {
      console.error("Failed to unlock style:", error);
    }
    return false;
  };

  /**
   * Apply a style
   */
  const applyStyle = async (styleId: string) => {
    setState((prev) => ({ ...prev, currentStyleId: styleId }));
    await analytics.trackStyleApplied(styleId);

    // Update widget if portrait exists
    if (state.currentPortraitUrl) {
      await widgetManager.updateWidgetImage(state.currentPortraitUrl, styleId);
    }
  };

  /**
   * Upload and process image
   */
  const uploadAndProcessImage = async (
    imageUri: string
  ): Promise<string | null> => {
    if (!state.user) return null;

    try {
      const result = await imageProcessing.processImage(
        imageUri,
        state.user.id,
        (progress) => {
          console.log(`Processing: ${progress}%`);
        }
      );

      if (result) {
        setState((prev) => ({
          ...prev,
          currentPortraitUrl: result.processedUrl,
        }));

        await analytics.trackCutoutReady({
          latency_ms: result.processingTimeMs,
        });

        await notifications.notifyProcessingComplete();
        return result.processedUrl;
      }
    } catch (error) {
      console.error("Failed to process image:", error);
      await analytics.trackProcessingError(
        error?.toString() || "Unknown error"
      );
    }
    return null;
  };

  /**
   * Update widget image
   */
  const updateWidgetImage = async (imageUri: string) => {
    const success = await widgetManager.updateWidgetImage(
      imageUri,
      state.currentStyleId || "minimal"
    );

    if (success) {
      setState((prev) => ({ ...prev, isWidgetConfigured: true }));
      await analytics.trackWidgetSetupComplete();
    }
  };

  /**
   * Spend credits
   */
  const spendCredits = async (
    amount: number,
    reason: string
  ): Promise<boolean> => {
    if (!state.user || state.credits < amount) return false;

    try {
      const newBalance = state.credits - amount;
      await SupabaseService.addCredits(state.user.id, -amount, reason);

      setState((prev) => ({ ...prev, credits: newBalance }));
      await analytics.trackCreditsBalanceSet(newBalance);

      if (newBalance <= 30 && newBalance > 0) {
        await notifications.notifyLowCredits(newBalance);
      }

      return true;
    } catch (error) {
      console.error("Failed to spend credits:", error);
    }
    return false;
  };

  /**
   * Refresh credits balance
   */
  const refreshCredits = async () => {
    if (!state.user) return;

    const credits = await SupabaseService.getUserCredits(state.user.id);
    setState((prev) => ({ ...prev, credits }));
    await analytics.trackCreditsBalanceSet(credits);
  };

  /**
   * Complete onboarding
   */
  const completeOnboarding = async () => {
    await AsyncStorage.setItem("onboarding_completed", "true");
    setState((prev) => ({ ...prev, hasCompletedOnboarding: true }));
  };

  /**
   * Refresh user data
   */
  const refreshUserData = async () => {
    if (state.user) {
      await loadUserData(state.user.id);
    }
  };

  /**
   * Check widget status
   */
  const checkWidgetStatus = async () => {
    const isConfigured = await widgetManager.isWidgetAdded();
    const isCarPlay = await widgetManager.isCarPlayAvailable();

    setState((prev) => ({
      ...prev,
      isWidgetConfigured: isConfigured,
      isCarPlayConnected: isCarPlay,
    }));
  };

  const value: AppContextValue = {
    ...state,
    signIn,
    signOut,
    purchaseUnlock,
    purchaseCredits,
    restorePurchases,
    unlockStyle,
    applyStyle,
    uploadAndProcessImage,
    updateWidgetImage,
    spendCredits,
    refreshCredits,
    completeOnboarding,
    refreshUserData,
    checkWidgetStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to use app context
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

export default AppContext;
