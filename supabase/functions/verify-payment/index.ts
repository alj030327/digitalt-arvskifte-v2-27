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
    const { case_id } = await req.json();
    
    if (!case_id) {
      throw new Error("Case ID is required");
    }

    // Initialize Stripe
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

    // Get case data
    const { data: caseData, error: caseError } = await supabaseServiceClient
      .from("cases")
      .select("*")
      .eq("id", case_id)
      .single();

    if (caseError || !caseData) {
      throw new Error("Case not found");
    }

    if (!caseData.stripe_session_id) {
      throw new Error("No Stripe session found for this case");
    }

    // Check payment status with Stripe
    const session = await stripe.checkout.sessions.retrieve(caseData.stripe_session_id);
    
    let payment_status = caseData.payment_status;
    let case_status = caseData.status;

    if (session.payment_status === 'paid' && caseData.payment_status === 'unpaid') {
      payment_status = 'paid';
      case_status = 'active';
      
      // Update case status
      const { error: updateError } = await supabaseServiceClient
        .from("cases")
        .update({ 
          payment_status: 'paid',
          status: 'active'
        })
        .eq("id", case_id);

      if (updateError) {
        console.error("Failed to update case status:", updateError);
      } else {
        // Send confirmation email
        try {
          await supabaseServiceClient.functions.invoke('send-receipt-email', {
            body: {
              email: caseData.email,
              case_data: caseData,
              stripe_session: session
            }
          });
        } catch (emailError) {
          console.error("Failed to send receipt email:", emailError);
          // Don't fail the verification if email fails
        }
      }
    }

    return new Response(JSON.stringify({ 
      payment_status,
      case_status,
      stripe_status: session.payment_status,
      access_token: caseData.access_token
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});