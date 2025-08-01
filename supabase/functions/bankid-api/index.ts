import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface BankIdRequest {
  endpoint: 'auth' | 'sign' | 'collect' | 'cancel';
  data: any;
}

interface BankIdAuthRequest {
  personalNumber?: string;
  endUserIp: string;
  requirement?: {
    autoStartTokenRequired?: boolean;
    allowFingerprint?: boolean;
  };
}

interface BankIdSignRequest extends BankIdAuthRequest {
  userVisibleData: string; // Base64 encoded text
  userNonVisibleData?: string; // Base64 encoded data
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

    // BankID Test API URL
    const baseUrl = 'https://appapi2.bankid.com/rp/v6.0'
    
    // Endpoint mappings
    const endpoints = {
      auth: '/auth',
      sign: '/sign',
      collect: '/collect',
      cancel: '/cancel'
    }

    if (!endpoints[endpoint]) {
      throw new Error(`Invalid endpoint: ${endpoint}`)
    }

    const url = `${baseUrl}${endpoints[endpoint]}`
    
    console.log(`🔐 Making BankID ${endpoint} request to ${url}`)
    console.log(`📄 Request data:`, JSON.stringify(data, null, 2))

    // Förbered certifikatdata för TLS-autentisering
    // I production skulle detta vara en riktig implementering med client certificates
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Digitalt-Arvsskifte/1.0',
    }

    // För test-miljön, simulera certifikatbaserad autentisering
    // I riktig implementation skulle detta använda client certificates
    if (certificate && certificatePassword) {
      headers['X-Client-Cert'] = 'test-cert-header'
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`BankID API Error (${response.status}):`, errorText)
      
      // Parse BankID error responses
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { errorCode: 'unknown', details: errorText }
      }

      return new Response(
        JSON.stringify({ 
          error: 'BankID API Error',
          details: errorData,
          status: response.status
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    console.log(`✅ BankID ${endpoint} success:`, JSON.stringify(result, null, 2))

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('BankID API Error:', error)
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