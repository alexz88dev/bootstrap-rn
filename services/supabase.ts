import { config } from "@/config";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client

export const supabase = createClient(
  config.SUPABASE_URL || "",
  config.SUPABASE_ANON_KEY || ""
);

// Database types
export interface User {
  id: string;
  apple_id_hash?: string;
  is_unlocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditLedger {
  id: string;
  user_id: string;
  delta: number;
  balance_after: number;
  source: string;
  receipt_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Style {
  style_id: string;
  title: string;
  description?: string;
  cost: number;
  is_included: boolean;
  preview_url?: string;
  background_prompt?: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserStyle {
  user_id: string;
  style_id: string;
  unlocked_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  original_url?: string;
  portrait_url: string;
  style_id?: string;
  processing_time_ms?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Supabase service functions
export const SupabaseService = {
  // User functions
  async getCurrentUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  },

  async createUser(appleIdHash: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .insert({ apple_id_hash: appleIdHash })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return null;
    }

    return data;
  },

  // Credits functions
  async getUserCredits(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from("credits_ledger")
      .select("balance_after")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return 0;
    }

    return data.balance_after;
  },

  async addCredits(
    userId: string,
    amount: number,
    source: string,
    receiptId?: string
  ): Promise<boolean> {
    const currentBalance = await this.getUserCredits(userId);
    const newBalance = currentBalance + amount;

    const { error } = await supabase.from("credits_ledger").insert({
      user_id: userId,
      delta: amount,
      balance_after: newBalance,
      source,
      receipt_id: receiptId,
    });

    return !error;
  },

  // Styles functions
  async getAvailableStyles(): Promise<Style[]> {
    const { data, error } = await supabase
      .from("styles")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    if (error) {
      console.error("Error fetching styles:", error);
      return [];
    }

    return data || [];
  },

  async getUserStyles(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("user_styles")
      .select("style_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user styles:", error);
      return [];
    }

    return data?.map((s) => s.style_id) || [];
  },

  async unlockStyle(userId: string, styleId: string): Promise<boolean> {
    // First check if user has enough credits
    const style = await this.getStyle(styleId);
    if (!style || style.cost > 0) {
      const credits = await this.getUserCredits(userId);
      if (credits < (style?.cost || 30)) {
        return false;
      }

      // Deduct credits
      await this.addCredits(
        userId,
        -(style?.cost || 30),
        "style_unlock",
        styleId
      );
    }

    // Add style to user's collection
    const { error } = await supabase.from("user_styles").insert({
      user_id: userId,
      style_id: styleId,
    });

    return !error;
  },

  async getStyle(styleId: string): Promise<Style | null> {
    const { data, error } = await supabase
      .from("styles")
      .select("*")
      .eq("style_id", styleId)
      .single();

    if (error) {
      console.error("Error fetching style:", error);
      return null;
    }

    return data;
  },

  // Assets functions
  async getUserAssets(userId: string): Promise<Asset[]> {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assets:", error);
      return [];
    }

    return data || [];
  },

  async saveAsset(asset: Partial<Asset>): Promise<Asset | null> {
    const { data, error } = await supabase
      .from("assets")
      .insert(asset)
      .select()
      .single();

    if (error) {
      console.error("Error saving asset:", error);
      return null;
    }

    return data;
  },

  // Edge Functions
  async processCutout(
    imageUrl: string,
    userId: string
  ): Promise<string | null> {
    const { data, error } = await supabase.functions.invoke("processCutout", {
      body: { imageUrl, userId },
    });

    if (error) {
      console.error("Error processing cutout:", error);
      return null;
    }

    return data?.portrait_url || null;
  },

  async grantIAPPurchase(
    receiptData: string,
    productId: string,
    userId: string
  ): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke("iapGrant", {
      body: { receiptData, productId, userId },
    });

    return !error && data?.success === true;
  },

  async spendCredits(
    userId: string,
    styleId: string
  ): Promise<{ success: boolean; balance_after?: number }> {
    const { data, error } = await supabase.functions.invoke("creditsSpend", {
      body: { userId, styleId },
    });

    if (error) {
      return { success: false };
    }

    return data || { success: false };
  },
};

export default supabase;
