import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
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
    const { email, case_data, stripe_session } = await req.json();
    
    if (!email || !case_data) {
      throw new Error("Email and case data are required");
    }

    // Initialize Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("Resend API key not configured");
    }
    
    const resend = new Resend(resendKey);

    // Generate project access URL
    const projectUrl = `${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.app')}/case/${case_data.access_token}`;

    // Create email content
    const deceased_name = case_data.inheritance_data?.deceased?.name || 'okänd person';
    const amount = (case_data.total_amount / 100).toFixed(2);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">Bekräftelse - Digitalt Arvsskifte</h1>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #334155; margin-top: 0;">Tack för din betalning!</h2>
          <p>Din betalning för det digitala arvsskiftet har genomförts framgångsrikt.</p>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #475569; margin-top: 0;">Orderdetaljer</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Ärendenummer:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${case_data.case_number}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Arvsskifte för:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${deceased_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Belopp:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${amount} SEK</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Datum:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('sv-SE')}</td>
            </tr>
          </table>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #047857; margin-top: 0;">🎉 Ditt arvsskifte är nu aktivt!</h3>
          <p style="margin: 10px 0;">Du kan nu komma åt och hantera ditt arvsskifte när som helst:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${projectUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Öppna ditt arvsskifte
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            <strong>Viktig information:</strong> Spara denna länk säkert. Du kommer att behöva den för att komma åt ditt arvsskifte i framtiden.
          </p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Om du har frågor, kontakta oss på support@digitalarvsskifte.se</p>
          <p>© ${new Date().getFullYear()} Digitalt Arvsskifte</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Digitalt Arvsskifte <noreply@resend.dev>",
      to: [email],
      subject: `Bekräftelse - Ditt arvsskifte ${case_data.case_number} är aktivt`,
      html: emailHtml,
    });

    console.log("Receipt email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, email_id: emailResponse.data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending receipt email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});