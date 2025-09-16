import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

// Simulated local AI responses
const AI_FACTS = [
  "Allergies affect over 50 million Americans each year, making them the 6th leading cause of chronic illness.",
  "The most common food allergies in adults are shellfish, tree nuts, peanuts, and fish.",
  "Seasonal allergies can develop at any age, even if you've never had them before.",
  "About 40% of children with food allergies are allergic to more than one food.",
  "Local honey may help with seasonal allergies by exposing you to small amounts of local pollen.",
  "Pet allergies are actually caused by proteins in pet dander, saliva, and urine, not the fur itself.",
  "Dust mites are the most common trigger of year-round allergies and asthma.",
  "Allergic reactions can range from mild symptoms to life-threatening anaphylaxis.",
];

export function AIButton() {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    setLoading(true);
    setResponse("");

    // Simulate processing time for local AI
    await new Promise(resolve => setTimeout(resolve, 800));

    // Pick a random fact (simulating local AI response)
    const randomFact = AI_FACTS[Math.floor(Math.random() * AI_FACTS.length)];
    setResponse(randomFact);
    
    setLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={askAI}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText style={styles.buttonText}>
            🤖 Ask Local AI
          </ThemedText>
        )}
      </TouchableOpacity>

      {response ? (
        <ThemedView style={styles.responseContainer}>
          <ThemedText style={styles.responseLabel}>AI Response:</ThemedText>
          <ThemedText style={styles.responseText}>{response}</ThemedText>
          <ThemedText style={styles.privacyNote}>
            💡 This runs locally on your device. No data sent to servers!
          </ThemedText>
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  responseContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
    width: "100%",
  },
  responseLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontWeight: "600",
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  privacyNote: {
    marginTop: 15,
    fontSize: 12,
    color: "#007AFF",
    fontStyle: "italic",
  },
});