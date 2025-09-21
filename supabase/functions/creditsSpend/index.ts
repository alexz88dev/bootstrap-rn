import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SpendRequest {
  userId: string;
  styleId: string;
}

interface SpendResponse {
  success: boolean;
  balance_after?: number;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, styleId } = await req.json() as SpendRequest;

    if (!userId || !styleId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if style exists and get cost
    const { data: styleData, error: styleError } = await supabase
      .from('styles')
      .select('cost, is_included, title')
      .eq('style_id', styleId)
      .single();

    if (styleError || !styleData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Style not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if style is included (free)
    if (styleData.is_included) {
      // Just unlock it without spending credits
      await supabase
        .from('user_styles')
        .upsert({
          user_id: userId,
          style_id: styleId,
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          balance_after: await getCurrentBalance(supabase, userId) 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already owns this style
    const { data: existingStyle } = await supabase
      .from('user_styles')
      .select('style_id')
      .eq('user_id', userId)
      .eq('style_id', styleId)
      .single();

    if (existingStyle) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Style already owned' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current balance
    const currentBalance = await getCurrentBalance(supabase, userId);
    const styleCost = styleData.cost || 30;

    // Check if user has enough credits
    if (currentBalance < styleCost) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient credits',
          balance_after: currentBalance 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct credits and unlock style (atomic transaction)
    const newBalance = currentBalance - styleCost;

    // Insert credit deduction
    const { error: creditError } = await supabase
      .from('credits_ledger')
      .insert({
        user_id: userId,
        delta: -styleCost,
        balance_after: newBalance,
        source: 'style_unlock',
        metadata: {
          styleId,
          styleTitle: styleData.title,
          cost: styleCost,
        },
      });

    if (creditError) {
      throw creditError;
    }

    // Unlock the style
    const { error: unlockError } = await supabase
      .from('user_styles')
      .insert({
        user_id: userId,
        style_id: styleId,
      });

    if (unlockError) {
      // Rollback credit deduction
      await supabase
        .from('credits_ledger')
        .insert({
          user_id: userId,
          delta: styleCost,
          balance_after: currentBalance,
          source: 'rollback',
          metadata: {
            reason: 'Failed to unlock style',
            originalTransaction: 'style_unlock',
          },
        });
      
      throw unlockError;
    }

    const response: SpendResponse = {
      success: true,
      balance_after: newBalance,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error spending credits:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process transaction' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getCurrentBalance(supabase: any, userId: string): Promise<number> {
  const { data } = await supabase
    .from('credits_ledger')
    .select('balance_after')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data?.balance_after || 0;
}