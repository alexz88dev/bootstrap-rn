import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MyCarConfig } from "@/config/mycar-config";
import { useApp } from "@/contexts/AppContext";

const styleGradients: Record<string, [string, string]> = {
  minimal: ["#F8FAFC", "#E2E8F0"],
  dark_gradient: ["#0F172A", "#1E293B"],
  asphalt: ["#2C3E50", "#34495E"],
  neon: ["#1D2671", "#C33764"],
  blueprint: ["#0F2027", "#203A43"],
  frosted_glass: ["#83A4D4", "#B6FBFF"],
  sunset: ["#ff6e7f", "#bfe9ff"],
  carbon_weave: ["#232526", "#414345"],
  bokeh_night: ["#000428", "#004e92"],
  garage_glow: ["#1f4037", "#99f2c8"],
  cinematic_rain: ["#3a7bd5", "#3a6073"],
  retro_film: ["#8360c3", "#2ebf91"],
};

function getStyleGradient(styleId?: string): [string, string] {
  if (styleId && styleGradients[styleId]) {
    return styleGradients[styleId];
  }
  return styleGradients.minimal;
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    isLoading,
    currentPortraitUrl,
    currentStyleId,
    isUnlocked,
    credits,
    unlockedStyles,
    availableStyles,
    isWidgetConfigured,
    isCarPlayConnected,
    purchaseUnlock,
    refreshUserData,
    checkWidgetStatus,
  } = useApp();

  useFocusEffect(
    useCallback(() => {
      refreshUserData();
      checkWidgetStatus();
    }, [refreshUserData, checkWidgetStatus])
  );

  const hasPortrait = Boolean(currentPortraitUrl);

  const styleNameMap = useMemo(() => {
    const map = new Map<string, string>();

    MyCarConfig.styles.free.forEach((style) => {
      map.set(style.id, style.name);
    });

    MyCarConfig.styles.premium.forEach((style) => {
      map.set(style.id, style.name);
    });

    availableStyles.forEach((style) => {
      map.set(style.style_id, style.title);
    });

    return map;
  }, [availableStyles]);

  const currentStyleName =
    styleNameMap.get(currentStyleId || "minimal") || "Minimal";

  const unlockedPremiumCount = useMemo(() => {
    const freeStyleIds = new Set(
      MyCarConfig.styles.free.map((style) => style.id)
    );
    return unlockedStyles.filter((styleId) => !freeStyleIds.has(styleId))
      .length;
  }, [unlockedStyles]);

  const totalStylesOwned = useMemo(() => {
    const unique = new Set([
      ...MyCarConfig.styles.free.map((style) => style.id),
      ...unlockedStyles,
    ]);
    return unique.size;
  }, [unlockedStyles]);

  const totalStylesAvailable =
    MyCarConfig.styles.free.length + MyCarConfig.styles.premium.length;

  const handleUploadPress = () => {
    router.push("/(tabs)/upload");
  };

  const handleChangeStyle = () => {
    router.push("/(tabs)/gallery");
  };

  const handlePreview = () => {
    router.push("/preview");
  };

  const handleUnlockPress = async () => {
    const success = await purchaseUnlock();
    if (!success) {
      router.push("/paywall");
    }
  };

  const handleAddCredits = () => {
    router.push("/paywall");
  };

  const handleShare = async () => {
    if (!currentPortraitUrl) return;

    try {
      await Share.share({
        url: currentPortraitUrl,
        message: "Check out my car portrait from MyCar Portrait! 🚗✨",
      });
    } catch (error) {
      console.warn("Share failed", error);
    }
  };

  const gradient = getStyleGradient(currentStyleId || "minimal");

  // if (isLoading) {
  //   return (
  //     <ThemedView style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //       <ThemedText style={styles.loadingText}>
  //         Preparing your garage…
  //       </ThemedText>
  //     </ThemedView>
  //   );
  // }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {MyCarConfig.app.name}
        </ThemedText>
        <ThemedText style={styles.tagline}>
          {MyCarConfig.app.tagline}
        </ThemedText>
      </ThemedView>

      {!hasPortrait ? (
        <ThemedView style={styles.emptyState}>
          <View style={styles.placeholderContainer}>
            <IconSymbol name="car.fill" size={80} color="#9CA3AF" />
          </View>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Car Portrait Yet
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Upload a photo of your car to create your personalized widget for
            iPhone and CarPlay.
          </ThemedText>
          <Pressable style={styles.primaryButton} onPress={handleUploadPress}>
            <IconSymbol name="camera.fill" size={20} color="#FFF" />
            <ThemedText style={styles.primaryButtonText}>
              Upload Photo
            </ThemedText>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handlePreview}>
            <ThemedText style={styles.secondaryButtonText}>
              See how it looks
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <ThemedView style={styles.portraitSection}>
          <View style={styles.portraitHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>
              Your Portrait
            </ThemedText>
            <View style={styles.styleBadge}>
              <IconSymbol name="paintbrush.pointed" size={16} color="#FFF" />
              <ThemedText style={styles.styleBadgeText}>
                {currentStyleName}
              </ThemedText>
            </View>
          </View>

          <View style={styles.portraitFrame}>
            <View
              style={[
                styles.portraitGradient,
                {
                  backgroundColor: gradient[0],
                  shadowColor: gradient[1],
                },
              ]}
            >
              <Image
                source={{ uri: currentPortraitUrl }}
                style={styles.portraitImage}
                resizeMode="cover"
              />
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={handleUploadPress}>
              <IconSymbol name="camera.fill" size={18} color="#007AFF" />
              <ThemedText style={styles.actionText}>Change Photo</ThemedText>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleChangeStyle}>
              <IconSymbol name="sparkles" size={18} color="#007AFF" />
              <ThemedText style={styles.actionText}>Change Style</ThemedText>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push("/widget-setup")}
            >
              <IconSymbol name="apps.iphone" size={18} color="#007AFF" />
              <ThemedText style={styles.actionText}>Widget Setup</ThemedText>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={handleShare}
              disabled={!currentPortraitUrl}
            >
              <IconSymbol
                name="square.and.arrow.up"
                size={18}
                color="#007AFF"
              />
              <ThemedText style={styles.actionText}>Share</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}

      {!isUnlocked ? (
        <Pressable style={styles.unlockBanner} onPress={handleUnlockPress}>
          <IconSymbol name="lock.fill" size={24} color="#F59E0B" />
          <View style={styles.unlockContent}>
            <ThemedText type="defaultSemiBold" style={styles.unlockTitle}>
              Unlock Full Experience
            </ThemedText>
            <ThemedText style={styles.unlockDescription}>
              Widget + 3 Styles + 100 Credits included
            </ThemedText>
          </View>
          <ThemedText style={styles.unlockPrice}>$8.99</ThemedText>
        </Pressable>
      ) : (
        <ThemedView style={styles.creditsCard}>
          <View style={styles.creditsHeader}>
            <View style={styles.creditsBadge}>
              <IconSymbol name="star.fill" size={20} color="#FACC15" />
              <ThemedText style={styles.creditsLabel}>Credits</ThemedText>
            </View>
            <Pressable
              style={styles.addCreditsButton}
              onPress={handleAddCredits}
            >
              <IconSymbol name="plus.circle.fill" size={18} color="#FFF" />
              <ThemedText style={styles.addCreditsText}>Buy More</ThemedText>
            </Pressable>
          </View>
          <ThemedText type="title" style={styles.creditsValue}>
            {credits}
          </ThemedText>
          <ThemedText style={styles.creditsSubtext}>
            {unlockedPremiumCount > 0
              ? `${unlockedPremiumCount} premium style${
                  unlockedPremiumCount > 1 ? "s" : ""
                } unlocked`
              : "Use credits to unlock premium styles"}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.widgetCard}>
        <View style={styles.widgetHeader}>
          <IconSymbol name="apps.iphone" size={24} color="#2563EB" />
          <ThemedText type="defaultSemiBold" style={styles.widgetTitle}>
            Widget Status
          </ThemedText>
          {isWidgetConfigured && (
            <View style={styles.widgetBadge}>
              <IconSymbol
                name="checkmark.seal.fill"
                size={16}
                color="#34C759"
              />
              <ThemedText style={styles.widgetBadgeText}>Active</ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.widgetDescription}>
          {isWidgetConfigured
            ? "Your widget is live. It will refresh automatically with new portraits and styles."
            : "Add the widget to your iPhone and CarPlay to showcase your ride everywhere."}
        </ThemedText>

        <View style={styles.widgetStatusRow}>
          <View style={styles.statusPill}>
            <IconSymbol
              name={isWidgetConfigured ? "checkmark.circle.fill" : "circle"}
              size={16}
              color={isWidgetConfigured ? "#34C759" : "#9CA3AF"}
            />
            <ThemedText style={styles.statusPillText}>
              iPhone {isWidgetConfigured ? "Widget Ready" : "Setup Required"}
            </ThemedText>
          </View>
          <View style={styles.statusPill}>
            <IconSymbol
              name={isCarPlayConnected ? "car.fill" : "car"}
              size={16}
              color={isCarPlayConnected ? "#2563EB" : "#9CA3AF"}
            />
            <ThemedText style={styles.statusPillText}>
              CarPlay {isCarPlayConnected ? "Connected" : "Pending"}
            </ThemedText>
          </View>
        </View>

        <Pressable
          style={styles.widgetButton}
          onPress={() => router.push("/widget-setup")}
        >
          <IconSymbol name="hand.tap.fill" size={18} color="#FFF" />
          <ThemedText style={styles.widgetButtonText}>
            Open Setup Guide
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.stylesCard}>
        <View style={styles.stylesHeader}>
          <ThemedText type="defaultSemiBold" style={styles.stylesTitle}>
            Your Style Garage
          </ThemedText>
          <ThemedText style={styles.stylesCount}>
            {totalStylesOwned}/{totalStylesAvailable} styles owned
          </ThemedText>
        </View>

        <View style={styles.stylesRow}>
          {MyCarConfig.styles.free.map((style) => (
            <View key={style.id} style={styles.styleChip}>
              <View
                style={[
                  styles.stylePreview,
                  { backgroundColor: getStyleGradient(style.id)[0] },
                ]}
              />
              <ThemedText style={styles.styleName}>{style.name}</ThemedText>
              <ThemedText style={styles.styleTag}>Included</ThemedText>
            </View>
          ))}
        </View>

        {unlockedPremiumCount > 0 ? (
          <ThemedText style={styles.stylesHint}>
            Premium unlocked: {unlockedPremiumCount} • Explore more in the Style
            Gallery
          </ThemedText>
        ) : (
          <ThemedText style={styles.stylesHint}>
            Unlock premium styles to change backgrounds, lighting, and vibes.
          </ThemedText>
        )}

        <Pressable style={styles.stylesButton} onPress={handleChangeStyle}>
          <IconSymbol name="sparkles" size={18} color="#FFF" />
          <ThemedText style={styles.stylesButtonText}>Browse Styles</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.features}>
        <ThemedText type="subtitle" style={styles.featuresTitle}>
          Why drivers love MyCar Portrait
        </ThemedText>

        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <IconSymbol name="eye.slash.fill" size={32} color="#007AFF" />
            <ThemedText style={styles.featureText}>Privacy First</ThemedText>
            <ThemedText style={styles.featureSubtext}>
              Automatic plate & face blur
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="wand.and.stars" size={32} color="#007AFF" />
            <ThemedText style={styles.featureText}>AI Cutout</ThemedText>
            <ThemedText style={styles.featureSubtext}>
              Clean background removal
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="apps.iphone" size={32} color="#007AFF" />
            <ThemedText style={styles.featureText}>Widget Ready</ThemedText>
            <ThemedText style={styles.featureSubtext}>
              iPhone + CarPlay support
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="paintbrush.fill" size={32} color="#007AFF" />
            <ThemedText style={styles.featureText}>12+ Styles</ThemedText>
            <ThemedText style={styles.featureSubtext}>
              Premium looks & vibes
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyState: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    gap: 16,
  },
  placeholderContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 24,
  },
  emptyDescription: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  portraitSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  portraitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 18,
    color: "#111827",
  },
  styleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  styleBadgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  portraitFrame: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  portraitGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 20,
  },
  portraitImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  unlockBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 16,
  },
  unlockContent: {
    flex: 1,
  },
  unlockTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  unlockDescription: {
    fontSize: 14,
    color: "#92400E",
  },
  unlockPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#B45309",
  },
  creditsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#111827",
    gap: 16,
  },
  creditsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  creditsLabel: {
    color: "#FACC15",
    fontWeight: "600",
  },
  addCreditsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addCreditsText: {
    color: "#FFF",
    fontWeight: "600",
  },
  creditsValue: {
    fontSize: 42,
    color: "#FFF",
  },
  creditsSubtext: {
    color: "#E5E7EB",
  },
  widgetCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    gap: 16,
  },
  widgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  widgetTitle: {
    fontSize: 16,
    flex: 1,
  },
  widgetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(52,199,89,0.15)",
  },
  widgetBadgeText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
  },
  widgetDescription: {
    color: "#4B5563",
    lineHeight: 20,
  },
  widgetStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
  },
  statusPillText: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "500",
  },
  widgetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
  },
  widgetButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  stylesCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
    gap: 16,
  },
  stylesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stylesTitle: {
    fontSize: 16,
  },
  stylesCount: {
    color: "#6B7280",
    fontSize: 13,
  },
  stylesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  styleChip: {
    width: "30%",
    minWidth: 100,
    alignItems: "center",
    gap: 8,
  },
  stylePreview: {
    width: 70,
    height: 70,
    borderRadius: 16,
  },
  styleName: {
    fontWeight: "600",
    color: "#1F2937",
  },
  styleTag: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  stylesHint: {
    color: "#4B5563",
  },
  stylesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 12,
  },
  stylesButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  features: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  featureItem: {
    width: "47%",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    gap: 8,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  featureSubtext: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});
