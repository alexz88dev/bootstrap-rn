import { config } from "@/config";
import { MyCarConfig } from "@/config/mycar-config";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PURCHASES_ERROR_CODE,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

class RevenueCatService {
  private initialized = false;
  private userId: string | null = null;

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    const apiKey = config.REVENUECAT_API_KEY;

    if (!apiKey || apiKey === "dev-revenuecat-key") {
      console.warn("RevenueCat API key not configured");
      return;
    }

    try {
      // Configure RevenueCat
      if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey });
      } else {
        // Android configuration would go here
        console.warn("RevenueCat not configured for Android");
        return;
      }

      // Set user ID if provided
      if (userId) {
        await this.setUserId(userId);
      }

      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      this.initialized = true;
      console.log("RevenueCat initialized successfully");
    } catch (error) {
      console.error("Failed to initialize RevenueCat:", error);
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      this.userId = userId;
    } catch (error) {
      console.error("Failed to set RevenueCat user ID:", error);
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error("Failed to get offerings:", error);
      return null;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error("Failed to get customer info:", error);
      return null;
    }
  }

  async purchaseUnlock(): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const offerings = await this.getOfferings();
      if (!offerings) {
        return { success: false, error: "No offerings available" };
      }

      // Find the unlock package
      const unlockPackage = offerings.availablePackages.find(
        (pkg) => pkg.product.identifier === MyCarConfig.iap.products.unlock.id
      );

      if (!unlockPackage) {
        return { success: false, error: "Unlock package not found" };
      }

      const { customerInfo } = await Purchases.purchasePackage(unlockPackage);

      // Check if purchase was successful
      const hasUnlocked =
        customerInfo.entitlements.active["unlock"] !== undefined;

      return { success: hasUnlocked };
    } catch (error) {
      return this.handlePurchaseError(error as PurchasesError);
    }
  }

  async purchaseCredits(
    creditPackId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const offerings = await this.getOfferings();
      if (!offerings) {
        return { success: false, error: "No offerings available" };
      }

      // Find the credit package
      const creditPackage = offerings.availablePackages.find(
        (pkg) => pkg.product.identifier === creditPackId
      );

      if (!creditPackage) {
        return { success: false, error: "Credit package not found" };
      }

      const { customerInfo } = await Purchases.purchasePackage(creditPackage);

      // Check purchase history for this transaction
      const hasTransaction = customerInfo.nonSubscriptionTransactions.some(
        (t) => t.productIdentifier === creditPackId
      );

      return { success: hasTransaction };
    } catch (error) {
      return this.handlePurchaseError(error as PurchasesError);
    }
  }

  async restorePurchases(): Promise<{ success: boolean; restored: string[] }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const customerInfo = await Purchases.restorePurchases();

      // Get list of active entitlements
      const restored = Object.keys(customerInfo.entitlements.active);

      // Also check non-subscription transactions
      const transactions = customerInfo.nonSubscriptionTransactions.map(
        (t) => t.productIdentifier
      );

      return {
        success: true,
        restored: [...new Set([...restored, ...transactions])],
      };
    } catch (error) {
      console.error("Failed to restore purchases:", error);
      return { success: false, restored: [] };
    }
  }

  async checkUnlockStatus(): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo();
    if (!customerInfo) {
      return false;
    }

    // Check for unlock entitlement
    return (
      customerInfo.entitlements.active["unlock"] !== undefined ||
      customerInfo.nonSubscriptionTransactions.some(
        (t) => t.productIdentifier === MyCarConfig.iap.products.unlock.id
      )
    );
  }

  async getAvailablePackages(): Promise<PurchasesPackage[]> {
    const offerings = await this.getOfferings();
    return offerings?.availablePackages || [];
  }

  private handlePurchaseError(error: PurchasesError): {
    success: boolean;
    error: string;
  } {
    let errorMessage = "Purchase failed";

    switch (error.code) {
      case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
        errorMessage = "Purchase was cancelled";
        break;
      case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
        errorMessage = "There was a problem with the App Store";
        break;
      case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
        errorMessage = "Purchase not allowed on this device";
        break;
      case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
        errorMessage = "Purchase is invalid";
        break;
      case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
        errorMessage = "Product is not available for purchase";
        break;
      default:
        errorMessage = error.message || "An unknown error occurred";
    }

    console.error("Purchase error:", errorMessage, error);
    return { success: false, error: errorMessage };
  }

  // Mock functions for development
  async mockPurchaseUnlock(): Promise<{ success: boolean; error?: string }> {
    console.log("[MOCK] Purchasing unlock...");
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success 90% of the time
    if (Math.random() > 0.1) {
      console.log("[MOCK] Purchase successful!");
      return { success: true };
    } else {
      console.log("[MOCK] Purchase failed!");
      return { success: false, error: "Mock purchase failed" };
    }
  }

  async mockPurchaseCredits(
    creditPackId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log(`[MOCK] Purchasing credit pack: ${creditPackId}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Always succeed in mock
    console.log("[MOCK] Credit purchase successful!");
    return { success: true };
  }

  // Helper to determine if we should use mock
  private shouldUseMock(): boolean {
    return __DEV__ && config.FEATURES?.SKIP_IAP_VALIDATION === true;
  }

  // Public wrapper methods that can use mock in development
  async purchase(
    productId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (this.shouldUseMock()) {
      if (productId === MyCarConfig.iap.products.unlock.id) {
        return this.mockPurchaseUnlock();
      } else {
        return this.mockPurchaseCredits(productId);
      }
    }

    // Real purchase
    if (productId === MyCarConfig.iap.products.unlock.id) {
      return this.purchaseUnlock();
    } else {
      return this.purchaseCredits(productId);
    }
  }
}

// Export singleton instance
export const revenueCat = new RevenueCatService();
export default revenueCat;
