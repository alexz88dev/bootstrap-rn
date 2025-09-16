import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { AIButton } from "@/components/ai-button";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function AIScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="sparkles" size={28} color="#007AFF" />
        <ThemedText type="title" style={styles.headerText}>
          Local AI Demo
        </ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.description}>
        Tap the button to run AI directly on your device.{"\n"}
        No internet required, your data stays private!
      </ThemedText>

      <AIButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerText: {
    marginLeft: 10,
  },
  description: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    paddingHorizontal: 30,
    paddingBottom: 30,
    lineHeight: 20,
  },
});