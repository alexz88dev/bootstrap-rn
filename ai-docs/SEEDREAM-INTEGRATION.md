# Seedream 4.0 AI Integration Guide

## Overview

MyCar Portrait uses **Seedream 4.0 AI** by ByteDance for advanced image manipulation and style transformations. This powerful AI model enables us to transform car photos with various artistic styles, environments, and effects while maintaining privacy through automatic license plate and face blurring.

## Key Features

### 1. AI-Powered Transformations
- **15+ Pre-defined Styles**: From minimal clean backgrounds to artistic interpretations
- **Custom Prompts**: Ability to create unique transformations
- **Multi-Category Support**: Style, Environment, Artistic, and Seasonal transformations
- **High-Resolution Output**: Native 2K support, up to 4K resolution

### 2. Privacy Protection
- Automatic license plate detection and blurring through AI prompts
- Face detection and privacy protection
- No permanent storage of original images
- GDPR-compliant processing

### 3. Credit System Integration
- Free styles (3 included with unlock)
- Premium styles (30 credits each)
- Batch processing capabilities
- Credit tracking and management

## Architecture

```
User Photo → Image Processing Service → Seedream AI Service → Transformed Image
                     ↓                          ↓
              Privacy Protection         Style Application
                     ↓                          ↓
              Upload to Storage          Save to Database
```

## Available Transformations

### Free Styles (Included with Unlock)
1. **Minimal Clean** - Pure minimalist background
2. **Dark Gradient** - Dramatic dark gradient
3. **Asphalt** - Textured road surface

### Premium Styles (30 Credits Each)

#### Environment Category
- **Neon City** - Cyberpunk aesthetic with neon reflections
- **Mountain Sunset** - Epic landscape at golden hour
- **Racing Track** - Professional motorsport circuit
- **Urban Garage** - Modern concrete architecture
- **Forest Road** - Scenic nature environment
- **Beach Coast** - Ocean coastline setting

#### Artistic Category
- **Oil Painting** - Classical art style
- **Comic Book** - Graphic novel aesthetic
- **Retro 80s** - Synthwave/retrowave style

#### Seasonal Category
- **Winter Snow** - Winter wonderland
- **Autumn Leaves** - Fall foliage
- **Spring Bloom** - Fresh spring flowers

## Implementation Details

### Service Files

1. **`services/seedream-ai.ts`**
   - Core Seedream API integration
   - Transform definitions and management
   - Batch processing capabilities
   - Mock mode for development

2. **`services/image-processing.ts`**
   - Image selection and preparation
   - Seedream integration
   - Upload and storage management
   - Progress tracking

### Configuration

#### Environment Variables
```env
# Development
EXPO_PUBLIC_SEEDREAM_API_KEY=your-dev-api-key
EXPO_PUBLIC_SEEDREAM_API_URL=https://api.seedream.ai/v4

# Production
EXPO_PUBLIC_SEEDREAM_API_KEY_PROD=your-prod-api-key
```

#### Feature Flags
```typescript
FEATURES: {
  MOCK_IMAGE_PROCESSING: true,  // Use mock in dev
  USE_SEEDREAM_MOCK: true,      // Mock Seedream responses
}
```

## API Integration

### Request Format
```typescript
{
  image: base64String,
  prompt: string,
  reference_images?: string[],
  output_quality: 'standard' | 'high' | 'ultra',
  preserve_subject: boolean,
  aspect_ratio: 'original',
  style_strength: 0.8,
  detail_level: 'high'
}
```

### Response Format
```typescript
{
  success: boolean,
  output_url?: string,
  output_base64?: string,
  processing_time: number,
  credits_used: number
}
```

## Usage Examples

### Basic Transformation
```typescript
const result = await seedreamAI.transformCarImage({
  imageBase64: carPhotoBase64,
  transformId: 'neon_city',
  outputQuality: 'high',
  preserveDetails: true
});
```

### Batch Processing
```typescript
const results = await seedreamAI.batchTransform(
  carPhotoBase64,
  ['minimal_clean', 'neon_city', 'mountain_sunset'],
  { outputQuality: 'high' }
);
```

### Custom Prompt
```typescript
const result = await seedreamAI.transformCarImage({
  imageBase64: carPhotoBase64,
  transformId: 'custom',
  customPrompt: 'Car in futuristic space station, sci-fi aesthetic',
  outputQuality: 'ultra'
});
```

## Pricing & Plans

### Seedream API Pricing
- **Basic Plan**: $6.90/month (500 credits, 50 images)
- **Standard Plan**: $13.90/month (1,500 credits, 150 images)
- **Pro Plan**: $27.90/month (4,000 credits, 400 images)
- **Enterprise**: Custom pricing

### MyCar Portrait Credit Mapping
- 1 Seedream API call = 1 transformation
- Users purchase credits in-app
- 30 credits per premium style unlock
- Efficient caching to minimize API calls

## Development Workflow

### 1. Local Development (Mock Mode)
```typescript
// Mock mode enabled by default in development
FEATURES: {
  USE_SEEDREAM_MOCK: true
}
```

### 2. Testing with Real API
```typescript
// Set API key in .env.local
EXPO_PUBLIC_SEEDREAM_API_KEY=your-test-key

// Disable mock mode
FEATURES: {
  USE_SEEDREAM_MOCK: false
}
```

### 3. Production Deployment
- Store API keys securely in environment variables
- Enable rate limiting and monitoring
- Implement proper error handling
- Set up analytics tracking

## Performance Optimization

### Image Preparation
- Resize to optimal dimensions (2048px width)
- Compress to 90% quality JPEG
- Convert to base64 for API transmission

### Caching Strategy
- Cache transformed images locally
- Store thumbnails for gallery
- Implement LRU cache for recent transformations

### Batch Processing
- Process multiple styles concurrently
- Limit to 3 concurrent API calls
- Queue management for large batches

## Error Handling

### Common Errors
1. **Invalid API Key**: Check environment configuration
2. **Rate Limit Exceeded**: Implement exponential backoff
3. **Image Too Large**: Pre-process and compress
4. **Network Timeout**: Retry with longer timeout

### Fallback Strategy
```typescript
try {
  // Try Seedream API
  const result = await seedreamAI.transformCarImage(request);
} catch (error) {
  // Fallback to basic processing
  const fallback = await basicImageProcessing(image);
}
```

## Monitoring & Analytics

### Track Key Metrics
- API success rate
- Average processing time
- Credits consumed per user
- Popular transformation styles
- Error rates by type

### Analytics Events
```typescript
analytics.track('seedream_transform_started', {
  transform_id: 'neon_city',
  quality: 'high'
});

analytics.track('seedream_transform_completed', {
  transform_id: 'neon_city',
  processing_time: 2500,
  credits_used: 30
});
```

## Security Considerations

1. **API Key Protection**
   - Never expose keys in client code
   - Use environment variables
   - Rotate keys regularly

2. **Image Privacy**
   - Process through secure channels
   - Delete after processing
   - No permanent storage

3. **Rate Limiting**
   - Implement per-user limits
   - Queue management
   - Graceful degradation

## Future Enhancements

1. **Additional Styles**
   - User-requested transformations
   - Seasonal updates
   - Trending styles

2. **Advanced Features**
   - Multiple reference images
   - Style mixing
   - Custom training

3. **Performance**
   - Edge caching
   - WebP format support
   - Progressive loading

## Support & Resources

- **Seedream Documentation**: [seedream4.io](https://seedream4.io)
- **API Status**: Check service health
- **Support Contact**: ai-support@mycarportrait.app

## Troubleshooting Checklist

- [ ] API key configured correctly
- [ ] Network connectivity verified
- [ ] Image size within limits
- [ ] Credits available
- [ ] Mock mode disabled for production
- [ ] Error logging enabled
- [ ] Fallback mechanism working

---

*Last Updated: January 2025*
*Seedream 4.0 Integration v1.0*