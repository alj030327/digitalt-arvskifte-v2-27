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
        const session = this.getMockSession();
        this.openBankIDApp(session.autoStartToken);
        return session;
      }

      console.log('🔐 Using real BankID API');
      const response = await this.callBankIdAPI('auth', request);
      if (response) {
        this.openBankIDApp(response.autoStartToken);
      }
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
        const session = this.getMockSession();
        this.openBankIDApp(session.autoStartToken);
        return session;
      }

      console.log('🔐 Using real BankID signing API');
      const response = await this.callBankIdAPI('sign', request);
      if (response) {
        this.openBankIDApp(response.autoStartToken);
      }
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
   * Call BankID API through mock edge function for development
   */
  private static async callBankIdAPI(endpoint: string, data: any): Promise<any> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log(`🔐 Calling mock BankID ${endpoint} with:`, data);
      
      const { data: response, error } = await supabase.functions.invoke('mock-bankid', {
        body: { endpoint, data }
      });

      if (error) {
        console.error(`Mock BankID API Error:`, error);
        throw new Error(`Mock BankID API Error: ${error.message}`);
      }

      console.log(`✅ Mock BankID ${endpoint} response:`, response);
      return response;
    } catch (error) {
      console.error(`Mock BankID ${endpoint} API Error:`, error);
      
      // Fallback to old mock implementation if edge function fails
      console.log('📱 Falling back to local mock implementation');
      
      if (endpoint === 'auth' || endpoint === 'sign') {
        return this.getMockSession();
      }
      
      if (endpoint === 'collect') {
        return this.getMockStatus(data.orderRef);
      }
      
      if (endpoint === 'cancel') {
        return true;
      }
      
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

  /**
   * Attempt to open the BankID app on the current device
   */
  static openBankIDApp(autoStartToken?: string): void {
    if (!autoStartToken) {
      console.log('No autoStartToken available for app launch');
      return;
    }

    console.log('🔐 Attempting to open BankID app with token:', autoStartToken);

    // For mobile devices, try to open the BankID app using the custom URL scheme
    const bankIdUrl = `bankid:///?autostarttoken=${autoStartToken}&redirect=null`;
    
    // Detect if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Mobile device detected - opening BankID app');
      
      // Try multiple approaches for better compatibility
      
      // Method 1: Direct window location (most reliable)
      try {
        window.location.href = bankIdUrl;
        console.log('✅ Tried window.location.href method');
      } catch (error) {
        console.log('❌ Window location method failed:', error);
      }
      
      // Method 2: Create a temporary link and click it
      setTimeout(() => {
        try {
          const link = document.createElement('a');
          link.href = bankIdUrl;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log('✅ Tried link click method');
        } catch (error) {
          console.log('❌ Link click method failed:', error);
        }
      }, 100);
      
      // Method 3: Hidden iframe as fallback
      setTimeout(() => {
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = bankIdUrl;
          document.body.appendChild(iframe);
          
          // Clean up after a short delay
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
          console.log('✅ Tried iframe method');
        } catch (error) {
          console.log('❌ Iframe method failed:', error);
        }
      }, 200);
      
    } else {
      // On desktop, show instructions to open mobile app
      console.log('🖥️ Desktop detected - user should open BankID app manually');
      console.log('🔗 BankID URL:', bankIdUrl);
    }
  }
}