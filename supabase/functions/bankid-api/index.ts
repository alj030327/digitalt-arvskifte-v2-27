import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface BankIdRequest {
  endpoint: 'auth' | 'sign' | 'collect' | 'cancel';
  data: any;
}

interface BankIdPhoneAuthRequest {
  endUserIp: string;
  requirement?: {
    allowFingerprint?: boolean;
    autoStartTokenRequired?: boolean;
  };
  userVisibleData?: string; // Base64 encoded text
  userNonVisibleData?: string; // Base64 encoded data
  personalNumber?: string; // Optional for phone auth
}

interface BankIdCollectRequest {
  orderRef: string;
}

interface BankIdResponse {
  orderRef?: string;
  autoStartToken?: string;
  qrStartToken?: string;
  qrStartSecret?: string;
  status?: 'pending' | 'complete' | 'failed';
  hintCode?: string;
  completionData?: {
    user: {
      personalNumber: string;
      name: string;
      givenName: string;
      surname: string;
    };
    device: {
      ipAddress: string;
      uhi: string;
    };
    signature: string;
    ocspResponse: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { endpoint, data }: BankIdRequest = await req.json()
    
    // Hämta BankID-certifikat från Supabase secrets
    const certificate = Deno.env.get('BANKID_TEST_CERTIFICATE')
    const certificatePassword = Deno.env.get('BANKID_TEST_CERTIFICATE_PASSWORD')
    
    if (!certificate || !certificatePassword) {
      console.error('BankID credentials not configured in Supabase secrets')
      return new Response(
        JSON.stringify({ 
          error: 'BankID credentials not configured. Please add BANKID_TEST_CERTIFICATE and BANKID_TEST_CERTIFICATE_PASSWORD in Supabase secrets.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // BankID Relying Party API v6.0
    const baseUrl = 'https://appapi2.bankid.com/rp/v6.0'
    const testBaseUrl = 'https://appapi2.test.bankid.com/rp/v6.0'
    
    // Use test environment for development
    const apiUrl = Deno.env.get('BANKID_ENVIRONMENT') === 'production' ? baseUrl : testBaseUrl
    
    // Endpoint mappings för Phone Auth API
    const endpoints = {
      auth: '/auth',
      sign: '/sign',
      collect: '/collect',
      cancel: '/cancel'
    }

    if (!endpoints[endpoint]) {
      throw new Error(`Invalid endpoint: ${endpoint}`)
    }

    const url = `${apiUrl}${endpoints[endpoint]}`
    
    console.log(`🔐 Making BankID Phone Auth ${endpoint} request to ${url}`)
    console.log(`📄 Request data:`, JSON.stringify(data, null, 2))

    // Förbered headers för BankID Phone Auth API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Digitalt-Arvsskifte-PhoneAuth/1.0',
    }

    // För Phone Auth, lägg till IP-adress från request om den saknas
    if (endpoint === 'auth' || endpoint === 'sign') {
      if (!data.endUserIp) {
        // Extrahera användarens IP från request headers
        const clientIP = req.headers.get('x-forwarded-for') || 
                        req.headers.get('x-real-ip') || 
                        '127.0.0.1';
        data.endUserIp = clientIP.split(',')[0].trim();
        console.log(`📡 Auto-detected user IP: ${data.endUserIp}`);
      }

      // Sätt default requirements för Phone Auth
      if (!data.requirement) {
        data.requirement = {
          allowFingerprint: true,
          autoStartTokenRequired: true
        };
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`BankID Phone Auth API Error (${response.status}):`, errorText)
      
      // Parse BankID error responses
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { errorCode: 'unknown', details: errorText }
      }

      return new Response(
        JSON.stringify({ 
          error: 'BankID Phone Auth API Error',
          details: errorData,
          status: response.status
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result: BankIdResponse = await response.json()
    console.log(`✅ BankID Phone Auth ${endpoint} success:`, JSON.stringify(result, null, 2))

    // För Phone Auth, generera QR-kod data om det behövs
    if (endpoint === 'auth' && result.qrStartToken && result.qrStartSecret) {
      const timestamp = Date.now();
      const qrCodeData = `bankid.${result.qrStartToken}.${timestamp}.${result.qrStartSecret}`;
      result.qrCodeData = btoa(qrCodeData);
      console.log(`📱 Generated QR code data for Phone Auth`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('BankID Phone Auth API Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})