import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MyCarConfig } from '@/config/mycar-config';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

export default function GalleryScreen() {
  const [credits, setCredits] = useState(100);
  const [unlockedStyles, setUnlockedStyles] = useState(['minimal', 'dark_gradient', 'asphalt']);
  
  const allStyles = [
    ...MyCarConfig.styles.free,
    ...MyCarConfig.styles.premium,
  ];

  const renderStyleItem = ({ item }: { item: any }) => {
    const isUnlocked = unlockedStyles.includes(item.id);
    const isIncluded = item.included;
    
    return (
      <Pressable 
        style={[
          styles.styleCard,
          isUnlocked && styles.styleCardUnlocked
        ]}
        disabled={isUnlocked}
      >
        <View style={styles.stylePreview}>
          <IconSymbol 
            name={isUnlocked ? "checkmark.circle.fill" : "lock.fill"} 
            size={24} 
            color={isUnlocked ? "#4CAF50" : "#999"} 
          />
        </View>
        
        <ThemedText type="defaultSemiBold" style={styles.styleName}>
          {item.name || item.title}
        </ThemedText>
        
        {isIncluded ? (
          <ThemedText style={styles.includedBadge}>INCLUDED</ThemedText>
        ) : isUnlocked ? (
          <ThemedText style={styles.unlockedBadge}>UNLOCKED</ThemedText>
        ) : (
          <View style={styles.costContainer}>
            <IconSymbol name="star.fill" size={16} color="#FFD700" />
            <ThemedText style={styles.costText}>
              {item.cost || MyCarConfig.styles.creditCost}
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
          Style Gallery
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Transform your car with premium backgrounds
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.creditsHeader}>
        <View style={styles.creditsInfo}>
          <IconSymbol name="star.fill" size={24} color="#FFD700" />
          <ThemedText type="defaultSemiBold" style={styles.creditsText}>
            {credits} Credits Available
          </ThemedText>
        </View>
        <Pressable style={styles.buyCreditsButton}>
          <ThemedText style={styles.buyCreditsText}>Buy More</ThemedText>
        </Pressable>
      </ThemedView>

      <FlatList
        data={allStyles}
        renderItem={renderStyleItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        ListHeaderComponent={() => (
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle">Available Styles</ThemedText>
            <ThemedText style={styles.sectionSubtext}>
              Tap to preview • Unlock with credits
            </ThemedText>
          </ThemedView>
        )}
        ListFooterComponent={() => (
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              More styles coming soon!
            </ThemedText>
          </ThemedView>
        )}
      />

      {/* Credit Packs Modal/Sheet would go here */}
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
  styleCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleCardUnlocked: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  stylePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  styleName: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
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
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});