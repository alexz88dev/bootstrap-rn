/**
 * Image Processing Service
 * Handles image selection, upload, and AI-powered processing with Seedream 4.0
 */

import { config } from "@/config";
import { MyCarConfig } from "@/config/mycar-config";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import type { SeedreamTransform } from "./seedream-ai";
import { SEEDREAM_TRANSFORMS, seedreamAI } from "./seedream-ai";
import { SupabaseService } from "./supabase";

export interface ProcessedImage {
  originalUrl: string;
  processedUrl: string;
  thumbnailUrl: string;
  styleId: string;
  transformId: string;
  processingTimeMs: number;
  creditsUsed: number;
  hasLicensePlate: boolean;
  hasFaces: boolean;
}

export interface ProcessingOptions {
  userId: string;
  styleId: string;
  transformId: string;
  quality?: "standard" | "high" | "ultra";
  customPrompt?: string;
  preserveDetails?: boolean;
}

class ImageProcessingService {
  private currentProcessingJob: string | null = null;

  // Camera permissions
  async requestCameraPermissions(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access to take photos of your car.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              // TODO: Open app settings
            },
          },
        ]
      );
      return false;
    }

    return true;
  }

  // Gallery permissions
  async requestGalleryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Gallery Permission Required",
        "Please allow gallery access to choose photos of your car.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              // TODO: Open app settings
            },
          },
        ]
      );
      return false;
    }

    return true;
  }

  /**
   * Select image from camera or library
   */
  async selectImage(
    source: "camera" | "library"
  ): Promise<{ uri: string; base64: string } | null> {
    // Request permissions
    const hasPermission =
      source === "camera"
        ? await this.requestCameraPermissions()
        : await this.requestGalleryPermissions();

    if (!hasPermission) {
      return null;
    }

    try {
      // Launch image picker
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.9,
              base64: true,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.9,
              base64: true,
            });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (!asset.base64) {
          // If base64 is not available, read it from the file
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return { uri: asset.uri, base64 };
        }
        return { uri: asset.uri, base64: asset.base64 };
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }

    return null;
  }

  /**
   * Take photo with camera (convenience method)
   */
  async takePhoto(): Promise<{ uri: string; base64: string } | null> {
    return this.selectImage("camera");
  }

  /**
   * Pick photo from gallery (convenience method)
   */
  async pickImage(): Promise<{ uri: string; base64: string } | null> {
    return this.selectImage("library");
  }

  /**
   * Process image with Seedream 4.0 AI
   */
  async processImage(
    imageData: { uri: string; base64: string },
    options: ProcessingOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ProcessedImage | null> {
    const startTime = Date.now();
    const jobId = `job_${Date.now()}_${options.userId}`;
    this.currentProcessingJob = jobId;

    try {
      // Step 1: Validate image
      onProgress?.(5, "Validating image...");
      const validation = await seedreamAI.validateImage(imageData.base64);
      if (!validation.valid) {
        throw new Error(validation.reason || "Invalid image");
      }

      // Step 2: Check rate limits
      onProgress?.(10, "Checking limits...");
      const canProcess = await this.checkRateLimit(options.userId, true);
      if (!canProcess) {
        throw new Error("Daily processing limit reached");
      }

      // Step 3: Upload original to storage
      onProgress?.(20, "Uploading image...");
      const originalUrl = await this.uploadImage(
        imageData.base64,
        options.userId,
        "originals"
      );

      // Step 4: Apply Seedream transformation
      onProgress?.(40, "Applying AI transformation...");

      // Check if mock mode
      if (config.FEATURES?.MOCK_IMAGE_PROCESSING) {
        const mockResult = await this.mockSeedreamProcess(
          imageData.base64,
          options,
          onProgress
        );
        return mockResult;
      }

      const seedreamResult = await seedreamAI.transformCarImage({
        imageBase64: imageData.base64,
        transformId: options.transformId,
        customPrompt: options.customPrompt,
        outputQuality: options.quality || "high",
        preserveDetails: options.preserveDetails ?? true,
      });

      if (!seedreamResult.success) {
        throw new Error(seedreamResult.error || "Processing failed");
      }

      // Step 5: Save processed image
      onProgress?.(70, "Saving processed image...");
      const processedUrl = await this.uploadImage(
        seedreamResult.imageBase64!,
        options.userId,
        "processed"
      );

      // Step 6: Generate thumbnail
      onProgress?.(85, "Generating thumbnail...");
      const thumbnailUrl = await this.generateThumbnail(
        seedreamResult.imageBase64!,
        options.userId
      );

      // Step 7: Save to database
      onProgress?.(95, "Saving to database...");
      await this.saveProcessedImage({
        userId: options.userId,
        originalUrl,
        processedUrl,
        thumbnailUrl,
        styleId: options.styleId,
        transformId: options.transformId,
        processingTimeMs: Date.now() - startTime,
        creditsUsed: seedreamResult.creditsUsed,
      });

      onProgress?.(100, "Complete!");

      return {
        originalUrl,
        processedUrl,
        thumbnailUrl,
        styleId: options.styleId,
        transformId: options.transformId,
        processingTimeMs: Date.now() - startTime,
        creditsUsed: seedreamResult.creditsUsed,
        hasLicensePlate: true, // Seedream handles blurring via prompts
        hasFaces: false, // Seedream handles blurring via prompts
      };
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert(
        "Processing Failed",
        error instanceof Error
          ? error.message
          : "Unable to process your image. Please try again."
      );
      return null;
    } finally {
      this.currentProcessingJob = null;
    }
  }

  /**
   * Upload image to Supabase storage
   */
  private async uploadImage(
    base64: string,
    userId: string,
    folder: string
  ): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}/${folder}/${timestamp}.jpg`;

      // Convert base64 to blob
      const blob = this.base64ToBlob(base64, "image/jpeg");

      // Upload to Supabase storage
      const { supabase } = await import("./supabase");
      const { data, error } = await supabase.storage
        .from("portraits")
        .upload(filename, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload image");
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("portraits").getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  /**
   * Generate thumbnail for gallery
   */
  private async generateThumbnail(
    base64Image: string,
    userId: string
  ): Promise<string> {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      `data:image/jpeg;base64,${base64Image}`,
      [
        { resize: { width: 400 } }, // Thumbnail size
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!manipulatedImage.base64) {
      throw new Error("Failed to generate thumbnail");
    }

    return this.uploadImage(manipulatedImage.base64, userId, "thumbnails");
  }

  /**
   * Save processed image metadata to database
   */
  private async saveProcessedImage(data: any): Promise<void> {
    await SupabaseService.saveAsset({
      user_id: data.userId,
      original_url: data.originalUrl,
      portrait_url: data.processedUrl,
      thumbnail_url: data.thumbnailUrl,
      style_id: data.styleId,
      transform_id: data.transformId,
      processing_time_ms: data.processingTimeMs,
      credits_used: data.creditsUsed,
    });
  }

  /**
   * Mock Seedream processing for development
   */
  private async mockSeedreamProcess(
    base64: string,
    options: ProcessingOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ProcessedImage> {
    console.log("[MOCK] Processing with Seedream AI:", options.transformId);

    // Simulate processing steps
    const steps = [
      { progress: 50, delay: 500, message: "Detecting car features..." },
      { progress: 60, delay: 800, message: "Applying AI transformation..." },
      { progress: 70, delay: 1000, message: "Enhancing details..." },
      { progress: 80, delay: 800, message: "Finalizing style..." },
      { progress: 90, delay: 500, message: "Optimizing output..." },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      console.log(`[MOCK] ${step.message}`);
      onProgress?.(step.progress, step.message);
    }

    // In mock mode, return the original image
    const mockUrl = await this.uploadImage(base64, options.userId, "mock");
    const thumbnailUrl = await this.generateThumbnail(base64, options.userId);

    return {
      originalUrl: mockUrl,
      processedUrl: mockUrl,
      thumbnailUrl,
      styleId: options.styleId,
      transformId: options.transformId,
      processingTimeMs: 3500,
      creditsUsed: 0, // No credits in mock mode
      hasLicensePlate: true,
      hasFaces: false,
    };
  }

  /**
   * Process multiple styles in batch
   */
  async batchProcessStyles(
    imageData: { uri: string; base64: string },
    userId: string,
    transformIds: string[]
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];

    // Process with Seedream's batch capability
    const batchResults = await seedreamAI.batchTransform(
      imageData.base64,
      transformIds,
      {
        outputQuality: "high",
        preserveDetails: true,
      }
    );

    // Save each result
    for (const [transformId, result] of batchResults) {
      if (result.success && result.imageBase64) {
        const processedUrl = await this.uploadImage(
          result.imageBase64,
          userId,
          "batch"
        );

        const thumbnailUrl = await this.generateThumbnail(
          result.imageBase64,
          userId
        );

        const transform = SEEDREAM_TRANSFORMS.find((t) => t.id === transformId);

        results.push({
          originalUrl: imageData.uri,
          processedUrl,
          thumbnailUrl,
          styleId: `style_${transformId}`,
          transformId,
          processingTimeMs: result.processingTime,
          creditsUsed: result.creditsUsed,
          hasLicensePlate: true,
          hasFaces: false,
        });
      }
    }

    return results;
  }

  /**
   * Get available transforms for user
   */
  getAvailableTransforms(
    isUnlocked: boolean,
    ownedStyles: string[]
  ): SeedreamTransform[] {
    return seedreamAI.getAvailableTransforms(isUnlocked, ownedStyles);
  }

  /**
   * Check rate limits
   */
  async checkRateLimit(userId: string, isUnlocked: boolean): Promise<boolean> {
    const limit = isUnlocked
      ? MyCarConfig.imageProcessing.rateLimits.postUnlock
      : MyCarConfig.imageProcessing.rateLimits.preUnlock;

    // In production, this would check the processing_limits table
    // For now, always return true in development
    if (__DEV__) {
      console.log(
        `[DEV] Rate limit check for user ${userId}: ${limit} per day`
      );
      return true;
    }

    // Check with Supabase
    const todayCount = await SupabaseService.getProcessingCountToday(userId);
    return todayCount < limit;
  }

  /**
   * Cancel current processing job
   */
  cancelProcessing(): void {
    this.currentProcessingJob = null;
  }

  /**
   * Get processing status
   */
  getProcessingStatus(): { isProcessing: boolean; jobId: string | null } {
    return {
      isProcessing: this.currentProcessingJob !== null,
      jobId: this.currentProcessingJob,
    };
  }

  /**
   * Helper: Convert base64 to blob
   */
  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}

// Export singleton instance
export const imageProcessing = new ImageProcessingService();
export { SEEDREAM_TRANSFORMS } from "./seedream-ai";
export type { SeedreamTransform } from "./seedream-ai";
export default imageProcessing;
