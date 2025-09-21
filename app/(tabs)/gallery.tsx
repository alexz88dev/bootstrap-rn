import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SEEDREAM_TRANSFORMS } from '@/services/seedream-ai';
import { FlatList, Pressable, StyleSheet, View, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import type { SeedreamTransform } from '@/services/seedream-ai';

export default function GalleryScreen() {
  const router = useRouter();
  const { user, credits, ownedStyles, purchaseStyle } = useApp();
  const [selectedTransform, setSelectedTransform] = useState<SeedreamTransform | null>(null);
  
  // Filter transforms based on user status
  const availableTransforms = SEEDREAM_TRANSFORMS.filter(transform => {
    if (!user?.isUnlocked) return false; // No transforms for free users
    if (!transform.isPremium) return true; // Free transforms always available
    return ownedStyles.includes(transform.id); // Premium only if owned
  });

  const lockedTransforms = SEEDREAM_TRANSFORMS.filter(transform => {
    if (!user?.isUnlocked) return true; // All locked for free users
    if (!transform.isPremium) return false; // Free transforms not locked
    return !ownedStyles.includes(transform.id); // Premium locked if not owned
  });

  const handleTransformPress = async (transform: SeedreamTransform) => {
    if (!user?.isUnlocked) {
      // Navigate to paywall for unlock
      router.push('/paywall');
      return;
    }

    if (transform.isPremium && !ownedStyles.includes(transform.id)) {
      // Show purchase dialog
      Alert.alert(
        `Unlock ${transform.name}`,
        `This style costs ${transform.creditsRequired} credits. You have ${credits} credits available.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock',
            onPress: async () => {
              if (credits >= transform.creditsRequired) {
                const success = await purchaseStyle(transform.id);
                if (success) {
                  Alert.alert('Success', `${transform.name} is now unlocked!`);
                  setSelectedTransform(transform);
                }
              } else {
                // Navigate to buy more credits
                router.push('/paywall');
              }
            },
          },
        ]
      );
    } else {
      // Already unlocked, select it
      setSelectedTransform(transform);
      // Navigate to upload with this transform selected
      router.push({
        pathname: '/upload',
        params: { transformId: transform.id },
      });
    }
  };

  const renderTransformItem = ({ item }: { item: SeedreamTransform }) => {
    const isUnlocked = !item.isPremium || ownedStyles.includes(item.id);
    const isSelected = selectedTransform?.id === item.id;
    const categoryColors = {
      style: '#007AFF',
      environment: '#34C759',
      artistic: '#FF9500',
      seasonal: '#AF52DE',
    };
    
    return (
      <Pressable 
        style={[
          styles.transformCard,
          isUnlocked && styles.transformCardUnlocked,
          isSelected && styles.transformCardSelected,
        ]}
        onPress={() => handleTransformPress(item)}
      >
        <View style={[styles.categoryBadge, { backgroundColor: categoryColors[item.category] }]}>
          <ThemedText style={styles.categoryText}>
            {item.category.toUpperCase()}
          </ThemedText>
        </View>

        <View style={styles.transformPreview}>
          {item.previewUrl ? (
            <Image source={{ uri: item.previewUrl }} style={styles.previewImage} />
          ) : (
            <View style={[styles.previewPlaceholder, { backgroundColor: categoryColors[item.category] + '20' }]}>
              <IconSymbol 
                name={isUnlocked ? "photo" : "lock.fill"} 
                size={32} 
                color={isUnlocked ? categoryColors[item.category] : "#999"} 
              />
            </View>
          )}
        </View>
        
        <ThemedText type="defaultSemiBold" style={styles.transformName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        
        {!item.isPremium ? (
          <ThemedText style={styles.includedBadge}>INCLUDED</ThemedText>
        ) : isUnlocked ? (
          <ThemedText style={styles.unlockedBadge}>UNLOCKED</ThemedText>
        ) : (
          <View style={styles.costContainer}>
            <IconSymbol name="star.fill" size={16} color="#FFD700" />
            <ThemedText style={styles.costText}>
              {item.creditsRequired}
            </ThemedText>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          AI Style Gallery
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Powered by Seedream 4.0 AI
        </ThemedText>
      </ThemedView>

      {user?.isUnlocked && (
        <ThemedView style={styles.creditsHeader}>
          <View style={styles.creditsInfo}>
            <IconSymbol name="star.fill" size={24} color="#FFD700" />
            <ThemedText type="defaultSemiBold" style={styles.creditsText}>
              {credits} Credits Available
            </ThemedText>
          </View>
          <Pressable 
            style={styles.buyCreditsButton}
            onPress={() => router.push('/paywall')}
          >
            <ThemedText style={styles.buyCreditsText}>Buy More</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      <FlatList
        data={[...availableTransforms, ...lockedTransforms]}
        renderItem={renderTransformItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        ListHeaderComponent={() => (
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle">
              {user?.isUnlocked ? 'AI Transformations' : 'Unlock to Access'}
            </ThemedText>
            <ThemedText style={styles.sectionSubtext}>
              {user?.isUnlocked 
                ? `${availableTransforms.length} available • ${lockedTransforms.length} locked`
                : 'Unlock the app to access AI styles'
              }
            </ThemedText>
          </ThemedView>
        )}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="lock.fill" size={48} color="#999" />
            <ThemedText style={styles.emptyText}>
              Unlock the app to access AI styles
            </ThemedText>
            <Pressable 
              style={styles.unlockButton}
              onPress={() => router.push('/paywall')}
            >
              <ThemedText style={styles.unlockButtonText}>
                Unlock Now for $8.99
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}
        ListFooterComponent={() => availableTransforms.length > 0 && (
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              New AI styles added monthly!
            </ThemedText>
            <ThemedText style={styles.footerSubtext}>
              Each style uses advanced AI prompts for perfect results
            </ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  creditsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  creditsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsText: {
    fontSize: 18,
  },
  buyCreditsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buyCreditsText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  transformCard: {
    width: '48%',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  transformCardUnlocked: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  transformCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  transformPreview: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transformName: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    minHeight: 36,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  costText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  includedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unlockedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  unlockButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  unlockButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});