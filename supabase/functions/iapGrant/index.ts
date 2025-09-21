import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IAPGrantRequest {
  receiptData: string;
  productId: string;
  userId: string;
}

interface IAPGrantResponse {
  success: boolean;
  creditsGranted?: number;
  newBalance?: number;
  unlocked?: boolean;
}

// Product configurations
const PRODUCTS = {
  'unlock_plus_899': {
    credits: 100,
    unlock: true,
    price: 8.99,
  },
  'credits_40_399': {
    credits: 40,
    unlock: false,
    price: 3.99,
  },
  'credits_120_999': {
    credits: 120,
    unlock: false,
    price: 9.99,
  },
  'credits_260_1999': {
    credits: 260,
    unlock: false,
    price: 19.99,
  },
  'credits_520_3499': {
    credits: 520,
    unlock: false,
    price: 34.99,
  },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { receiptData, productId, userId } = await req.json() as IAPGrantRequest;

    if (!receiptData || !productId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify receipt with Apple (in production)
    const isValid = await verifyAppleReceipt(receiptData);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid receipt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if receipt has already been processed
    const { data: existingReceipt } = await supabase
      .from('credits_ledger')
      .select('id')
      .eq('receipt_id', receiptData)
      .single();

    if (existingReceipt) {
      return new Response(
        JSON.stringify({ error: 'Receipt already processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get product configuration
    const product = PRODUCTS[productId as keyof typeof PRODUCTS];
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Unknown product' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current balance
    const { data: balanceData } = await supabase
      .from('credits_ledger')
      .select('balance_after')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const currentBalance = balanceData?.balance_after || 0;
    const newBalance = currentBalance + product.credits;

    // Start transaction
    const updates = [];

    // Add credits
    updates.push(
      supabase
        .from('credits_ledger')
        .insert({
          user_id: userId,
          delta: product.credits,
          balance_after: newBalance,
          source: `iap_${productId}`,
          receipt_id: receiptData,
          metadata: {
            productId,
            price: product.price,
            processedAt: new Date().toISOString(),
          },
        })
    );

    // Unlock user if applicable
    if (product.unlock) {
      updates.push(
        supabase
          .from('users')
          .update({ is_unlocked: true })
          .eq('id', userId)
      );

      // Grant included styles
      const includedStyles = ['minimal', 'dark_gradient', 'asphalt'];
      for (const styleId of includedStyles) {
        updates.push(
          supabase
            .from('user_styles')
            .upsert({
              user_id: userId,
              style_id: styleId,
            })
        );
      }
    }

    // Execute all updates
    await Promise.all(updates);

    const response: IAPGrantResponse = {
      success: true,
      creditsGranted: product.credits,
      newBalance,
      unlocked: product.unlock,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing IAP grant:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process purchase' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function verifyAppleReceipt(receiptData: string): Promise<boolean> {
  // In production, verify with Apple's servers
  const verifyUrl = Deno.env.get('APP_ENV') === 'production'
    ? 'https://buy.itunes.apple.com/verifyReceipt'
    : 'https://sandbox.itunes.apple.com/verifyReceipt';

  try {
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'receipt-data': receiptData,
        'password': Deno.env.get('APPLE_SHARED_SECRET'),
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    
    // Status 0 means valid receipt
    return result.status === 0;
  } catch (error) {
    console.error('Receipt verification failed:', error);
    // In development, allow all receipts
    return Deno.env.get('APP_ENV') === 'development';
  }
}