/**
 * Push Notifications Service for MyCar Portrait
 * Handles all push notification logic and scheduling
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MyCarConfig } from '@/config/mycar-config';
import { analytics } from './analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification types
export type NotificationType = 
  | 'welcome'
  | 'portrait_waiting'
  | 'add_widget'
  | 'garage_ready'
  | 'new_styles'
  | 'credits_low'
  | 'processing_complete'
  | 'purchase_thank_you';

interface ScheduledNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledAt: Date;
  data?: any;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationsService {
  private pushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  private initialized = false;

  /**
   * Initialize notifications service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Push notification permissions not granted');
        return;
      }

      // Get push token
      this.pushToken = await this.registerForPushNotifications();
      
      // Set up notification listeners
      this.setupListeners();

      // Schedule re-engagement notifications if first time
      const isFirstLaunch = await this.isFirstLaunch();
      if (isFirstLaunch) {
        await this.scheduleOnboardingNotifications();
      }

      this.initialized = true;
      console.log('Notifications service initialized');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get token
   */
  private async registerForPushNotifications(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: MyCarConfig.api.supabase.url ? undefined : '8385d647-791b-4998-b66e-c6b11e4939a0',
      });
      
      console.log('Push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Set up notification listeners
   */
  private setupListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      const type = notification.request.content.data?.type as NotificationType;
      if (type) {
        analytics.trackNotificationTapped(type);
      }
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const type = response.notification.request.content.data?.type as NotificationType;
      if (type) {
        analytics.trackNotificationTapped(type);
        this.handleNotificationResponse(type, response.notification.request.content.data);
      }
    });
  }

  /**
   * Handle notification response based on type
   */
  private handleNotificationResponse(type: NotificationType, data?: any): void {
    // Navigate to appropriate screen based on notification type
    switch (type) {
      case 'portrait_waiting':
      case 'processing_complete':
        // Navigate to home/gallery
        break;
      case 'add_widget':
      case 'garage_ready':
        // Navigate to widget setup
        break;
      case 'new_styles':
        // Navigate to style gallery
        break;
      case 'credits_low':
        // Navigate to purchase screen
        break;
      case 'purchase_thank_you':
        // Navigate to home
        break;
      default:
        break;
    }
  }

  /**
   * Schedule onboarding/re-engagement notifications
   */
  async scheduleOnboardingNotifications(): Promise<void> {
    const notifications = MyCarConfig.notifications.reengagement;
    
    for (const notif of notifications) {
      await this.scheduleNotification({
        type: 'portrait_waiting',
        title: notif.title,
        body: notif.body,
        trigger: {
          seconds: notif.delay / 1000,
        },
      });
    }
    
    await this.markOnboardingNotificationsScheduled();
  }

  /**
   * Schedule a single notification
   */
  async scheduleNotification(params: {
    type: NotificationType;
    title: string;
    body: string;
    trigger: Notifications.NotificationTriggerInput;
    data?: any;
  }): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          data: {
            type: params.type,
            ...params.data,
          },
          sound: true,
        },
        trigger: params.trigger,
      });

      await analytics.trackNotificationScheduled(params.type);
      
      console.log(`Notification scheduled: ${params.type} with id ${id}`);
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Schedule immediate notification
   */
  async sendImmediateNotification(params: {
    type: NotificationType;
    title: string;
    body: string;
    data?: any;
  }): Promise<void> {
    await this.scheduleNotification({
      ...params,
      trigger: null, // Immediate
    });
  }

  /**
   * Schedule monthly style updates notification
   */
  async scheduleMonthlyStyleNotification(): Promise<void> {
    const config = MyCarConfig.notifications.monthly;
    
    await this.scheduleNotification({
      type: 'new_styles',
      title: config.title,
      body: config.body,
      trigger: {
        repeats: true,
        day: 1, // First day of month
        hour: 10,
        minute: 0,
      },
    });
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    return scheduled.map(notif => ({
      id: notif.identifier,
      type: notif.content.data?.type as NotificationType || 'welcome',
      title: notif.content.title || '',
      body: notif.content.body || '',
      scheduledAt: new Date(notif.trigger as any),
      data: notif.content.data,
    }));
  }

  /**
   * Send processing complete notification
   */
  async notifyProcessingComplete(): Promise<void> {
    await this.sendImmediateNotification({
      type: 'processing_complete',
      title: '✨ Your car portrait is ready!',
      body: 'Tap to preview your car in a widget',
    });
  }

  /**
   * Send purchase thank you notification
   */
  async notifyPurchaseComplete(productName: string): Promise<void> {
    await this.sendImmediateNotification({
      type: 'purchase_thank_you',
      title: '🎉 Thank you for your purchase!',
      body: `${productName} has been added to your account`,
    });
  }

  /**
   * Send low credits warning
   */
  async notifyLowCredits(remaining: number): Promise<void> {
    if (remaining <= 30 && remaining > 0) {
      await this.sendImmediateNotification({
        type: 'credits_low',
        title: '⚠️ Credits running low',
        body: `You have ${remaining} credits remaining. Get more to unlock new styles!`,
      });
    }
  }

  /**
   * Check if this is first app launch
   */
  private async isFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem('has_launched');
      if (!hasLaunched) {
        await AsyncStorage.setItem('has_launched', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  }

  /**
   * Mark onboarding notifications as scheduled
   */
  private async markOnboardingNotificationsScheduled(): Promise<void> {
    try {
      await AsyncStorage.setItem('onboarding_notifications_scheduled', 'true');
    } catch (error) {
      console.error('Error marking notifications scheduled:', error);
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Test notification (for development)
   */
  async sendTestNotification(): Promise<void> {
    await this.sendImmediateNotification({
      type: 'welcome',
      title: '🚗 Test Notification',
      body: 'This is a test notification from MyCar Portrait',
      data: { test: true },
    });
  }
}

// Export singleton instance
export const notifications = new NotificationsService();
export default notifications;