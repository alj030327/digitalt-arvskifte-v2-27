import { integrationConfig, isIntegrationReady } from '../config/integrations';

export interface OpenBankingAccount {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  iban?: string;
  bankCode: string;
  bankName: string;
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
   * Mock account data for development
   */
  private static getMockAccounts(bankCode: string): Promise<OpenBankingAccount[]> {
    const mockData: Record<string, OpenBankingAccount[]> = {
      'handelsbanken': [
        {
          accountId: 'hb-001',
          accountName: 'Sparkonto',
          accountType: 'SAVINGS',
          balance: 450000,
          currency: 'SEK',
          iban: 'SE35 6000 0000 0000 1234 5678',
          bankCode: 'handelsbanken',
          bankName: 'Handelsbanken'
        },
        {
          accountId: 'hb-002', 
          accountName: 'ISK',
          accountType: 'INVESTMENT',
          balance: 890000,
          currency: 'SEK',
          bankCode: 'handelsbanken',
          bankName: 'Handelsbanken'
        }
      ],
      'seb': [
        {
          accountId: 'seb-001',
          accountName: 'Lönekonto',
          accountType: 'CURRENT',
          balance: 65000,
          currency: 'SEK',
          iban: 'SE45 5000 0000 0000 9876 5432',
          bankCode: 'seb',
          bankName: 'SEB'
        },
        {
          accountId: 'seb-002',
          accountName: 'Pensionskonto',
          accountType: 'PENSION',
          balance: 1200000,
          currency: 'SEK',
          bankCode: 'seb',
          bankName: 'SEB'
        }
      ],
      'nordea': [
        {
          accountId: 'nordea-001',
          accountName: 'Pluskonto',
          accountType: 'CURRENT',
          balance: 120000,
          currency: 'SEK',
          iban: 'SE12 3000 0000 0000 5555 4444',
          bankCode: 'nordea',
          bankName: 'Nordea'
        }
      ]
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData[bankCode] || []);
      }, 2000); // Simulate API delay
    });
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
      accountNumber: account.iban || account.accountId,
      amount: account.balance
    };
  }

  /**
   * Map PSD2 account types to internal asset types
   */
  private static mapAccountTypeToAssetType(accountType: string): string {
    const mapping: Record<string, string> = {
      'CURRENT': 'Bankinsättning',
      'SAVINGS': 'Bankinsättning', 
      'INVESTMENT': 'Aktier/Fonder',
      'PENSION': 'Pension',
      'LOAN': 'Bolån',
      'CREDIT_CARD': 'Kreditkort'
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