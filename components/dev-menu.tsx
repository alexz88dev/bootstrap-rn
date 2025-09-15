import Constants from "expo-constants";
import * as Updates from "expo-updates";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import config, { getEnvironment, isDevelopment } from "../config";

/**
 * Development Menu Component
 * Provides quick access to dev tools and information
 * Only shows in development builds
 */
export function DevMenu() {
  if (!isDevelopment()) {
    return null;
  }

  const handleCheckForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          "Update Available",
          "A new update is available. Would you like to fetch and restart?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Update",
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
          ]
        );
      } else {
        Alert.alert("No Updates", "You're running the latest version!");
      }
    } catch (error) {
      Alert.alert("Update Check Failed", "Could not check for updates");
    }
  };

  const handleReloadApp = () => {
    Alert.alert("Reload App", "Are you sure you want to reload the app?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reload", onPress: () => Updates.reloadAsync() },
    ]);
  };

  const showEnvironmentInfo = () => {
    const info = `Environment: ${getEnvironment()}
API URL: ${config.API_BASE_URL}
Channel: ${config.CHANNEL}
Debug: ${config.DEBUG ? "ON" : "OFF"}
App Version: ${Constants.expoConfig?.version || "Unknown"}
Runtime Version: ${Constants.expoConfig?.runtimeVersion || "Unknown"}
Update ID: ${Updates.updateId || "Development"}
Is Embedded Update: ${Updates.isEmbeddedLaunch}`;

    Alert.alert("Environment Info", info);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠️ Dev Menu</Text>

      <TouchableOpacity style={styles.button} onPress={handleCheckForUpdates}>
        <Text style={styles.buttonText}>📡 Check Updates</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleReloadApp}>
        <Text style={styles.buttonText}>🔄 Reload App</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showEnvironmentInfo}>
        <Text style={styles.buttonText}>ℹ️ Environment Info</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
  },
});

export default DevMenu;
