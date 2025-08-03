import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const { endpoint, data } = await req.json()
    
    console.log(`🔐 Mock BankID ${endpoint} called with:`, data)

    if (endpoint === 'auth' || endpoint === 'sign') {
      const { personalNumber } = data
      
      // According to BankID official documentation, test personal numbers should end with 0111
      // Also accept development ones for testing (like 196610061273)
      if (personalNumber && 
          !personalNumber.endsWith('0111') && 
          !personalNumber.startsWith('1966') &&
          !personalNumber.includes('19900101111') &&
          !personalNumber.includes('19850515111') &&
          !personalNumber.includes('19920310111')) {
        return new Response(
          JSON.stringify({ 
            error: 'Endast testpersonnummer enligt BankID dokumentation accepteras (avsluta med 0111, t.ex. 19900101111)'
          }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Generate mock BankID session
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 15)
      
      const mockResponse = {
        orderRef: `mock-${timestamp}-${randomSuffix}`,
        autoStartToken: `bankid.${randomSuffix}.${timestamp}.auto`,
        qrStartToken: `bankid.${randomSuffix}.${timestamp}.qr`,
        qrStartSecret: `qr.${Math.random().toString(36).substring(2, 20)}.secret`,
        _info: 'Detta är en mockad BankID-respons för testning'
      }

      console.log(`✅ Mock BankID ${endpoint} successful:`, mockResponse.orderRef)

      return new Response(
        JSON.stringify(mockResponse), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (endpoint === 'collect') {
      const { orderRef } = data
      
      if (!orderRef || !orderRef.startsWith('mock-')) {
        return new Response(
          JSON.stringify({ error: 'Invalid orderRef for mock environment' }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Extract timestamp from orderRef for realistic progression
      const timestampMatch = orderRef.match(/mock-(\d+)-/)
      const orderTime = timestampMatch ? parseInt(timestampMatch[1]) : Date.now()
      const elapsed = Date.now() - orderTime

      console.log(`🔍 Mock BankID collect for ${orderRef}, elapsed: ${elapsed}ms`)

      // Simulate realistic BankID flow progression
      if (elapsed < 2000) {
        return new Response(
          JSON.stringify({
            orderRef,
            status: 'pending',
            hintCode: 'outstandingTransaction'
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else if (elapsed < 5000) {
        return new Response(
          JSON.stringify({
            orderRef,
            status: 'pending',
            hintCode: 'userSign'
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        // 95% success rate after 5 seconds
        const success = Math.random() > 0.05
        
        if (success) {
          const mockUsers = [
            { personalNumber: '198001010111', name: 'Anna Andersson', givenName: 'Anna', surname: 'Andersson' },
            { personalNumber: '198505150111', name: 'Erik Johansson', givenName: 'Erik', surname: 'Johansson' },
            { personalNumber: '199203100111', name: 'Maria Karlsson', givenName: 'Maria', surname: 'Karlsson' },
            { personalNumber: '196610061273', name: 'Test Testsson', givenName: 'Test', surname: 'Testsson' }
          ]
          
          const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)]
          
          console.log(`✅ Mock BankID success for ${orderRef}`)
          
          return new Response(
            JSON.stringify({
              orderRef,
              status: 'complete',
              completionData: {
                user: randomUser,
                device: {
                  ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                  uhi: `mock-uhi-${Math.random().toString(36).substring(2, 15)}`
                },
                signature: `mock-signature.${Date.now()}.${Math.random().toString(36).substring(2, 15)}`,
                ocspResponse: `mock-ocsp.${Date.now()}.${Math.random().toString(36).substring(2, 25)}`
              }
            }), 
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        } else {
          const failureReasons = ['userCancel', 'cancelled', 'startFailed']
          const hintCode = failureReasons[Math.floor(Math.random() * failureReasons.length)]
          
          console.log(`❌ Mock BankID failed for ${orderRef}: ${hintCode}`)
          
          return new Response(
            JSON.stringify({
              orderRef,
              status: 'failed',
              hintCode
            }), 
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }
    }

    if (endpoint === 'cancel') {
      console.log(`🚫 Mock BankID cancel for ${data.orderRef}`)
      return new Response(
        JSON.stringify({ success: true }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Mock BankID Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})