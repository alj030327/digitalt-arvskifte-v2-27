// ============= CENTRAL INTEGRATION CONFIGURATION SYSTEM =============
// Detta fil gör det enkelt för företag att konfigurera alla integrationer
// Ändra bara värdena här för att aktivera riktiga API:er

export interface IntegrationCredentials {
  enabled: boolean;
  environment: 'test' | 'production';
  credentials: Record<string, string>;
  endpoints?: Record<string, string>;
}

export interface SkatteverketConfig extends IntegrationCredentials {
  credentials: {
    apiKey: string;
    certificatePath: string;
    certificatePassword?: string;
  };
  endpoints: {
    heirLookup: string;
    personalNumberValidation: string;
  };
}

export interface BankIDConfig extends IntegrationCredentials {
  credentials: {
    certificatePath: string;
    certificatePassword: string;
    clientCert: string;
  };
  endpoints: {
    auth: string;
    sign: string;
    collect: string;
    cancel: string;
  };
}

export interface OpenBankingConfig extends IntegrationCredentials {
  credentials: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  supportedBanks: {
    [bankCode: string]: {
      name: string;
      apiBaseUrl: string;
      authEndpoint: string;
      tokenEndpoint: string;
      accountsEndpoint: string;
    };
  };
}

export interface NotificationConfig extends IntegrationCredentials {
  email: {
    provider: 'sendgrid' | 'postmark' | 'resend';
    credentials: {
      apiKey: string;
      fromEmail: string;
      fromName: string;
    };
  };
  sms: {
    provider: 'twilio' | 'textmagic' | '46elks';
    credentials: {
      apiKey: string;
      accountSid?: string;
      fromNumber: string;
    };
  };
}

// ============= HUVUDKONFIGURATION =============
// VIKTIG: Ändra dessa värden för att aktivera riktiga integrationer

export const INTEGRATION_CONFIG = {
  // SKATTEVERKET API - För hämtning av arvingar
  skatteverket: {
    enabled: false, // Sätt till true när API-nycklar är konfigurerade
    environment: 'test' as const,
    credentials: {
      apiKey: '', // Din Skatteverket API-nyckel
      certificatePath: '', // Sökväg till ditt certifikat
      certificatePassword: '', // Lösenord för certifikat (om krävs)
    },
    endpoints: {
      heirLookup: '/api/v1/estate/heirs',
      personalNumberValidation: '/api/v1/validate/personal-number',
    },
  } as SkatteverketConfig,

  // BANKID - För digital signering
  bankid: {
    enabled: true, // Aktiverat för testmiljö
    environment: 'test' as const,
    credentials: {
      certificatePath: 'test-bankid-cert.pem', // Test certifikat
      certificatePassword: '', // Inget lösenord krävs för testmiljö
      clientCert: `-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----`, // Test certifikat från BankID
    },
    endpoints: {
      auth: '/auth',
      sign: '/sign', 
      collect: '/collect',
      cancel: '/cancel',
    },
  } as BankIDConfig,

  // OPEN BANKING / PSD2 - För bankkontohämtning
  openBanking: {
    enabled: false, // Sätt till true när PSD2-tillstånd finns
    environment: 'test' as const,
    credentials: {
      clientId: '', // Din PSD2 Client ID
      clientSecret: '', // Din PSD2 Client Secret
      redirectUri: '', // Redirect URI för OAuth
    },
    supportedBanks: {
      swedbank: {
        name: 'Swedbank',
        apiBaseUrl: 'https://api.swedbank.se/psd2',
        authEndpoint: '/oauth/authorize',
        tokenEndpoint: '/oauth/token',
        accountsEndpoint: '/v1/accounts',
      },
      handelsbanken: {
        name: 'Handelsbanken',
        apiBaseUrl: 'https://api.handelsbanken.se/psd2',
        authEndpoint: '/oauth/authorize',
        tokenEndpoint: '/oauth/token',
        accountsEndpoint: '/v1/accounts',
      },
      seb: {
        name: 'SEB',
        apiBaseUrl: 'https://api.seb.se/psd2',
        authEndpoint: '/oauth/authorize',
        tokenEndpoint: '/oauth/token',
        accountsEndpoint: '/v1/accounts',
      },
      nordea: {
        name: 'Nordea',
        apiBaseUrl: 'https://api.nordea.com/psd2',
        authEndpoint: '/oauth/authorize',
        tokenEndpoint: '/oauth/token',
        accountsEndpoint: '/v1/accounts',
      },
    },
  } as OpenBankingConfig,

  // MEDDELANDEN - För e-post och SMS
  notifications: {
    enabled: false, // Sätt till true när tjänster är konfigurerade
    environment: 'test' as const,
    credentials: {},
    email: {
      provider: 'sendgrid' as const,
      credentials: {
        apiKey: '', // SendGrid API-nyckel
        fromEmail: 'noreply@yourdomain.se', // Avsändar-e-post
        fromName: 'Digitalt Arvsskifte', // Avsändarnamn
      },
    },
    sms: {
      provider: '46elks' as const,
      credentials: {
        apiKey: '', // 46elks API-nyckel
        accountSid: '', // Account SID (om krävs)
        fromNumber: '+46701234567', // Ditt SMS-nummer
      },
    },
  } as NotificationConfig,
};

// ============= HJÄLPFUNKTIONER =============

export class IntegrationManager {
  // Kontrollera om en integration är aktiverad och korrekt konfigurerad
  static isConfigured(integration: keyof typeof INTEGRATION_CONFIG): boolean {
    const config = INTEGRATION_CONFIG[integration];
    
    if (!config.enabled) {
      return false;
    }

    // Kontrollera att nödvändiga credentials finns
    switch (integration) {
      case 'skatteverket':
        const skConfig = config as SkatteverketConfig;
        return !!skConfig.credentials.apiKey;
        
      case 'bankid':
        const biConfig = config as BankIDConfig;
        return !!biConfig.credentials.certificatePath;
        
      case 'openBanking':
        const obConfig = config as OpenBankingConfig;
        return !!obConfig.credentials.clientId && !!obConfig.credentials.clientSecret;
        
      case 'notifications':
        const notConfig = config as NotificationConfig;
        return !!notConfig.email.credentials.apiKey;
        
      default:
        return false;
    }
  }

  // Hämta konfiguration för en specifik integration
  static getConfig<T extends keyof typeof INTEGRATION_CONFIG>(
    integration: T
  ): typeof INTEGRATION_CONFIG[T] {
    return INTEGRATION_CONFIG[integration];
  }

  // Hämta base URL för en integration baserat på miljö
  static getBaseUrl(integration: keyof typeof INTEGRATION_CONFIG): string {
    const config = INTEGRATION_CONFIG[integration];
    
    const baseUrls = {
      skatteverket: {
        test: 'https://api.skatteverket.se/test',
        production: 'https://api.skatteverket.se/prod',
      },
      bankid: {
        test: 'https://appapi2.test.bankid.com/rp/v6.0',
        production: 'https://appapi2.bankid.com/rp/v6.0',
      },
      openBanking: {
        test: 'https://sandbox.open-banking.se',
        production: 'https://api.open-banking.se',
      },
      notifications: {
        test: 'https://api.sendgrid.com',
        production: 'https://api.sendgrid.com',
      },
    };

    return baseUrls[integration][config.environment];
  }

  // Validera att alla nödvändiga konfigurationer är på plats
  static validateAllConfigurations(): {
    valid: boolean;
    missing: string[];
    warnings: string[];
  } {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Kontrollera Skatteverket
    if (!this.isConfigured('skatteverket')) {
      warnings.push('Skatteverket API är inte konfigurerat - använder mock-data');
    }

    // Kontrollera BankID
    if (!this.isConfigured('bankid')) {
      warnings.push('BankID är inte konfigurerat - använder mock-autentisering');
    }

    // Kontrollera Open Banking
    if (!this.isConfigured('openBanking')) {
      warnings.push('Open Banking/PSD2 är inte konfigurerat - använder mock-data');
    }

    // Kontrollera Notifications
    if (!this.isConfigured('notifications')) {
      warnings.push('Meddelanden är inte konfigurerade - e-post/SMS skickas inte');
    }

    return {
      valid: missing.length === 0,
      missing,
      warnings,
    };
  }

  // Logga konfigurationsstatus vid uppstart
  static logConfigurationStatus(): void {
    const status = this.validateAllConfigurations();
    
    console.log('🔧 INTEGRATION CONFIGURATION STATUS:');
    console.log('=====================================');
    
    Object.keys(INTEGRATION_CONFIG).forEach(key => {
      const isConfigured = this.isConfigured(key as keyof typeof INTEGRATION_CONFIG);
      const statusIcon = isConfigured ? '✅' : '⚠️';
      const statusText = isConfigured ? 'CONFIGURED' : 'MOCK MODE';
      console.log(`${statusIcon} ${key.toUpperCase()}: ${statusText}`);
    });
    
    if (status.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      status.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (status.missing.length > 0) {
      console.log('\n❌ MISSING REQUIRED CONFIG:');
      status.missing.forEach(missing => console.log(`   • ${missing}`));
    }
    
    console.log('\n📖 För att aktivera riktiga integrationer:');
    console.log('   1. Uppdatera src/config/integrationSettings.ts');
    console.log('   2. Sätt enabled: true för respektive integration');
    console.log('   3. Lägg till dina API-nycklar och certifikat');
    console.log('=====================================\n');
  }
}

// Exportera för enkel användning
export const {
  skatteverket: SKATTEVERKET_CONFIG,
  bankid: BANKID_CONFIG,
  openBanking: OPEN_BANKING_CONFIG,
  notifications: NOTIFICATION_CONFIG,
} = INTEGRATION_CONFIG;

export default INTEGRATION_CONFIG;