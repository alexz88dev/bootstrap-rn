import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { apple } from "@react-native-ai/apple";
import { generateText } from "ai";

export function AIButton() {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    setLoading(true);
    setResponse("");

    try {
      if (Platform.OS === 'ios') {
        // Try to use on-device Apple Intelligence
        const { text } = await generateText({
          model: apple(),
          prompt: "Tell me an interesting fact about allergies in one sentence.",
        });
        setResponse(text);
      } else {
        // Android fallback - just demo
        setResponse("Did you know that allergies affect over 50 million Americans each year?");
      }
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback response
      setResponse("Allergies are your immune system's overreaction to harmless substances like pollen or pet dander.");
    } finally {
      setLoading(false);
    }
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
});
