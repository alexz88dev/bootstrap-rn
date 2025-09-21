import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "expo-dev-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppProvider } from "@/contexts/AppContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen 
            name="onboarding" 
            options={{ headerShown: false, presentation: "fullScreenModal" }} 
          />
          <Stack.Screen 
            name="paywall" 
            options={{ headerShown: false, presentation: "modal" }} 
          />
          <Stack.Screen 
            name="preview" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="widget-setup" 
            options={{ headerShown: false, presentation: "modal" }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}
