/**
 * Seedream 4.0 AI Integration Service
 * Handles all AI-powered image transformations for car portraits
 */

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export interface SeedreamConfig {
  apiKey: string;
  apiUrl: string;
  maxRetries: number;
  timeout: number;
}

export interface SeedreamTransform {
  id: string;
  name: string;
  prompt: string;
  category: 'style' | 'environment' | 'artistic' | 'seasonal';
  creditsRequired: number;
  isPremium: boolean;
  previewUrl?: string;
}

export interface SeedreamRequest {
  imageBase64: string;
  transformId: string;
  customPrompt?: string;
  referenceImages?: string[];
  outputQuality?: 'standard' | 'high' | 'ultra';
  preserveDetails?: boolean;
}

export interface SeedreamResponse {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  processingTime: number;
  creditsUsed: number;
  error?: string;
}

// Available AI transformations for car portraits
export const SEEDREAM_TRANSFORMS: SeedreamTransform[] = [
  // Free/Included Styles (with unlock)
  {
    id: 'minimal_clean',
    name: 'Minimal Clean',
    prompt: 'Car portrait on pure minimalist background, professional studio lighting, clean edges, no distractions, high contrast, magazine quality',
    category: 'style',
    creditsRequired: 0,
    isPremium: false,
  },
  {
    id: 'dark_gradient',
    name: 'Dark Gradient',
    prompt: 'Car portrait with dark gradient background, dramatic lighting, professional automotive photography, moody atmosphere, premium feel',
    category: 'style',
    creditsRequired: 0,
    isPremium: false,
  },
  {
    id: 'asphalt_texture',
    name: 'Asphalt',
    prompt: 'Car on textured asphalt background, natural outdoor lighting, realistic road surface, automotive photography style',
    category: 'style',
    creditsRequired: 0,
    isPremium: false,
  },

  // Premium Styles (30 credits each)
  {
    id: 'neon_city',
    name: 'Neon City',
    prompt: 'Car in cyberpunk neon city environment, night scene, glowing neon lights reflection on car, blade runner aesthetic, cinematic lighting',
    category: 'environment',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'mountain_sunset',
    name: 'Mountain Sunset',
    prompt: 'Car with majestic mountain range at golden hour sunset, epic landscape, warm lighting, travel photography style, adventure mood',
    category: 'environment',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'racing_track',
    name: 'Racing Track',
    prompt: 'Car on professional racing circuit, track details visible, motorsport atmosphere, dynamic angle, speed and performance focused',
    category: 'environment',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'urban_garage',
    name: 'Urban Garage',
    prompt: 'Car in modern urban garage, industrial concrete textures, moody lighting, architectural elements, premium parking aesthetic',
    category: 'environment',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'forest_road',
    name: 'Forest Road',
    prompt: 'Car on scenic forest road, dappled sunlight through trees, natural environment, adventure and exploration theme',
    category: 'environment',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'beach_coast',
    name: 'Beach Coast',
    prompt: 'Car near ocean coastline, beach scenery, sunset or sunrise lighting, vacation and freedom vibe, coastal road trip aesthetic',
    category: 'environment',
    creditsRequired: 30,
    isPremium: true,
  },

  // Artistic Styles
  {
    id: 'oil_painting',
    name: 'Oil Painting',
    prompt: 'Car rendered as classical oil painting, brush strokes visible, artistic interpretation, gallery quality artwork style',
    category: 'artistic',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'comic_book',
    name: 'Comic Book',
    prompt: 'Car in comic book illustration style, bold lines, cel shading, pop art colors, graphic novel aesthetic',
    category: 'artistic',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'retro_80s',
    name: 'Retro 80s',
    prompt: 'Car with 1980s retro wave aesthetic, synthwave colors, nostalgic vibe, Miami vice style, neon grid background',
    category: 'artistic',
    creditsRequired: 30,
    isPremium: true,
  },

  // Seasonal Styles
  {
    id: 'winter_snow',
    name: 'Winter Snow',
    prompt: 'Car in winter wonderland, snow covered environment, cold crisp atmosphere, seasonal holiday mood',
    category: 'seasonal',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'autumn_leaves',
    name: 'Autumn Leaves',
    prompt: 'Car surrounded by fall foliage, autumn colors, golden leaves, seasonal warmth, cozy atmosphere',
    category: 'seasonal',
    creditsRequired: 30,
    isPremium: true,
  },
  {
    id: 'spring_bloom',
    name: 'Spring Bloom',
    prompt: 'Car with spring flowers and blooming trees, fresh colors, renewal theme, bright and cheerful mood',
    category: 'seasonal',
    creditsRequired: 30,
    isPremium: true,
  },
];

class SeedreamAIService {
  private config: SeedreamConfig;
  private processingQueue: Map<string, Promise<SeedreamResponse>> = new Map();

  constructor(config: Partial<SeedreamConfig> = {}) {
    this.config = {
      apiKey: process.env.EXPO_PUBLIC_SEEDREAM_API_KEY || '',
      apiUrl: process.env.EXPO_PUBLIC_SEEDREAM_API_URL || 'https://api.seedream.ai/v4',
      maxRetries: 3,
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Apply a Seedream transformation to a car image
   */
  async transformCarImage(request: SeedreamRequest): Promise<SeedreamResponse> {
    const startTime = Date.now();

    try {
      // Check if already processing this image
      const queueKey = `${request.imageBase64.substring(0, 50)}_${request.transformId}`;
      if (this.processingQueue.has(queueKey)) {
        return await this.processingQueue.get(queueKey)!;
      }

      // Create processing promise
      const processingPromise = this.processTransformation(request);
      this.processingQueue.set(queueKey, processingPromise);

      // Process and clean up
      const result = await processingPromise;
      this.processingQueue.delete(queueKey);

      return {
        ...result,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Seedream transformation error:', error);
      return {
        success: false,
        processingTime: Date.now() - startTime,
        creditsUsed: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Process the actual transformation
   */
  private async processTransformation(request: SeedreamRequest): Promise<SeedreamResponse> {
    const transform = SEEDREAM_TRANSFORMS.find(t => t.id === request.transformId);
    if (!transform) {
      throw new Error('Invalid transform ID');
    }

    // Prepare the image for processing
    const preparedImage = await this.prepareImage(request.imageBase64);

    // Build the final prompt
    const finalPrompt = this.buildPrompt(transform, request.customPrompt);

    // Call Seedream API
    const response = await this.callSeedreamAPI({
      image: preparedImage,
      prompt: finalPrompt,
      referenceImages: request.referenceImages,
      quality: request.outputQuality || 'high',
      preserveDetails: request.preserveDetails ?? true,
    });

    return {
      success: response.success,
      imageUrl: response.imageUrl,
      imageBase64: response.imageBase64,
      processingTime: 0, // Will be set by caller
      creditsUsed: transform.creditsRequired,
      error: response.error,
    };
  }

  /**
   * Prepare image for Seedream processing
   */
  private async prepareImage(base64Image: string): Promise<string> {
    // Optimize image size if needed
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      `data:image/jpeg;base64,${base64Image}`,
      [
        { resize: { width: 2048 } }, // Max width for optimal processing
      ],
      { 
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    return manipulatedImage.base64 || base64Image;
  }

  /**
   * Build the final prompt for Seedream
   */
  private buildPrompt(transform: SeedreamTransform, customPrompt?: string): string {
    const basePrompt = transform.prompt;
    const privacyPrompt = 'Ensure all license plates and faces are obscured or artistically hidden, maintain privacy';
    const qualityPrompt = 'Ultra high quality, professional photography, perfect composition, sharp details';
    
    const prompts = [basePrompt, privacyPrompt, qualityPrompt];
    
    if (customPrompt) {
      prompts.push(customPrompt);
    }
    
    return prompts.join(', ');
  }

  /**
   * Call the Seedream API
   */
  private async callSeedreamAPI(params: {
    image: string;
    prompt: string;
    referenceImages?: string[];
    quality: string;
    preserveDetails: boolean;
  }): Promise<any> {
    // In development, return mock response
    if (__DEV__ && !this.config.apiKey) {
      return this.mockSeedreamResponse(params);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.apiUrl}/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-API-Version': '4.0',
        },
        body: JSON.stringify({
          image: params.image,
          prompt: params.prompt,
          reference_images: params.referenceImages,
          output_quality: params.quality,
          preserve_subject: params.preserveDetails,
          aspect_ratio: 'original',
          style_strength: 0.8,
          detail_level: 'high',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Seedream API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        imageUrl: data.output_url,
        imageBase64: data.output_base64,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      
      throw error;
    }
  }

  /**
   * Mock response for development
   */
  private async mockSeedreamResponse(params: any): Promise<any> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In development, return the original image with a filter
    return {
      success: true,
      imageBase64: params.image,
      imageUrl: null,
    };
  }

  /**
   * Get available transforms for a user based on their unlock status
   */
  getAvailableTransforms(isUnlocked: boolean, ownedStyles: string[]): SeedreamTransform[] {
    if (!isUnlocked) {
      return []; // No transforms available for free users
    }

    return SEEDREAM_TRANSFORMS.filter(transform => {
      // Include free styles
      if (!transform.isPremium) return true;
      // Include owned premium styles
      return ownedStyles.includes(transform.id);
    });
  }

  /**
   * Estimate processing time based on quality and device
   */
  estimateProcessingTime(quality: 'standard' | 'high' | 'ultra'): number {
    const baseTime = 2000; // 2 seconds base
    const qualityMultipliers = {
      standard: 1,
      high: 1.5,
      ultra: 2.5,
    };
    
    return baseTime * qualityMultipliers[quality];
  }

  /**
   * Validate if an image is suitable for processing
   */
  async validateImage(base64Image: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      // Check image size
      const sizeInBytes = (base64Image.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 10) {
        return { valid: false, reason: 'Image size exceeds 10MB limit' };
      }
      
      // Additional validations can be added here
      // - Check if it's actually a car
      // - Check image quality
      // - Check aspect ratio
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Invalid image format' };
    }
  }

  /**
   * Batch process multiple transformations
   */
  async batchTransform(
    imageBase64: string,
    transformIds: string[],
    options?: Partial<SeedreamRequest>
  ): Promise<Map<string, SeedreamResponse>> {
    const results = new Map<string, SeedreamResponse>();
    
    // Process in parallel with concurrency limit
    const concurrencyLimit = 3;
    const chunks = [];
    
    for (let i = 0; i < transformIds.length; i += concurrencyLimit) {
      chunks.push(transformIds.slice(i, i + concurrencyLimit));
    }
    
    for (const chunk of chunks) {
      const promises = chunk.map(transformId =>
        this.transformCarImage({
          imageBase64,
          transformId,
          ...options,
        })
      );
      
      const chunkResults = await Promise.all(promises);
      
      chunk.forEach((transformId, index) => {
        results.set(transformId, chunkResults[index]);
      });
    }
    
    return results;
  }
}

// Export singleton instance
export const seedreamAI = new SeedreamAIService();

// Export types and constants
export type { SeedreamAIService };
export default seedreamAI;