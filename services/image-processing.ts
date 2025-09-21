import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Alert, Platform } from 'react-native';
import { SupabaseService } from './supabase';
import { MyCarConfig } from '@/config/mycar-config';
import { getEnvironmentConfig } from '@/config';

export interface ProcessedImage {
  originalUrl?: string;
  processedUrl: string;
  processingTimeMs: number;
  hasLicensePlate: boolean;
  hasFaces: boolean;
}

class ImageProcessingService {
  // Camera permissions
  async requestCameraPermissions(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to take photos of your car.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // TODO: Open app settings
          }}
        ]
      );
      return false;
    }
    
    return true;
  }

  // Gallery permissions
  async requestGalleryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Gallery Permission Required',
        'Please allow gallery access to choose photos of your car.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // TODO: Open app settings
          }}
        ]
      );
      return false;
    }
    
    return true;
  }

  // Take photo with camera
  async takePhoto(): Promise<string | null> {
    const hasPermission = await this.requestCameraPermissions();
    if (!hasPermission) {
      return null;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }

    return null;
  }

  // Pick photo from gallery
  async pickImage(): Promise<string | null> {
    const hasPermission = await this.requestGalleryPermissions();
    if (!hasPermission) {
      return null;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }

    return null;
  }

  // Process image (remove background, blur plates)
  async processImage(
    imageUri: string, 
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<ProcessedImage | null> {
    const startTime = Date.now();
    
    try {
      // Update progress: uploading
      onProgress?.(10);

      // Check if we should use mock processing in development
      const config = getEnvironmentConfig();
      if (config.FEATURES?.MOCK_IMAGE_PROCESSING) {
        return this.mockProcessImage(imageUri, onProgress);
      }

      // Upload image to Supabase storage
      const uploadedUrl = await this.uploadImage(imageUri, userId);
      if (!uploadedUrl) {
        throw new Error('Failed to upload image');
      }

      // Update progress: processing
      onProgress?.(50);

      // Call Edge Function to process the image
      const processedUrl = await SupabaseService.processCutout(uploadedUrl, userId);
      if (!processedUrl) {
        throw new Error('Failed to process image');
      }

      // Update progress: complete
      onProgress?.(100);

      const processingTimeMs = Date.now() - startTime;

      // Save to assets
      await SupabaseService.saveAsset({
        user_id: userId,
        original_url: uploadedUrl,
        portrait_url: processedUrl,
        processing_time_ms: processingTimeMs,
      });

      return {
        originalUrl: uploadedUrl,
        processedUrl,
        processingTimeMs,
        hasLicensePlate: true, // Assume detected for now
        hasFaces: false,
      };
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Processing Failed', 'Unable to process your image. Please try again.');
      return null;
    }
  }

  // Upload image to Supabase storage
  private async uploadImage(imageUri: string, userId: string): Promise<string | null> {
    try {
      // Convert local URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}/${timestamp}.jpg`;

      // Upload to Supabase storage
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase.storage
        .from('portraits')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portraits')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  // Mock processing for development
  private async mockProcessImage(
    imageUri: string,
    onProgress?: (progress: number) => void
  ): Promise<ProcessedImage> {
    console.log('[MOCK] Processing image:', imageUri);

    // Simulate processing steps
    const steps = [
      { progress: 20, delay: 500, message: 'Uploading image...' },
      { progress: 40, delay: 800, message: 'Detecting license plates...' },
      { progress: 60, delay: 1000, message: 'Blurring sensitive areas...' },
      { progress: 80, delay: 1200, message: 'Removing background...' },
      { progress: 100, delay: 500, message: 'Finalizing...' },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      console.log(`[MOCK] ${step.message}`);
      onProgress?.(step.progress);
    }

    return {
      originalUrl: imageUri,
      processedUrl: imageUri, // In mock, return same image
      processingTimeMs: 3500,
      hasLicensePlate: true,
      hasFaces: false,
    };
  }

  // Apply style to processed image
  async applyStyle(
    processedImageUrl: string,
    styleId: string,
    userId: string
  ): Promise<string | null> {
    try {
      // This would call another Edge Function to apply the style
      // For now, return the same image
      console.log(`Applying style ${styleId} to image`);
      
      // In production, this would:
      // 1. Call Edge Function with processedImageUrl and styleId
      // 2. Get back a new URL with the style applied
      // 3. Save as a new asset variant
      
      return processedImageUrl;
    } catch (error) {
      console.error('Error applying style:', error);
      return null;
    }
  }

  // Check rate limits
  async checkRateLimit(userId: string, isUnlocked: boolean): Promise<boolean> {
    const limit = isUnlocked 
      ? MyCarConfig.imageProcessing.rateLimits.postUnlock
      : MyCarConfig.imageProcessing.rateLimits.preUnlock;

    // In production, this would check the processing_limits table
    // For now, always return true
    console.log(`Checking rate limit for user ${userId}: ${limit} per day`);
    return true;
  }

  // Validate image before processing
  validateImage(imageUri: string): { valid: boolean; error?: string } {
    // Basic validation
    if (!imageUri) {
      return { valid: false, error: 'No image provided' };
    }

    // In production, would check:
    // - File size (< 10MB)
    // - Image dimensions
    // - File type (JPEG, PNG)
    // - Image quality

    return { valid: true };
  }

  // Compress image if needed
  async compressImage(imageUri: string): Promise<string> {
    // In production, would use expo-image-manipulator to:
    // - Resize if too large
    // - Compress to target quality
    // - Convert to JPEG if needed
    
    return imageUri;
  }
}

// Export singleton instance
export const imageProcessing = new ImageProcessingService();
export default imageProcessing;