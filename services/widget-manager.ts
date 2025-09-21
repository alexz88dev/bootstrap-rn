/**
 * Widget Manager Service
 * Handles communication between the app and iOS widget
 */

import { NativeModules, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { MyCarConfig } from '@/config/mycar-config';

// App Group identifier for sharing data between app and widget
const APP_GROUP_ID = 'group.com.alexzamfir.mycarportrait';

interface WidgetData {
  portraitUrl: string;
  styleId: string;
  lastUpdated: string;
}

class WidgetManagerService {
  private widgetModule: any;
  
  constructor() {
    // Try to get the native widget module if available
    this.widgetModule = NativeModules.ExpoWidgets || NativeModules.MyCarWidget;
  }

  /**
   * Check if widget is supported on this device
   */
  isSupported(): boolean {
    return Platform.OS === 'ios' && Platform.Version >= 14;
  }

  /**
   * Check if widget module is available
   */
  isAvailable(): boolean {
    return this.isSupported() && this.widgetModule !== undefined;
  }

  /**
   * Save portrait image for widget to display
   */
  async updateWidgetImage(imageUri: string, styleId: string): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('Widgets not supported on this platform');
      return false;
    }

    try {
      // Get the shared container URL
      const sharedContainerUrl = await this.getSharedContainerUrl();
      if (!sharedContainerUrl) {
        throw new Error('Could not access shared container');
      }

      // Define the destination path
      const destinationPath = `${sharedContainerUrl}portrait.png`;

      // Copy the image to shared container
      await FileSystem.copyAsync({
        from: imageUri,
        to: destinationPath,
      });

      // Save metadata
      const metadata: WidgetData = {
        portraitUrl: destinationPath,
        styleId,
        lastUpdated: new Date().toISOString(),
      };

      await this.saveWidgetData(metadata);

      // Trigger widget reload if available
      if (this.widgetModule?.reloadAllTimelines) {
        await this.widgetModule.reloadAllTimelines();
      }

      console.log('Widget image updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update widget image:', error);
      return false;
    }
  }

  /**
   * Get the shared container URL for app group
   */
  private async getSharedContainerUrl(): Promise<string | null> {
    if (Platform.OS !== 'ios') {
      return null;
    }

    // Use the app group container directory
    // This is a simplified approach - in production, you'd use a native module
    const documentsDirectory = FileSystem.documentDirectory;
    if (!documentsDirectory) {
      return null;
    }

    // Create a shared directory path
    // Note: This is a workaround. Proper implementation needs native module
    const sharedPath = documentsDirectory.replace('Documents/', `AppGroup/${APP_GROUP_ID}/`);
    
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(sharedPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(sharedPath, { intermediates: true });
    }

    return sharedPath;
  }

  /**
   * Save widget metadata
   */
  private async saveWidgetData(data: WidgetData): Promise<void> {
    const sharedContainerUrl = await this.getSharedContainerUrl();
    if (!sharedContainerUrl) {
      throw new Error('Could not access shared container');
    }

    const metadataPath = `${sharedContainerUrl}widget-data.json`;
    await FileSystem.writeAsStringAsync(
      metadataPath,
      JSON.stringify(data),
      { encoding: FileSystem.EncodingType.UTF8 }
    );
  }

  /**
   * Get current widget data
   */
  async getWidgetData(): Promise<WidgetData | null> {
    const sharedContainerUrl = await this.getSharedContainerUrl();
    if (!sharedContainerUrl) {
      return null;
    }

    const metadataPath = `${sharedContainerUrl}widget-data.json`;
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(metadataPath);
      if (!fileInfo.exists) {
        return null;
      }

      const content = await FileSystem.readAsStringAsync(metadataPath);
      return JSON.parse(content) as WidgetData;
    } catch (error) {
      console.error('Failed to read widget data:', error);
      return null;
    }
  }

  /**
   * Clear widget data and image
   */
  async clearWidget(): Promise<void> {
    const sharedContainerUrl = await this.getSharedContainerUrl();
    if (!sharedContainerUrl) {
      return;
    }

    try {
      // Delete portrait image
      const imagePath = `${sharedContainerUrl}portrait.png`;
      const imageInfo = await FileSystem.getInfoAsync(imagePath);
      if (imageInfo.exists) {
        await FileSystem.deleteAsync(imagePath);
      }

      // Delete metadata
      const metadataPath = `${sharedContainerUrl}widget-data.json`;
      const metadataInfo = await FileSystem.getInfoAsync(metadataPath);
      if (metadataInfo.exists) {
        await FileSystem.deleteAsync(metadataPath);
      }

      // Reload widget
      if (this.widgetModule?.reloadAllTimelines) {
        await this.widgetModule.reloadAllTimelines();
      }
    } catch (error) {
      console.error('Failed to clear widget:', error);
    }
  }

  /**
   * Check if user has added the widget to their home screen
   */
  async isWidgetAdded(): Promise<boolean> {
    if (this.widgetModule?.getInstalledWidgets) {
      try {
        const widgets = await this.widgetModule.getInstalledWidgets();
        return widgets && widgets.length > 0;
      } catch (error) {
        console.error('Failed to check widget status:', error);
      }
    }
    
    // Fallback: check if widget data exists
    const data = await this.getWidgetData();
    return data !== null;
  }

  /**
   * Open widget settings (iOS 14+)
   */
  async openWidgetSettings(): Promise<void> {
    if (Platform.OS === 'ios' && this.widgetModule?.openWidgetSettings) {
      try {
        await this.widgetModule.openWidgetSettings();
      } catch (error) {
        console.error('Failed to open widget settings:', error);
        // Fallback: Show instructions
        this.showWidgetInstructions();
      }
    } else {
      this.showWidgetInstructions();
    }
  }

  /**
   * Show instructions for adding widget
   */
  private showWidgetInstructions(): void {
    // This would typically show an alert or navigate to instructions screen
    console.log('Widget Instructions:');
    console.log('1. Long press on your home screen');
    console.log('2. Tap the + button in the top corner');
    console.log('3. Search for "MyCar"');
    console.log('4. Select the widget size');
    console.log('5. Tap "Add Widget"');
  }

  /**
   * Request widget refresh
   */
  async refreshWidget(): Promise<void> {
    if (this.widgetModule?.reloadAllTimelines) {
      try {
        await this.widgetModule.reloadAllTimelines();
        console.log('Widget refresh requested');
      } catch (error) {
        console.error('Failed to refresh widget:', error);
      }
    }
  }

  /**
   * Get widget configuration for different sizes
   */
  getWidgetConfigurations() {
    return {
      small: {
        width: 155,
        height: 155,
        supportedOn: ['iPhone', 'iPad'],
      },
      medium: {
        width: 329,
        height: 155,
        supportedOn: ['iPhone', 'iPad'],
      },
      large: {
        width: 329,
        height: 345,
        supportedOn: ['iPhone', 'iPad'],
      },
      carplay: {
        width: 120,
        height: 120,
        supportedOn: ['CarPlay'],
      },
    };
  }

  /**
   * Check CarPlay availability
   */
  async isCarPlayAvailable(): Promise<boolean> {
    if (this.widgetModule?.isCarPlayConnected) {
      try {
        return await this.widgetModule.isCarPlayConnected();
      } catch (error) {
        console.error('Failed to check CarPlay status:', error);
      }
    }
    return false;
  }

  /**
   * Mock update for development
   */
  async mockUpdateWidget(imageUri: string, styleId: string): Promise<boolean> {
    console.log('[MOCK] Updating widget with image:', imageUri);
    console.log('[MOCK] Style:', styleId);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[MOCK] Widget updated successfully!');
    return true;
  }
}

// Export singleton instance
export const widgetManager = new WidgetManagerService();
export default widgetManager;