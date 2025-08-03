import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { 
        global: { 
          headers: { 
            Authorization: req.headers.get('Authorization')! 
          } 
        } 
      }
    );

    const { inheritanceData, email, phone, userId, useEmail, useSms } = await req.json();

    // Generate PDF
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Arvskifteshandling', 20, 30);
    
    // Add deceased info
    pdf.setFontSize(12);
    let yPos = 50;
    
    if (inheritanceData.deceased) {
      pdf.text(`Avliden: ${inheritanceData.deceased.name}`, 20, yPos);
      yPos += 10;
      pdf.text(`Personnummer: ${inheritanceData.deceased.personalNumber}`, 20, yPos);
      yPos += 20;
    }
    
    // Add assets
    if (inheritanceData.assets && inheritanceData.assets.length > 0) {
      pdf.text('Tillgångar:', 20, yPos);
      yPos += 10;
      
      inheritanceData.assets.forEach((asset: any, index: number) => {
        pdf.text(`${index + 1}. ${asset.type}: ${asset.value} SEK`, 30, yPos);
        yPos += 8;
      });
      yPos += 10;
    }
    
    // Add heirs
    if (inheritanceData.heirs && inheritanceData.heirs.length > 0) {
      pdf.text('Arvtagare:', 20, yPos);
      yPos += 10;
      
      inheritanceData.heirs.forEach((heir: any, index: number) => {
        pdf.text(`${index + 1}. ${heir.name} (${heir.personalNumber})`, 30, yPos);
        yPos += 8;
        if (heir.inheritance) {
          pdf.text(`   Arv: ${heir.inheritance} SEK`, 30, yPos);
          yPos += 8;
        }
      });
    }

    const pdfBuffer = pdf.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Create signing token and link
    const signingToken = crypto.randomUUID();
    const signingLink = `https://c410ed21-f8e3-4f9c-89e1-ddb889afdccd.lovableproject.com/sign/${signingToken}`;

    // Save to database first
    const { error: dbError } = await supabase
      .from('signing_requests')
      .insert({ 
        token: signingToken,
        user_id: userId,
        email: email,
        inheritance_data: inheritanceData,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save signing request');
    }

    const results = [];

    // Send email if requested
    if (useEmail && email) {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Digital Arvsskifte <noreply@yourdomain.com>',
        to: [email],
        subject: 'Arvskifte att granska och signera',
        html: `
          <h1>Arvskifte att granska och signera</h1>
          <p>Vänligen granska det bifogade arvskiftet och signera med BankID:</p>
          <a href="${signingLink}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 16px 0;
          ">Signera nu</a>
          <p>Länken är giltig i 7 dagar.</p>
          <p>Mvh,<br>Digital Arvsskifte</p>
        `,
        attachments: [
          {
            filename: 'arvskifte.pdf',
            content: pdfBase64,
          }
        ]
      });

      if (emailError) {
        console.error('Email error:', emailError);
        results.push({ type: 'email', success: false, error: emailError.message });
      } else {
        results.push({ type: 'email', success: true, id: emailData?.id });
      }
    }

    // Send SMS if requested  
    if (useSms && phone) {
      try {
        const smsResponse = await supabase.functions.invoke('send-sms', {
          body: {
            to: phone,
            message: `Arvskifte klart för signering. Granska och signera här: ${signingLink} Länken gäller i 7 dagar.`
          }
        });

        if (smsResponse.error) {
          results.push({ type: 'sms', success: false, error: smsResponse.error.message });
        } else {
          results.push({ type: 'sms', success: true });
        }
      } catch (smsError) {
        console.error('SMS error:', smsError);
        results.push({ type: 'sms', success: false, error: 'SMS service unavailable' });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      signingToken,
      results 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-summary function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);