import { integrationConfig, isIntegrationReady } from '../config/integrations';

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
    return [
      'handelsbanken',
      'seb',
      'swedbank', 
      'nordea',
      'danske-bank',
      'lansforsakringar',
      'ica-banken',
      'sparbanken'
    ];
  }

  /**
   * Initiate PSD2 authentication flow
   */
  static async initiateAuth(bankCode: string): Promise<string | null> {
    if (!isIntegrationReady.supabase()) {
      console.warn('Open Banking requires Supabase backend integration');
      return null;
    }

    try {
      // TODO: Implement actual PSD2 authentication
      // This would typically redirect to bank's OAuth flow
      const authRequest: PSD2AuthRequest = {
        bankCode,
        redirectUri: `${window.location.origin}/callback`,
        scopes: ['accounts', 'balances']
      };

      // In production, this would call your backend endpoint
      const response = await fetch('/api/psd2/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authRequest)
      });

      const data = await response.json();
      return data.authUrl;
    } catch (error) {
      console.error('PSD2 auth initiation failed:', error);
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
    if (!isIntegrationReady.supabase()) {
      console.warn('Open Banking not configured, using mock data');
      return this.getMockAccounts(bankCode);
    }

    try {
      // TODO: Implement actual PSD2 API call
      const response = await fetch('/api/psd2/accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Bank-Code': bankCode,
          'Content-Type': 'application/json'
        }
      });

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