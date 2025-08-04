// Demo mode configuration and mock services
export const isDemoMode = () => {
  return process.env.NODE_ENV === 'development' || 
         process.env.DEMO_MODE === 'true' ||
         window.location.hostname === 'localhost' ||
         window.location.hostname.includes('demo');
};

// Mock data for demo mode
export const demoConfig = {
  // Demo personal numbers that always work
  demoPersonalNumbers: [
    '195001011111', // Demo deceased person
    '198001011111', // Demo heir 1  
    '199001011111', // Demo heir 2
    '200001011111'  // Demo heir 3
  ],
  
  // Mock heirs data
  mockHeirs: [
    {
      personalNumber: '198001011111',
      name: 'Anna Andersson',
      relationship: 'Barn',
      inheritancePercentage: 50,
      email: 'anna@demo.se',
      phone: '+46701234567'
    },
    {
      personalNumber: '199001011111', 
      name: 'Erik Eriksson',
      relationship: 'Barn',
      inheritancePercentage: 50,
      email: 'erik@demo.se',
      phone: '+46702345678'
    }
  ],
  
  // Mock bank accounts
  mockAccounts: [
    {
      bank: 'Swedbank',
      accountNumber: '8000-9,123 456 789-0',
      accountType: 'Sparkonto',
      balance: 245000,
      currency: 'SEK'
    },
    {
      bank: 'Handelsbanken',
      accountNumber: '6000,123 456 789',
      accountType: 'Lönekonto', 
      balance: 12500,
      currency: 'SEK'
    },
    {
      bank: 'SEB',
      accountNumber: '5555 12 34567',
      accountType: 'Investeringssparkonto',
      balance: 180000,
      currency: 'SEK'
    }
  ],
  
  // Mock physical assets
  mockPhysicalAssets: [
    {
      type: 'Fastighet',
      description: 'Villa, Södermalm Stockholm',
      estimatedValue: 8500000,
      address: 'Testgatan 123, Stockholm'
    },
    {
      type: 'Bil',
      description: 'Volvo XC90 2020',
      estimatedValue: 450000,
      registrationNumber: 'ABC123'
    }
  ]
};

// Mock BankID responses for demo
export const mockBankIDResponses = {
  auth: {
    orderRef: 'demo-auth-' + Date.now(),
    autoStartToken: 'demo-token-123',
    qrStartToken: 'demo-qr-123',
    qrStartSecret: 'demo-secret-456'
  },
  
  collect: (status: 'pending' | 'complete' | 'failed') => ({
    orderRef: 'demo-auth-' + Date.now(),
    status,
    hintCode: status === 'pending' ? 'userSign' : undefined,
    completionData: status === 'complete' ? {
      user: {
        personalNumber: '198001011111',
        name: 'Anna Andersson',
        givenName: 'Anna',
        surname: 'Andersson'
      },
      signature: 'demo-signature-hash'
    } : undefined
  })
};

// Enable demo mode logging
export const demoLogger = {
  info: (message: string, data?: any) => {
    if (isDemoMode()) {
      console.log(`[DEMO] ${message}`, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDemoMode()) {
      console.warn(`[DEMO] ${message}`, data);
    }
  }
};