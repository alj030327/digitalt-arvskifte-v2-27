import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// BankID test environment certificate
const BANKID_TEST_CERT = `-----BEGIN CERTIFICATE-----
MIIF0DCCA7igAwIBAgIIIhYaxu4khgAwDQYJKoZIhvcNAQENBQAwbDEkMCIGA1UE
CgwbRmluYW5zaWVsbCBJRC1UZWtuaWsgQklEIEFCMRowGAYDVQQLDBFJbmZyYXN0
cnVjdHVyZSBDQTEoMCYGA1UEAwwfVGVzdCBCYW5rSUQgU1NMIFJvb3QgQ0EgdjEg
VGVzdDAeFw0xNDExMjExMjM5MzFaFw0zNDEyMzExMjM5MzFaMGwxJDAiBgNVBAoM
G0ZpbmFuc2llbGwgSUQtVGVrbmlrIEJJRCBBQjEaMBgGA1UECwwRSW5mcmFzdHJ1
Y3R1cmUgQ0ExKDAmBgNVBAMMH1Rlc3QgQmFua0lEIFNTTCBSb290IENBIHYxIFRl
c3QwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCAKWsJc/kV/0434d+S
qn19mIr85RZ/PgRFaUplSrnhuzAmaXihPLCEsd3Mh/YErygcxhQ/MAzi5OZ/anfu
WSCwceRlQINtvlRPdMoeZtu29FsntK1Z5r2SYNdFwbRFb8WN9FsU0KvC5zVnuDMg
s5dUZwTmdzX5ZdLP7pdgB3zhTnra5ORtkiWiUxJVev9keRgAo00ZHIRJ+xTfiSPd
Jc314maigVRQZdGKSyQcQMTWi1YLwd2zwOacNxleYf8xqKgkZsmkrc4Dp2mR5Pkr
nnKB6A7sAOSNatua7M86EgcGi9AaEyaRMkYJImbBfzaNlaBPyMSvwmBZzp2xKc9O
D3U06ogV6CJjJL7hSuVc5x/2H04d+2I+DKwep6YBoVL9L81gRYRycqg+w+cTZ1TF
/s6NC5YRKSeOCrLw3ombhjyyuPl8T/h9cpXt6m3y2xIVLYVzeDhaql3hdi6IpRh6
rwkMhJ/XmOpbDinXb1fWdFOyQwqsXQWOEwKBYIkM6cPnuid7qwaxfP22hDgAolGM
LY7TPKUPRwV+a5Y3VPl7h0YSK7lDyckTJdtBqI6d4PWQLnHakUgRQy69nZhGRtUt
PMSJ7I4Qtt3B6AwDq+SJTggwtJQHeid0jPki6pouenhPQ6dZT532x16XD+WIcD2f
//XzzOueS29KB7lt/wH5K6EuxwIDAQABo3YwdDAdBgNVHQ4EFgQUDY6XJ/FIRFX3
dB4Wep3RVM84RXowDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBQNjpcn8UhE
Vfd0HhZ6ndFUzzhFejARBgNVHSAECjAIMAYGBCoDBAUwDgYDVR0PAQH/BAQDAgEG
MA0GCSqGSIb3DQEBDQUAA4ICAQA5s59/Olio4svHXiKu7sPQRvrf4GfGB7hUjBGk
YW2YOHTYnHavSqlBASHc8gGGwuc7v7+H+vmOfSLZfGDqxnBqeJx1H5E0YqEXtNqW
G1JusIFa9xWypcONjg9v7IMnxxQzLYws4YwgPychpMzWY6B5hZsjUyKgB+1igxnf
uaBueLPw3ZaJhcCL8gz6SdCKmQpX4VaAadS0vdMrBOmd826H+aDGZek1vMjuH11F
fJoXY2jyDnlol7Z4BfHc011toWNMxojI7w+U4KKCbSxpWFVYITZ8WlYHcj+b2A1+
dFQZFzQN+Y1Wx3VIUqSks6P7F5aF/l4RBngy08zkP7iLA/C7rm61xWxTmpj3p6SG
fUBsrsBvBgfJQHD/Mx8U3iQCa0Vj1XPogE/PXQQq2vyWiAP662hD6og1/om3l1PJ
TBUyYXxqJO75ux8IWblUwAjsmTlF/Pcj8QbcMPXLMTgNQAgarV6guchjivYqb6Zr
hq+Nh3JrF0HYQuMgExQ6VX8T56saOEtmlp6LSQi4HvKatCNfWUJGoYeT5SrcJ6sn
By7XLMhQUCOXcBwKbNvX6aP79VA3yeJHZO7XParX7V9BB+jtf4tz/usmAT/+qXtH
CCv9Xf4lv8jgdOnFfXbXuT8I4gz8uq8ElBlpbJntO6p/NY5a08E6C7FWVR+WJ5vZ
OP2HsA==
-----END CERTIFICATE-----`

const BANKID_TEST_BASE_URL = 'https://appapi2.test.bankid.com/rp/v6.0'

interface BankIdRequest {
  endpoint: 'auth' | 'sign' | 'collect' | 'cancel'
  data?: any
}

interface BankIdAuthRequest {
  personalNumber?: string
  endUserIp: string
  requirement?: {
    autoStartTokenRequired?: boolean
    allowFingerprint?: boolean
  }
}

interface BankIdSignRequest extends BankIdAuthRequest {
  userVisibleData: string
  userNonVisibleData?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    console.log('🔐 BankID API Edge Function called')

    if (req.method !== 'POST') {
      throw new Error('Only POST method allowed')
    }

    const { endpoint, data }: BankIdRequest = await req.json()
    console.log(`📞 BankID API call: ${endpoint}`, data)

    let response: any

    switch (endpoint) {
      case 'auth':
        response = await callBankIdAuth(data as BankIdAuthRequest)
        break
      case 'sign':
        response = await callBankIdSign(data as BankIdSignRequest)
        break
      case 'collect':
        response = await callBankIdCollect(data.orderRef)
        break
      case 'cancel':
        response = await callBankIdCancel(data.orderRef)
        break
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`)
    }

    console.log(`✅ BankID ${endpoint} response:`, response)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ BankID API Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'BankID API call failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function callBankIdAuth(authRequest: BankIdAuthRequest) {
  console.log('🔐 Calling BankID auth endpoint')
  
  // For test environment, we use simplified request format
  const requestBody = {
    endUserIp: authRequest.endUserIp,
    ...(authRequest.personalNumber && { personalNumber: authRequest.personalNumber }),
    ...(authRequest.requirement && { requirement: authRequest.requirement })
  }

  const response = await fetch(`${BANKID_TEST_BASE_URL}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('BankID auth error:', response.status, errorText)
    throw new Error(`BankID auth failed: ${response.status} ${errorText}`)
  }

  return await response.json()
}

async function callBankIdSign(signRequest: BankIdSignRequest) {
  console.log('✍️ Calling BankID sign endpoint')
  
  const requestBody = {
    endUserIp: signRequest.endUserIp,
    userVisibleData: signRequest.userVisibleData,
    ...(signRequest.personalNumber && { personalNumber: signRequest.personalNumber }),
    ...(signRequest.userNonVisibleData && { userNonVisibleData: signRequest.userNonVisibleData }),
    ...(signRequest.requirement && { requirement: signRequest.requirement })
  }

  const response = await fetch(`${BANKID_TEST_BASE_URL}/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('BankID sign error:', response.status, errorText)
    throw new Error(`BankID sign failed: ${response.status} ${errorText}`)
  }

  return await response.json()
}

async function callBankIdCollect(orderRef: string) {
  console.log('📊 Calling BankID collect endpoint for orderRef:', orderRef)
  
  const response = await fetch(`${BANKID_TEST_BASE_URL}/collect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderRef }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('BankID collect error:', response.status, errorText)
    throw new Error(`BankID collect failed: ${response.status} ${errorText}`)
  }

  return await response.json()
}

async function callBankIdCancel(orderRef: string) {
  console.log('❌ Calling BankID cancel endpoint for orderRef:', orderRef)
  
  const response = await fetch(`${BANKID_TEST_BASE_URL}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderRef }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('BankID cancel error:', response.status, errorText)
    throw new Error(`BankID cancel failed: ${response.status} ${errorText}`)
  }

  return await response.json()
}