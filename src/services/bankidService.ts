import { IntegrationManager, BANKID_CONFIG } from '@/config/integrationSettings';

export interface BankIdSession {
  orderRef: string;
  autoStartToken?: string;
  qrStartToken?: string;
  qrStartSecret?: string;
}

export interface BankIdStatus {
  orderRef: string;
  status: 'pending' | 'failed' | 'complete';
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

export interface BankIdAuthRequest {
  personalNumber?: string;
  endUserIp: string;
  requirement?: {
    autoStartTokenRequired?: boolean;
    allowFingerprint?: boolean;
  };
}

export interface BankIdSignRequest extends BankIdAuthRequest {
  userVisibleData: string; // Base64 encoded text
  userNonVisibleData?: string; // Base64 encoded data
}

export class BankIdService {
  /**
   * Initiate BankID authentication
   */
  static async authenticate(request: BankIdAuthRequest): Promise<BankIdSession | null> {
    try {
      if (!IntegrationManager.isConfigured('bankid')) {
        console.log('🔐 BankID not configured - using mock authentication');
        return this.getMockSession();
      }

      console.log('🔐 Using real BankID API');
      const response = await this.callBankIdAPI('auth', request);
      return response;
    } catch (error) {
      console.error('BankID authentication failed:', error);
      return null;
    }
  }

  /**
   * Initiate BankID signing
   */
  static async sign(request: BankIdSignRequest): Promise<BankIdSession | null> {
    try {
      if (!IntegrationManager.isConfigured('bankid')) {
        console.log('🔐 BankID not configured - using mock signing');
        return this.getMockSession();
      }

      console.log('🔐 Using real BankID signing API');
      const response = await this.callBankIdAPI('sign', request);
      return response;
    } catch (error) {
      console.error('BankID signing failed:', error);
      return null;
    }
  }

  /**
   * Check status of BankID operation
   */
  static async checkStatus(orderRef: string): Promise<BankIdStatus | null> {
    try {
      if (!IntegrationManager.isConfigured('bankid')) {
        return this.getMockStatus(orderRef);
      }

      const response = await this.callBankIdAPI('collect', { orderRef });
      return response;
    } catch (error) {
      console.error('BankID status check failed:', error);
      return null;
    }
  }

  /**
   * Cancel BankID operation
   */
  static async cancel(orderRef: string): Promise<boolean> {
    try {
      if (!IntegrationManager.isConfigured('bankid')) {
        return true; // Mock success
      }

      await this.callBankIdAPI('cancel', { orderRef });
      return true;
    } catch (error) {
      console.error('BankID cancellation failed:', error);
      return false;
    }
  }

  /**
   * Placeholder for actual API calls
   * In production, implement as secure backend endpoints
   */
  private static async callBankIdAPI(endpoint: string, data: any): Promise<any> {
    if (!IntegrationManager.isConfigured('bankid')) {
      // Mock implementation for development
      if (endpoint === 'auth' || endpoint === 'sign') {
        return this.getMockSession();
      }
      
      if (endpoint === 'collect') {
        return this.getMockStatus(data.orderRef);
      }
      
      if (endpoint === 'cancel') {
        return true;
      }
      
      throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    // Real BankID API implementation
    const config = BANKID_CONFIG;
    const baseUrl = IntegrationManager.getBaseUrl('bankid');
    
    try {
      const response = await fetch(`${baseUrl}${config.endpoints[endpoint as keyof typeof config.endpoints]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In a real implementation, you would add certificate authentication here
          'X-Client-Cert': config.credentials.clientCert,
        },
        // In a real implementation, you would configure TLS client certificates
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`BankID API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`BankID ${endpoint} API Error:`, error);
      throw error;
    }
  }

  /**
   * Generate realistic mock BankID session for development
   */
  private static getMockSession(): BankIdSession {
    // Generate realistic looking tokens similar to real BankID format
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    
    return {
      orderRef: `${timestamp}-${randomSuffix}`,
      autoStartToken: `bankid.${randomSuffix}.${timestamp}.auto`,
      qrStartToken: `bankid.${randomSuffix}.${timestamp}.qr`,
      qrStartSecret: `qr.${Math.random().toString(36).substring(2, 20)}.secret`
    };
  }

  /**
   * Mock status progression with randomized user data for development
   */
  private static getMockStatus(orderRef: string): Promise<BankIdStatus> {
    return new Promise((resolve) => {
      // Simulate realistic BankID flow progression
      const elapsed = Date.now() - parseInt(orderRef.split('-')[0] || '0');
      
      // Different mock users for variety
      const mockUsers = [
        { personalNumber: '198001011234', name: 'Anna Andersson', givenName: 'Anna', surname: 'Andersson' },
        { personalNumber: '198505152345', name: 'Erik Johansson', givenName: 'Erik', surname: 'Johansson' },
        { personalNumber: '199203103456', name: 'Maria Karlsson', givenName: 'Maria', surname: 'Karlsson' },
        { personalNumber: '197712124567', name: 'Lars Nilsson', givenName: 'Lars', surname: 'Nilsson' },
        { personalNumber: '198909215678', name: 'Karin Eriksson', givenName: 'Karin', surname: 'Eriksson' }
      ];
      
      // Add random delay simulation for more realistic timing
      const baseDelay = 2000;
      const randomDelay = Math.random() * 3000;
      
      setTimeout(() => {
        if (elapsed < baseDelay) {
          resolve({
            orderRef,
            status: 'pending',
            hintCode: 'outstandingTransaction'
          });
        } else if (elapsed < baseDelay + randomDelay) {
          resolve({
            orderRef,
            status: 'pending',
            hintCode: 'userSign'
          });
        } else if (elapsed < baseDelay + randomDelay + 1000) {
          resolve({
            orderRef,
            status: 'pending',
            hintCode: 'started'
          });
        } else {
          // Randomly succeed or fail for testing (95% success rate)
          const success = Math.random() > 0.05;
          
          if (success) {
            const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
            const timestamp = Date.now();
            
            resolve({
              orderRef,
              status: 'complete',
              completionData: {
                user: randomUser,
                device: {
                  ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                  uhi: `uhi-${Math.random().toString(36).substring(2, 15)}`
                },
                signature: `signature.${timestamp}.${Math.random().toString(36).substring(2, 15)}`,
                ocspResponse: `ocsp.${timestamp}.${Math.random().toString(36).substring(2, 25)}`
              }
            });
          } else {
            // Random failure reasons
            const failureReasons = ['userCancel', 'cancelled', 'startFailed', 'expiredTransaction'];
            const hintCode = failureReasons[Math.floor(Math.random() * failureReasons.length)];
            
            resolve({
              orderRef,
              status: 'failed',
              hintCode
            });
          }
        }
      }, 300 + Math.random() * 500);
    });
  }

  /**
   * Encode text for BankID userVisibleData
   */
  static encodeUserVisibleData(text: string): string {
    return btoa(unescape(encodeURIComponent(text)));
  }

  /**
   * Generate QR code data for BankID
   */
  static generateQRCodeData(qrStartToken: string, qrStartSecret: string, timestamp: number): string {
    // Simplified QR generation - in real implementation use proper crypto
    const qrAuthData = `bankid.${qrStartToken}.${timestamp}.${qrStartSecret}`;
    return btoa(qrAuthData);
  }
}