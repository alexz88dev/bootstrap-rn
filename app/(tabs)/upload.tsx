import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MyCarConfig } from '@/config/mycar-config';
import { 
  ActivityIndicator, 
  Alert, 
  Image, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  View 
} from 'react-native';
import { useState } from 'react';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleCameraPress = () => {
    // TODO: Implement camera capture
    Alert.alert('Camera', 'Camera functionality will be implemented with expo-camera');
  };

  const handleGalleryPress = () => {
    // TODO: Implement gallery picker
    Alert.alert('Gallery', 'Gallery functionality will be implemented with expo-image-picker');
  };

  const handleProcessImage = () => {
    setProcessingState('uploading');
    setProcessingProgress(0);
    
    // Simulate processing
    setTimeout(() => {
      setProcessingState('processing');
      setProcessingProgress(33);
    }, 1000);
    
    setTimeout(() => {
      setProcessingProgress(66);
    }, 2000);
    
    setTimeout(() => {
      setProcessingState('complete');
      setProcessingProgress(100);
      // TODO: Set actual processed image
    }, 3000);
  };

  const renderContent = () => {
    switch (processingState) {
      case 'idle':
        return (
          <ThemedView style={styles.uploadContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol name="car.fill" size={80} color="#007AFF" />
            </View>
            
            <ThemedText type="title" style={styles.uploadTitle}>
              Upload Your Car Photo
            </ThemedText>
            
            <ThemedText style={styles.uploadDescription}>
              Take a photo or choose from your gallery.{'\n'}
              We'll automatically blur license plates and remove the background.
            </ThemedText>

            <View style={styles.buttonContainer}>
              <Pressable style={styles.uploadButton} onPress={handleCameraPress}>
                <IconSymbol name="camera.fill" size={24} color="#FFF" />
                <ThemedText style={styles.uploadButtonText}>Take Photo</ThemedText>
              </Pressable>
              
              <Pressable style={styles.uploadButtonSecondary} onPress={handleGalleryPress}>
                <IconSymbol name="photo.fill" size={24} color="#007AFF" />
                <ThemedText style={styles.uploadButtonTextSecondary}>Choose from Gallery</ThemedText>
              </Pressable>
            </View>

            <ThemedView style={styles.tipsContainer}>
              <ThemedText type="defaultSemiBold" style={styles.tipsTitle}>
                📸 Photo Tips
              </ThemedText>
              <ThemedText style={styles.tipText}>• Best results with ¾ angle view</ThemedText>
              <ThemedText style={styles.tipText}>• Good lighting (outdoor preferred)</ThemedText>
              <ThemedText style={styles.tipText}>• Entire car visible in frame</ThemedText>
              <ThemedText style={styles.tipText}>• Avoid busy backgrounds</ThemedText>
            </ThemedView>
          </ThemedView>
        );
      
      case 'uploading':
      case 'processing':
        return (
          <ThemedView style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            
            <ThemedText type="subtitle" style={styles.processingTitle}>
              {processingState === 'uploading' ? 'Uploading...' : 'Processing Your Car'}
            </ThemedText>
            
            <ThemedText style={styles.processingDescription}>
              {processingState === 'uploading' 
                ? 'Uploading your photo securely...'
                : 'Removing background and enhancing...'}
            </ThemedText>

            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${processingProgress}%` }
                ]} 
              />
            </View>

            <ThemedView style={styles.processingSteps}>
              <View style={styles.stepItem}>
                <IconSymbol 
                  name="checkmark.circle.fill" 
                  size={20} 
                  color={processingProgress >= 33 ? "#4CAF50" : "#CCC"} 
                />
                <ThemedText style={styles.stepText}>Upload Complete</ThemedText>
              </View>
              
              <View style={styles.stepItem}>
                <IconSymbol 
                  name={processingProgress >= 66 ? "checkmark.circle.fill" : "circle"} 
                  size={20} 
                  color={processingProgress >= 66 ? "#4CAF50" : "#CCC"} 
                />
                <ThemedText style={styles.stepText}>Blur License Plates</ThemedText>
              </View>
              
              <View style={styles.stepItem}>
                <IconSymbol 
                  name={processingProgress >= 100 ? "checkmark.circle.fill" : "circle"} 
                  size={20} 
                  color={processingProgress >= 100 ? "#4CAF50" : "#CCC"} 
                />
                <ThemedText style={styles.stepText}>Remove Background</ThemedText>
              </View>
            </ThemedView>
          </ThemedView>
        );
      
      case 'complete':
        return (
          <ThemedView style={styles.completeContainer}>
            <ThemedText type="title" style={styles.completeTitle}>
              Perfect! 🎉
            </ThemedText>
            
            <ThemedText style={styles.completeDescription}>
              Your car portrait is ready. Preview it in a widget frame!
            </ThemedText>

            <View style={styles.previewContainer}>
              <ThemedText style={styles.previewPlaceholder}>
                [Processed Car Image]
              </ThemedText>
            </View>

            <Pressable style={styles.previewButton}>
              <IconSymbol name="apps.iphone" size={20} color="#FFF" />
              <ThemedText style={styles.previewButtonText}>
                Preview in Widget
              </ThemedText>
            </Pressable>

            <Pressable style={styles.retakeButton} onPress={() => setProcessingState('idle')}>
              <ThemedText style={styles.retakeButtonText}>
                Take Another Photo
              </ThemedText>
            </Pressable>
          </ThemedView>
        );
      
      case 'error':
        return (
          <ThemedView style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle.fill" size={60} color="#FF3B30" />
            <ThemedText type="subtitle" style={styles.errorTitle}>
              Processing Failed
            </ThemedText>
            <ThemedText style={styles.errorDescription}>
              We couldn't process your photo. Please try again with a different image.
            </ThemedText>
            <Pressable style={styles.retryButton} onPress={() => setProcessingState('idle')}>
              <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
            </Pressable>
          </ThemedView>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  uploadContainer: {
    paddingTop: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadTitle: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  uploadButtonSecondary: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  uploadButtonTextSecondary: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    padding: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    paddingLeft: 12,
  },
  processingContainer: {
    paddingTop: 120,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 24,
    marginTop: 32,
    marginBottom: 12,
  },
  processingDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  processingSteps: {
    width: '100%',
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    fontSize: 16,
    color: '#666',
  },
  completeContainer: {
    paddingTop: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 32,
    marginBottom: 16,
  },
  completeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  previewPlaceholder: {
    color: '#999',
    fontSize: 18,
  },
  previewButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  previewButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  retakeButton: {
    paddingVertical: 12,
  },
  retakeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    paddingTop: 120,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    marginTop: 24,
    marginBottom: 12,
    color: '#FF3B30',
  },
  errorDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});