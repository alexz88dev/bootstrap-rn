import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MyCarConfig } from '@/config/mycar-config';
import { 
  Dimensions, 
  Image,
  Pressable, 
  ScrollView, 
  StyleSheet, 
  View 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const WIDGET_SIZE = screenWidth * 0.4;

export default function PreviewScreen() {
  const router = useRouter();
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Get the 3 included styles
  const includedStyles = MyCarConfig.styles.free;
  const currentStyle = includedStyles[currentStyleIndex];

  useEffect(() => {
    // Auto-cycle through styles every 3 seconds
    const interval = setInterval(() => {
      if (isAnimating) {
        setCurrentStyleIndex((prev) => (prev + 1) % includedStyles.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleUnlock = () => {
    router.push('/paywall');
  };

  const handleStyleTap = (index: number) => {
    setIsAnimating(false);
    setCurrentStyleIndex(index);
  };

  const getStyleGradient = (styleId: string): string[] => {
    switch (styleId) {
      case 'minimal':
        return ['#F0F0F0', '#E0E0E0'];
      case 'dark_gradient':
        return ['#1A1A1A', '#3A3A3A'];
      case 'asphalt':
        return ['#2C3E50', '#34495E'];
      default:
        return ['#F0F0F0', '#E0E0E0'];
    }
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <ThemedView style={styles.header}>
        <IconSymbol name="sparkles" size={28} color="#FFD700" />
        <ThemedText type="title" style={styles.title}>
          Your Car is Ready!
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Preview how it looks in a widget
        </ThemedText>
      </ThemedView>

      {/* iPhone Mockup */}
      <View style={styles.iphoneMockup}>
        <View style={styles.iphoneScreen}>
          {/* Status bar */}
          <View style={styles.statusBar}>
            <ThemedText style={styles.time}>9:41</ThemedText>
            <View style={styles.statusIcons}>
              <IconSymbol name="wifi" size={14} color="#000" />
              <IconSymbol name="battery.100" size={20} color="#000" />
            </View>
          </View>

          {/* Lock screen with widget */}
          <View style={styles.lockScreen}>
            <ThemedText style={styles.dateText}>Monday, September 21</ThemedText>
            
            {/* Widget */}
            <View style={styles.widget}>
              <LinearGradient
                colors={getStyleGradient(currentStyle.id)}
                style={styles.widgetBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.carPlaceholder}>
                  <IconSymbol name="car.fill" size={60} color="#FFF" />
                </View>
              </LinearGradient>
              <ThemedText style={styles.widgetLabel}>MyCar</ThemedText>
            </View>

            <ThemedText style={styles.swipeText}>Swipe up to open</ThemedText>
          </View>
        </View>
      </View>

      {/* CarPlay Preview */}
      <View style={styles.carplaySection}>
        <ThemedText type="defaultSemiBold" style={styles.carplayTitle}>
          Also on CarPlay
        </ThemedText>
        <View style={styles.carplayMockup}>
          <View style={styles.carplayWidget}>
            <LinearGradient
              colors={getStyleGradient(currentStyle.id)}
              style={styles.carplayWidgetBg}
            >
              <IconSymbol name="car.fill" size={40} color="#FFF" />
            </LinearGradient>
          </View>
          <ThemedText style={styles.carplayLabel}>Your Car</ThemedText>
        </View>
      </View>

      {/* Style Selector */}
      <ThemedView style={styles.styleSection}>
        <ThemedText type="defaultSemiBold" style={styles.styleSectionTitle}>
          Included Styles
        </ThemedText>
        <View style={styles.styleSelector}>
          {includedStyles.map((style, index) => (
            <Pressable
              key={style.id}
              style={[
                styles.styleOption,
                currentStyleIndex === index && styles.styleOptionActive,
              ]}
              onPress={() => handleStyleTap(index)}
            >
              <LinearGradient
                colors={getStyleGradient(style.id)}
                style={styles.stylePreview}
              />
              <ThemedText style={styles.styleName}>{style.name}</ThemedText>
            </Pressable>
          ))}
        </View>
        <ThemedText style={styles.styleHint}>
          Tap to preview • Auto-cycling {isAnimating ? 'on' : 'off'}
        </ThemedText>
      </ThemedView>

      {/* Features */}
      <ThemedView style={styles.features}>
        <View style={styles.featureRow}>
          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
            <ThemedText style={styles.featureText}>License plate blurred</ThemedText>
          </View>
          <View style={styles.feature}>
            <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
            <ThemedText style={styles.featureText}>Background removed</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* CTA */}
      <ThemedView style={styles.ctaSection}>
        <ThemedText type="subtitle" style={styles.ctaTitle}>
          Ready to add your widget?
        </ThemedText>
        <ThemedText style={styles.ctaDescription}>
          Unlock to get your car on iPhone & CarPlay, plus 100 credits for more styles
        </ThemedText>
        
        <Pressable style={styles.unlockButton} onPress={handleUnlock}>
          <IconSymbol name="lock.open.fill" size={20} color="#FFF" />
          <ThemedText style={styles.unlockButtonText}>
            Unlock for $8.99
          </ThemedText>
        </Pressable>

        <View style={styles.includedBadge}>
          <ThemedText style={styles.includedText}>
            ✓ Widget  ✓ 3 Styles  ✓ 100 Credits
          </ThemedText>
        </View>
      </ThemedView>
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
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  iphoneMockup: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iphoneScreen: {
    width: screenWidth * 0.8,
    height: screenWidth * 1.6,
    backgroundColor: '#F8F8F8',
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#000',
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  lockScreen: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  widget: {
    alignItems: 'center',
  },
  widgetBackground: {
    width: WIDGET_SIZE,
    height: WIDGET_SIZE,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  swipeText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    color: '#999',
  },
  carplaySection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F8F8',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  carplayTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  carplayMockup: {
    alignItems: 'center',
  },
  carplayWidget: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  carplayWidgetBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carplayLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
  },
  styleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  styleSectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  styleSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  styleOption: {
    alignItems: 'center',
    opacity: 0.6,
  },
  styleOptionActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  stylePreview: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 8,
  },
  styleName: {
    fontSize: 12,
    fontWeight: '600',
  },
  styleHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  features: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  ctaTitle: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  unlockButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  unlockButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  includedBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  includedText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});