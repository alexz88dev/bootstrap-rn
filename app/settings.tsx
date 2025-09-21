import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useApp } from '@/contexts/AppContext';
import { notifications } from '@/services/notifications';
import { widgetManager } from '@/services/widget-manager';
import { 
  Alert,
  Linking,
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Switch,
  View 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Application from 'expo-application';
import { MyCarConfig } from '@/config/mycar-config';

export default function SettingsScreen() {
  const router = useRouter();
  const app = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleRestorePurchases = async () => {
    Alert.alert(
      'Restore Purchases',
      'This will restore any previous purchases made with your Apple ID.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            await app.restorePurchases();
            Alert.alert('Success', 'Purchases have been restored.');
          },
        },
      ]
    );
  };

  const handleClearWidget = async () => {
    Alert.alert(
      'Clear Widget Data',
      'This will remove your car portrait from the widget. You can add it again anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await widgetManager.clearWidget();
            Alert.alert('Widget Cleared', 'Your widget data has been removed.');
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await app.signOut();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Type DELETE to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Proceed',
                  style: 'destructive',
                  onPress: async () => {
                    // In production, implement actual account deletion
                    await app.signOut();
                    router.replace('/onboarding');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL(MyCarConfig.support.privacyUrl);
  };

  const openTermsOfService = () => {
    Linking.openURL(MyCarConfig.support.termsUrl);
  };

  const openSupport = () => {
    Linking.openURL(`mailto:${MyCarConfig.support.email}`);
  };

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person.circle.fill',
          label: 'User ID',
          value: app.user?.id?.substring(0, 8) || 'Not signed in',
          action: null,
        },
        {
          icon: 'star.circle.fill',
          label: 'Credits',
          value: `${app.credits} credits`,
          action: () => router.push('/paywall'),
        },
        {
          icon: app.isUnlocked ? 'lock.open.fill' : 'lock.fill',
          label: 'Premium Status',
          value: app.isUnlocked ? 'Unlocked' : 'Free',
          action: !app.isUnlocked ? () => router.push('/paywall') : null,
        },
      ],
    },
    {
      title: 'Widget',
      items: [
        {
          icon: 'apps.iphone',
          label: 'Widget Status',
          value: app.isWidgetConfigured ? 'Configured' : 'Not configured',
          action: () => router.push('/widget-setup'),
        },
        {
          icon: 'car.fill',
          label: 'CarPlay',
          value: app.isCarPlayConnected ? 'Connected' : 'Not connected',
          action: null,
        },
        {
          icon: 'trash.fill',
          label: 'Clear Widget Data',
          value: null,
          action: handleClearWidget,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'bell.fill',
          label: 'Notifications',
          value: null,
          toggle: true,
          toggleValue: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'chart.bar.fill',
          label: 'Analytics',
          value: null,
          toggle: true,
          toggleValue: analyticsEnabled,
          onToggle: setAnalyticsEnabled,
        },
      ],
    },
    {
      title: 'Purchases',
      items: [
        {
          icon: 'arrow.clockwise',
          label: 'Restore Purchases',
          value: null,
          action: handleRestorePurchases,
        },
        {
          icon: 'creditcard.fill',
          label: 'Buy More Credits',
          value: null,
          action: () => router.push('/paywall'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'questionmark.circle.fill',
          label: 'Contact Support',
          value: null,
          action: openSupport,
        },
        {
          icon: 'doc.text.fill',
          label: 'Privacy Policy',
          value: null,
          action: openPrivacyPolicy,
        },
        {
          icon: 'doc.text.fill',
          label: 'Terms of Service',
          value: null,
          action: openTermsOfService,
        },
        {
          icon: 'star.fill',
          label: 'Rate App',
          value: null,
          action: () => {
            // In production, open App Store review page
            Alert.alert('Thank You!', 'Your feedback helps us improve.');
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'info.circle.fill',
          label: 'Version',
          value: Application.nativeApplicationVersion || '1.0.0',
          action: null,
        },
        {
          icon: 'hammer.fill',
          label: 'Build',
          value: Application.nativeBuildVersion || '1',
          action: null,
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          icon: 'arrow.right.square.fill',
          label: 'Sign Out',
          value: null,
          action: handleSignOut,
          destructive: true,
        },
        {
          icon: 'trash.fill',
          label: 'Delete Account',
          value: null,
          action: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>
      </ThemedView>

      {sections.map((section, sectionIndex) => (
        <ThemedView key={sectionIndex} style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
          
          {section.items.map((item, itemIndex) => (
            <Pressable
              key={itemIndex}
              style={styles.item}
              onPress={item.action}
              disabled={!item.action && !item.toggle}
            >
              <View style={styles.itemLeft}>
                <IconSymbol 
                  name={item.icon} 
                  size={24} 
                  color={item.destructive ? '#FF3B30' : '#007AFF'} 
                />
                <ThemedText 
                  style={[
                    styles.itemLabel,
                    item.destructive && styles.destructiveText
                  ]}
                >
                  {item.label}
                </ThemedText>
              </View>
              
              <View style={styles.itemRight}>
                {item.value && (
                  <ThemedText style={styles.itemValue}>
                    {item.value}
                  </ThemedText>
                )}
                {item.toggle && (
                  <Switch
                    value={item.toggleValue}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#767577', true: '#007AFF' }}
                    thumbColor="#FFF"
                  />
                )}
                {item.action && !item.toggle && (
                  <IconSymbol 
                    name="chevron.right" 
                    size={16} 
                    color="#C7C7CC" 
                  />
                )}
              </View>
            </Pressable>
          ))}
        </ThemedView>
      ))}

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Made with ❤️ for car enthusiasts
        </ThemedText>
        <ThemedText style={styles.footerText}>
          © 2025 MyCar Portrait
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  itemLabel: {
    fontSize: 16,
  },
  destructiveText: {
    color: '#FF3B30',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});