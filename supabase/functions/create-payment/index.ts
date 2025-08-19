import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating payment session...");
    
    const { email, phone, inheritanceData } = await req.json();
    
    if (!email || !inheritanceData) {
      throw new Error("Email and inheritance data are required");
    }

    // Initialize Stripe with secret from Supabase
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Create Supabase client with service role
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create case in database first
    const { data: caseData, error: caseError } = await supabaseServiceClient
      .from("cases")
      .insert({
        email,
        phone,
        inheritance_data: inheritanceData,
        status: 'pending',
        payment_status: 'unpaid',
        total_amount: 20000, // 200 SEK in öre
        currency: 'sek'
      })
      .select()
      .single();

    if (caseError) {
      console.error("Database error:", caseError);
      throw new Error("Failed to create case: " + caseError.message);
    }

    console.log("Case created:", caseData.id);

    // Create Stripe checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: "Digitalt Arvsskifte",
              description: `Arvsskifte för ${inheritanceData.deceased?.name || 'okänd person'}`,
            },
            unit_amount: 20000, // 200 SEK in öre
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment-success?case_id=${caseData.id}&access_token=${caseData.access_token}`,
      cancel_url: `${origin}/`,
      metadata: {
        case_id: caseData.id,
        email: email,
      },
    });

    console.log("Stripe session created:", session.id);

    // Update case with Stripe session ID
    const { error: updateError } = await supabaseServiceClient
      .from("cases")
      .update({ stripe_session_id: session.id })
      .eq("id", caseData.id);

    if (updateError) {
      console.error("Failed to update case with session ID:", updateError);
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      case_id: caseData.id,
      access_token: caseData.access_token
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});