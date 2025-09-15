import Constants from "expo-constants";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import config, { getEnvironment, isDevelopment } from "../config";

/**
 * A component that displays current environment information
 * Useful for debugging and development
 */
export function EnvironmentInfo() {
  if (!isDevelopment()) {
    return null; // Don't show in production
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Environment Info</Text>
      <Text style={styles.item}>Environment: {getEnvironment()}</Text>
      <Text style={styles.item}>API URL: {config.API_BASE_URL}</Text>
      <Text style={styles.item}>Channel: {config.CHANNEL}</Text>
      <Text style={styles.item}>Debug Mode: {config.DEBUG ? "ON" : "OFF"}</Text>
      <Text style={styles.item}>
        App Version: {Constants.expoConfig?.version || "Unknown"}
      </Text>
      <Text style={styles.item}>
        Runtime Version: {Constants.expoConfig?.runtimeVersion || "Unknown"}
      </Text>
      <Text style={styles.item}>
        Update ID: {Constants.expoConfig?.extra?.eas?.projectId || "Not set"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
    borderRadius: 5,
    minWidth: 200,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 12,
  },
  item: {
    color: "#fff",
    fontSize: 10,
    marginBottom: 2,
  },
});

export default EnvironmentInfo;
