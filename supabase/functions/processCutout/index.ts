import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  imageUrl?: string;
  base64?: string;
  userId: string;
}

interface ProcessResponse {
  portrait_url: string;
  processingMs: number;
  hasLicensePlate: boolean;
  hasFaces: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, base64, userId } = await req.json() as ProcessRequest;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!imageUrl && !base64) {
      return new Response(
        JSON.stringify({ error: 'Either imageUrl or base64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const today = new Date().toISOString().split('T')[0];
    const { data: limitData } = await supabase
      .from('processing_limits')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const { data: userData } = await supabase
      .from('users')
      .select('is_unlocked')
      .eq('id', userId)
      .single();

    const dailyLimit = userData?.is_unlocked ? 10 : 5;
    const currentCount = limitData?.count || 0;

    if (currentCount >= dailyLimit) {
      return new Response(
        JSON.stringify({ error: 'Daily processing limit reached' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update rate limit counter
    if (limitData) {
      await supabase
        .from('processing_limits')
        .update({ count: currentCount + 1 })
        .eq('user_id', userId)
        .eq('date', today);
    } else {
      await supabase
        .from('processing_limits')
        .insert({ user_id: userId, date: today, count: 1 });
    }

    // Process the image
    let imageData: Uint8Array;
    
    if (base64) {
      // Decode base64
      const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
      imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    } else if (imageUrl) {
      // Fetch image from URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }
      imageData = new Uint8Array(await imageResponse.arrayBuffer());
    } else {
      throw new Error('No image data provided');
    }

    // Step 1: Detect and blur license plates
    const hasLicensePlate = await detectLicensePlates(imageData);
    if (hasLicensePlate) {
      imageData = await blurLicensePlates(imageData);
    }

    // Step 2: Detect and blur faces
    const hasFaces = await detectFaces(imageData);
    if (hasFaces) {
      imageData = await blurFaces(imageData);
    }

    // Step 3: Remove background
    const processedImage = await removeBackground(imageData);

    // Step 4: Optimize and resize
    const optimizedImage = await optimizeImage(processedImage);

    // Step 5: Upload to storage
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portraits')
      .upload(fileName, optimizedImage, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portraits')
      .getPublicUrl(fileName);

    const processingMs = Date.now() - startTime;

    // Save to assets table
    await supabase
      .from('assets')
      .insert({
        user_id: userId,
        original_url: imageUrl,
        portrait_url: publicUrl,
        processing_time_ms: processingMs,
        metadata: {
          hasLicensePlate,
          hasFaces,
          processedAt: new Date().toISOString(),
        },
      });

    const response: ProcessResponse = {
      portrait_url: publicUrl,
      processingMs,
      hasLicensePlate,
      hasFaces,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions (simplified implementations)
async function detectLicensePlates(imageData: Uint8Array): Promise<boolean> {
  // In production, use a proper license plate detection API
  // For now, return true to simulate detection
  return true;
}

async function blurLicensePlates(imageData: Uint8Array): Promise<Uint8Array> {
  // In production, use image processing library to blur detected regions
  // For now, return the original image
  return imageData;
}

async function detectFaces(imageData: Uint8Array): Promise<boolean> {
  // In production, use a face detection API
  // For now, return false to simulate no faces detected
  return false;
}

async function blurFaces(imageData: Uint8Array): Promise<Uint8Array> {
  // In production, use image processing library to blur detected faces
  return imageData;
}

async function removeBackground(imageData: Uint8Array): Promise<Uint8Array> {
  // In production, integrate with background removal API (Remove.bg, etc.)
  // For now, we'll make a mock API call
  
  // Example Remove.bg integration:
  /*
  const formData = new FormData();
  formData.append('image_file', new Blob([imageData]));
  
  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': Deno.env.get('REMOVE_BG_API_KEY')!,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Background removal failed');
  }
  
  return new Uint8Array(await response.arrayBuffer());
  */
  
  // Mock implementation - return original
  return imageData;
}

async function optimizeImage(imageData: Uint8Array): Promise<Uint8Array> {
  // In production, use sharp or similar to:
  // - Resize to 1024x1024
  // - Convert to PNG
  // - Compress to < 1MB
  
  // For now, return the original
  return imageData;
}