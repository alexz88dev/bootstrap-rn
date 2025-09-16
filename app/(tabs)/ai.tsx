import { StyleSheet, ScrollView } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { AIButton } from "@/components/ai-button";
import { OCRScanner } from "@/components/ocr-scanner";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function AIScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedView style={styles.header}>
          <IconSymbol name="sparkles" size={28} color="#007AFF" />
          <ThemedText type="title" style={styles.headerText}>
            AI Features
          </ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.description}>
          Test our AI capabilities - both simulated local AI and native OCR
        </ThemedText>

        <ThemedView style={styles.featureSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            💡 Local AI
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Simulated on-device AI responses
          </ThemedText>
          <AIButton />
        </ThemedView>

        <ThemedView style={styles.divider} />

        <ThemedView style={styles.featureSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📸 Document OCR
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Native iOS document scanner with text extraction
          </ThemedText>
          <OCRScanner />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingTop: 60,
    paddingBottom: 40,
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
    paddingBottom: 20,
    lineHeight: 20,
  },
  featureSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 8,
  },
  sectionDescription: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 40,
    marginVertical: 20,
  },
});