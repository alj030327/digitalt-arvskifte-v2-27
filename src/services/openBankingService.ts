import { IntegrationManager, OPEN_BANKING_CONFIG } from '@/config/integrationSettings';
import { isDemoMode, demoConfig, demoLogger } from '@/config/demoConfig';

export interface OpenBankingAccount {
  accountId: string;
  iban: string;
  accountNumber: string;
  sortCode: string;
  accountType: string;
  currency: string;
  balance: number;
  availableBalance: number;
  accountName: string;
  bankName: string;
  lastUpdated: string;
}

export interface PSD2AuthRequest {
  bankCode: string;
  redirectUri: string;
  scopes: string[];
}

export interface PSD2TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export class OpenBankingService {
  /**
   * Get list of supported banks for PSD2/Open Banking
   */
  static getSupportedBanks(): string[] {
    if (!IntegrationManager.isConfigured('openBanking')) {
      console.log('🏦 Open Banking not configured - returning mock banks');
      return ['swedbank', 'handelsbanken', 'seb', 'nordea'];
    }
    
    const config = OPEN_BANKING_CONFIG;
    return Object.keys(config.supportedBanks);
  }

  /**
   * Initiate PSD2 authentication flow
   */
  static async initiateAuth(bankCode: string): Promise<string | null> {
    try {
      // Demo mode - return mock auth code
      if (isDemoMode()) {
        demoLogger.info('OpenBanking initiate auth (demo mode)', { bankCode });
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `demo_auth_code_${bankCode}_${Date.now()}`;
      }

      if (!IntegrationManager.isConfigured('openBanking')) {
        console.log('🏦 Open Banking not configured - using mock auth flow');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `mock_auth_code_${bankCode}_${Date.now()}`;
      }

      console.log('🏦 Using real Open Banking/PSD2 API');
      const config = OPEN_BANKING_CONFIG;
      const bankConfig = config.supportedBanks[bankCode];
      
      if (!bankConfig) {
        throw new Error(`Unsupported bank: ${bankCode}`);
      }
      
      const authUrl = `${bankConfig.apiBaseUrl}${bankConfig.authEndpoint}?` +
        `client_id=${config.credentials.clientId}&` +
        `redirect_uri=${config.credentials.redirectUri}&` +
        `scope=accounts&` +
        `response_type=code&` +
        `state=${Date.now()}`;
      
      console.log(`Initiating real PSD2 auth for ${bankCode}:`, authUrl);
      
      // In a real implementation, this would redirect the user to the bank's auth page
      // The user would be redirected back with an authorization code
      window.location.href = authUrl;
      
      return null; // The actual code will come from the redirect
    } catch (error) {
      console.error('PSD2 Auth initiation failed:', error);
      return null;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeToken(code: string, bankCode: string): Promise<PSD2TokenResponse | null> {
    try {
      // TODO: Implement token exchange with bank
      const response = await fetch('/api/psd2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, bankCode })
      });

      return await response.json();
    } catch (error) {
      console.error('Token exchange failed:', error);
      return null;
    }
  }

  /**
   * Fetch accounts from bank using PSD2
   */
  static async fetchAccounts(bankCode: string, accessToken: string): Promise<OpenBankingAccount[]> {
    // Demo mode - return mock accounts
    if (isDemoMode()) {
      demoLogger.info('OpenBanking fetch accounts (demo mode)', { bankCode });
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay
      
      // Convert demo config accounts to OpenBankingAccount format
      const bankAccounts = demoConfig.mockAccounts.filter(account => 
        account.bank.toLowerCase().includes(bankCode.toLowerCase())
      );
      
      return bankAccounts.map((account, index) => ({
        accountId: `${bankCode.toUpperCase()}-${Date.now()}-${index}`,
        iban: `SE${String(Math.floor(Math.random() * 100)).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}${String(Math.floor(Math.random() * 1000000000)).padStart(16, '0')}`,
        accountNumber: account.accountNumber,
        sortCode: bankCode === 'swedbank' ? '8000' : bankCode === 'handelsbanken' ? '6000' : '5000',
        accountType: account.accountType,
        currency: account.currency,
        balance: account.balance,
        availableBalance: account.balance,
        accountName: account.accountType,
        bankName: account.bank,
        lastUpdated: new Date().toISOString()
      }));
    }

    if (!IntegrationManager.isConfigured('openBanking')) {
      console.log('🏦 Open Banking not configured - using mock account data');
      return this.getMockAccounts(bankCode);
    }

    try {
      console.log('🏦 Fetching real accounts via PSD2 API');
      const config = OPEN_BANKING_CONFIG;
      const bankConfig = config.supportedBanks[bankCode];
      
      if (!bankConfig) {
        throw new Error(`Unsupported bank: ${bankCode}`);
      }

      const response = await fetch(`${bankConfig.apiBaseUrl}${bankConfig.accountsEndpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`PSD2 API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.accounts || [];
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      return [];
    }
  }

  /**
   * Generate randomized mock account data for development/testing
   */
  private static async getMockAccounts(bankCode: string): Promise<OpenBankingAccount[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const bankConfig = {
      'swedbank': { name: 'Swedbank', sortCode: '8000' },
      'handelsbanken': { name: 'Handelsbanken', sortCode: '6000' },
      'seb': { name: 'SEB', sortCode: '5000' },
      'nordea': { name: 'Nordea', sortCode: '3000' }
    };

    const accountTypes = [
      'Sparkonto', 'Lönekonto', 'Pensionskonto', 'Investeringskonto', 
      'Byggnadskreditiv', 'Kapitalförsäkring', 'ISK', 'Aktiekonto'
    ];

    const accountNames = [
      'Huvudkonto', 'Sparande', 'Pension', 'Aktier och fonder',
      'Lön och utgifter', 'Buffert', 'Semester', 'Bil och transport',
      'Hushållskassa', 'Investeringar', 'Långsiktigt sparande'
    ];

    const bank = bankConfig[bankCode as keyof typeof bankConfig];
    if (!bank) return [];

    // Generate 1-4 random accounts per bank
    const numAccounts = Math.floor(Math.random() * 4) + 1;
    const accounts: OpenBankingAccount[] = [];

    for (let i = 0; i < numAccounts; i++) {
      // Generate random account number
      const accountNumber = String(Math.floor(Math.random() * 900000000) + 100000000);
      
      // Generate random IBAN
      const checkDigits = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      const bankCode2 = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const accountCode = accountNumber.padStart(16, '0');
      const iban = `SE${checkDigits}${bankCode2}${accountCode}`;

      // Random account type and name
      const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
      const accountName = accountNames[Math.floor(Math.random() * accountNames.length)];

      // Generate realistic balance based on account type
      let balance: number;
      if (accountType === 'Pensionskonto') {
        balance = Math.floor(Math.random() * 2000000) + 500000; // 500k - 2.5M
      } else if (accountType === 'Investeringskonto' || accountType === 'ISK' || accountType === 'Aktiekonto') {
        balance = Math.floor(Math.random() * 1500000) + 100000; // 100k - 1.6M
      } else if (accountType === 'Sparkonto') {
        balance = Math.floor(Math.random() * 800000) + 50000; // 50k - 850k
      } else if (accountType === 'Kapitalförsäkring') {
        balance = Math.floor(Math.random() * 1000000) + 200000; // 200k - 1.2M
      } else {
        balance = Math.floor(Math.random() * 400000) + 10000; // 10k - 410k
      }

      accounts.push({
        accountId: `${bankCode.toUpperCase()}-${accountNumber}`,
        iban,
        accountNumber,
        sortCode: bank.sortCode,
        accountType,
        currency: 'SEK',
        balance,
        availableBalance: balance,
        accountName,
        bankName: bank.name,
        lastUpdated: new Date().toISOString()
      });
    }

    return accounts;
  }

  /**
   * Convert Open Banking account to internal Asset format
   */
  static convertToAsset(account: OpenBankingAccount): any {
    return {
      id: account.accountId,
      bank: account.bankName,
      accountType: account.accountName,
      assetType: this.mapAccountTypeToAssetType(account.accountType),
      accountNumber: account.iban,
      amount: account.balance
    };
  }

  /**
   * Map account types to internal asset types
   */
  private static mapAccountTypeToAssetType(accountType: string): string {
    const mapping: Record<string, string> = {
      'Sparkonto': 'Bankinsättning',
      'Lönekonto': 'Bankinsättning',
      'Pensionskonto': 'Pension',
      'Investeringskonto': 'Aktier/Fonder',
      'ISK': 'Aktier/Fonder',
      'Aktiekonto': 'Aktier/Fonder',
      'Kapitalförsäkring': 'Kapitalförsäkring',
      'Byggnadskreditiv': 'Fastighet'
    };

    return mapping[accountType] || 'Bankinsättning';
  }

  /**
   * Get bank display name from code
   */
  static getBankDisplayName(bankCode: string): string {
    const names: Record<string, string> = {
      'handelsbanken': 'Handelsbanken',
      'seb': 'SEB',
      'swedbank': 'Swedbank',
      'nordea': 'Nordea',
      'danske-bank': 'Danske Bank',
      'lansforsakringar': 'Länsförsäkringar Bank',
      'ica-banken': 'ICA Banken',
      'sparbanken': 'Sparbanken'
    };

    return names[bankCode] || bankCode;
  }
}