import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MyCarConfig } from '@/config/mycar-config';
import { revenueCat } from '@/services/revenue-cat';
import { 
  ActivityIndicator,
  Alert,
  Dimensions, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  View 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export default function PaywallScreen() {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    
    try {
      const result = await revenueCat.purchase(MyCarConfig.iap.products.unlock.id);
      
      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          'Welcome to MyCar Portrait Premium! Your widget is now unlocked.',
          [
            { 
              text: 'Get Started', 
              onPress: () => router.replace('/(tabs)') 
            }
          ]
        );
      } else {
        if (result.error && !result.error.includes('cancelled')) {
          Alert.alert('Purchase Failed', result.error || 'Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to complete purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    
    try {
      const result = await revenueCat.restorePurchases();
      
      if (result.success && result.restored.length > 0) {
        Alert.alert(
          'Restored!',
          'Your purchases have been restored successfully.',
          [
            { 
              text: 'Continue', 
              onPress: () => router.replace('/(tabs)') 
            }
          ]
        );
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Close button */}
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <IconSymbol name="xmark" size={24} color="#FFF" />
        </Pressable>

        {/* Header content */}
        <View style={styles.headerContent}>
          <IconSymbol name="lock.open.fill" size={60} color="#FFF" />
          <ThemedText type="title" style={styles.headerTitle}>
            Unlock Full Experience
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            One-time purchase • Lifetime access
          </ThemedText>
        </View>
      </LinearGradient>

      <ThemedView style={styles.content}>
        {/* Price section */}
        <View style={styles.priceSection}>
          <ThemedText style={styles.priceLabel}>SPECIAL OFFER</ThemedText>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>$8.99</ThemedText>
            <ThemedText style={styles.priceDescription}>One-time payment</ThemedText>
          </View>
        </View>

        {/* What’s included */}
        <View style={styles.featuresSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            What’s Included
          </ThemedText>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>CarPlay Widget</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Display your car on iPhone & CarPlay
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>3 Premium Styles</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Minimal, Dark Gradient, and Asphalt included
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>100 Credits</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Unlock 3+ additional premium styles
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>Unlimited Processing</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  10 photos per day (vs 5 free)
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>Priority Support</ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Get help when you need it
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Comparison */}
        <View style={styles.comparisonSection}>
          <View style={styles.comparisonColumn}>
            <ThemedText style={styles.comparisonHeader}>FREE</ThemedText>
            <ThemedText style={styles.comparisonItem}>✓ Basic processing</ThemedText>
            <ThemedText style={styles.comparisonItem}>✓ 5 photos/day</ThemedText>
            <ThemedText style={[styles.comparisonItem, styles.disabled]}>✗ No widget</ThemedText>
            <ThemedText style={[styles.comparisonItem, styles.disabled]}>✗ No styles</ThemedText>
            <ThemedText style={[styles.comparisonItem, styles.disabled]}>✗ No credits</ThemedText>
          </View>
          
          <View style={[styles.comparisonColumn, styles.premiumColumn]}>
            <ThemedText style={styles.comparisonHeader}>PREMIUM</ThemedText>
            <ThemedText style={styles.comparisonItem}>✓ Priority processing</ThemedText>
            <ThemedText style={styles.comparisonItem}>✓ 10 photos/day</ThemedText>
            <ThemedText style={styles.comparisonItem}>✓ CarPlay widget</ThemedText>
            <ThemedText style={styles.comparisonItem}>✓ 3 styles included</ThemedText>
            <ThemedText style={styles.comparisonItem}>✓ 100 credits</ThemedText>
          </View>
        </View>

        {/* Purchase button */}
        <Pressable 
          style={[styles.purchaseButton, isPurchasing && styles.buttonDisabled]}
          onPress={handlePurchase}
          disabled={isPurchasing || isRestoring}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <IconSymbol name="lock.open.fill" size={20} color="#FFF" />
              <ThemedText style={styles.purchaseButtonText}>
                Unlock for $8.99
              </ThemedText>
            </>
          )}
        </Pressable>

        {/* Restore button */}
        <Pressable 
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isPurchasing || isRestoring}
        >
          {isRestoring ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <ThemedText style={styles.restoreButtonText}>
              Restore Purchase
            </ThemedText>
          )}
        </Pressable>

        {/* Terms */}
        <ThemedText style={styles.terms}>
          Payment will be charged to your Apple ID account at confirmation of purchase.
          {'\n\n'}
          By purchasing, you agree to our Terms of Service and Privacy Policy.
        </ThemedText>

        {/* Not now button */}
        <Pressable style={styles.notNowButton} onPress={handleClose}>
          <ThemedText style={styles.notNowText}>Not now</ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  priceSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  priceDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  comparisonSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  comparisonColumn: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  premiumColumn: {
    backgroundColor: '#E8F4FF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  comparisonHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  comparisonItem: {
    fontSize: 12,
    marginBottom: 8,
    color: '#333',
  },
  disabled: {
    color: '#999',
  },
  purchaseButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  restoreButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  restoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  notNowButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  notNowText: {
    color: '#666',
    fontSize: 16,
  },
});