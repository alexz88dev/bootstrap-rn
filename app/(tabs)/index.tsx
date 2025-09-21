import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MyCarConfig } from '@/config/mycar-config';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

export default function HomeScreen() {
  const [hasPortrait, setHasPortrait] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('minimal');
  const [credits, setCredits] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {MyCarConfig.app.name}
        </ThemedText>
        <ThemedText style={styles.tagline}>
          {MyCarConfig.app.tagline}
        </ThemedText>
      </ThemedView>

      {!hasPortrait ? (
        <ThemedView style={styles.emptyState}>
          <View style={styles.placeholderContainer}>
            <IconSymbol name="car.fill" size={80} color="#999" />
          </View>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Car Portrait Yet
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Upload a photo of your car to create your personalized portrait and widget
          </ThemedText>
          <Pressable style={styles.primaryButton}>
            <IconSymbol name="camera.fill" size={20} color="#FFF" />
            <ThemedText style={styles.primaryButtonText}>
              Upload Photo
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <ThemedView style={styles.portraitContainer}>
          {/* Portrait preview will go here */}
          <View style={styles.portraitFrame}>
            <ThemedText style={styles.placeholderText}>Portrait Preview</ThemedText>
          </View>
          
          <ThemedView style={styles.styleInfo}>
            <ThemedText type="defaultSemiBold">Current Style: {currentStyle}</ThemedText>
            <Pressable style={styles.changeStyleButton}>
              <ThemedText style={styles.changeStyleText}>Change Style</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.actions}>
            <Pressable style={styles.actionButton}>
              <IconSymbol name="camera" size={20} color="#007AFF" />
              <ThemedText style={styles.actionText}>Change Photo</ThemedText>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <IconSymbol name="square.and.arrow.up" size={20} color="#007AFF" />
              <ThemedText style={styles.actionText}>Share</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      )}

      {!isUnlocked && (
        <ThemedView style={styles.unlockBanner}>
          <IconSymbol name="lock.fill" size={24} color="#FFD700" />
          <ThemedView style={styles.unlockContent}>
            <ThemedText type="defaultSemiBold" style={styles.unlockTitle}>
              Unlock Full Experience
            </ThemedText>
            <ThemedText style={styles.unlockDescription}>
              Widget + 3 Styles + 100 Credits
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.unlockPrice}>$8.99</ThemedText>
        </ThemedView>
      )}

      {isUnlocked && (
        <ThemedView style={styles.creditsBar}>
          <IconSymbol name="star.fill" size={20} color="#FFD700" />
          <ThemedText style={styles.creditsText}>
            {credits} Credits
          </ThemedText>
          <Pressable style={styles.addCreditsButton}>
            <ThemedText style={styles.addCreditsText}>Add More</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      <ThemedView style={styles.features}>
        <ThemedText type="subtitle" style={styles.featuresTitle}>
          Features
        </ThemedText>
        
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <IconSymbol name="eye.slash.fill" size={32} color="#007AFF" />
            <ThemedText style={styles.featureText}>Privacy First</ThemedText>
            <ThemedText style={styles.featureSubtext}>Auto-blur plates</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="wand.and.stars" size={32} color="#007AFF" />
            <ThemedText style={styles.featureText}>AI Cutout</ThemedText>
            <ThemedText style={styles.featureSubtext}>Perfect edges</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="apps.iphone" size={32} color="#007AFF" />
            <ThemedText style={styles.featureText}>Widget Ready</ThemedText>
            <ThemedText style={styles.featureSubtext}>iPhone & CarPlay</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="paintbrush.fill" size={32} color="#007AFF" />
            <ThemedText style={styles.featureText}>12+ Styles</ThemedText>
            <ThemedText style={styles.featureSubtext}>Premium looks</ThemedText>
          </View>
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
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  placeholderContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  portraitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  portraitFrame: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#999',
    fontSize: 18,
  },
  styleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  changeStyleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  changeStyleText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  actionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  unlockContent: {
    flex: 1,
    marginLeft: 12,
  },
  unlockTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  unlockDescription: {
    fontSize: 14,
    color: '#666',
  },
  unlockPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  creditsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 12,
    borderRadius: 10,
  },
  creditsText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  addCreditsButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  addCreditsText: {
    color: '#FFF',
    fontWeight: '600',
  },
  features: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  featuresTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  featureItem: {
    width: '45%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  featureSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});