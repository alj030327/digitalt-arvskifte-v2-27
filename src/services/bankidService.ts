import { IntegrationManager, BANKID_CONFIG } from '@/config/integrationSettings';
import { isDemoMode, mockBankIDResponses, demoLogger } from '@/config/demoConfig';

// =============================================================================
// DEMO BANKID SERVICE
// =============================================================================
// This service is configured for DEMONSTRATION PURPOSES ONLY
// It shows BankID integration functionality using mock responses
// For production, replace with real BankID API integration
// 
// PRODUCTION INTEGRATION NOTES:
// - Replace mock edge function with real BankID API calls
// - Implement proper certificate-based authentication
// - Add production-grade error handling and logging
// - Implement proper encryption for sensitive data transmission
// - Add audit trails for all BankID operations
// =============================================================================

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
      // Demo mode - return mock response
      if (isDemoMode()) {
        demoLogger.info('BankID authenticate (demo mode)', { personalNumber: request.personalNumber });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        return {
          orderRef: mockBankIDResponses.auth.orderRef,
          autoStartToken: mockBankIDResponses.auth.autoStartToken,
          qrStartToken: mockBankIDResponses.auth.qrStartToken,
          qrStartSecret: mockBankIDResponses.auth.qrStartSecret
        };
      }

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
   * Generate QR code data for BankID according to official specification
   * Format: bankid.{qrStartToken}.{time}.{qrAuthCode}
   * Where qrAuthCode = HMACSHA256(qrStartSecret, time)
   */
  static generateQRCodeData(qrStartToken: string, qrStartSecret: string, orderTime: number): string {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceOrder = currentTime - orderTime;
    
    // For test environment, we'll create a simple mock HMAC
    // In production, this would use proper HMAC-SHA256
    const mockHmac = this.generateMockHMAC(qrStartSecret, timeSinceOrder.toString());
    
    const qrData = `bankid.${qrStartToken}.${timeSinceOrder}.${mockHmac}`;
    console.log('🔍 Generated QR data (BankID format):', { qrData, timeSinceOrder, orderTime, currentTime });
    return qrData;
  }

  /**
   * Generate a mock HMAC for test environment
   * In production, use proper crypto.subtle or a crypto library
   */
  private static generateMockHMAC(secret: string, data: string): string {
    // Simple hash function for test environment
    let hash = 0;
    const input = secret + data;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Return a 64-character hex string (like real HMAC-SHA256)
    const hashHex = Math.abs(hash).toString(16);
    return hashHex.padStart(64, '0').substring(0, 64);
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
    console.log('🔍 User agent:', navigator.userAgent);

    // BankID URL scheme
    const bankIdUrl = `bankid:///?autostarttoken=${autoStartToken}&redirect=null`;
    
    // Check if we're in a Capacitor app
    const isCapacitor = (window as any).Capacitor !== undefined;
    
    if (isCapacitor) {
      console.log('📱 Running in Capacitor app - using native URL opening');
      // In Capacitor, we can reliably open external apps
      window.open(bankIdUrl, '_system');
    } else {
      // Fallback for web browsers
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log('📱 Mobile browser detected - attempting to open BankID app');
        
        // Create invisible iframe to trigger app opening
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = bankIdUrl;
        document.body.appendChild(iframe);
        
        // Remove iframe after a short delay
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
        
        console.log('✅ BankID URL triggered via iframe:', bankIdUrl);
      } else {
        console.log('🖥️ Desktop detected - user should open BankID app manually');
        console.log('🔗 BankID URL:', bankIdUrl);
      }
    }
  }

  /**
   * Show a mock BankID interface for demo purposes
   */
  private static showMockBankIDInterface(): void {
    // Create a mock modal to simulate BankID opening
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      color: white;
      font-family: Arial, sans-serif;
    `;
    
    modal.innerHTML = `
      <div style="
        background: #003366;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        max-width: 300px;
        width: 90%;
      ">
        <div style="font-size: 24px; margin-bottom: 20px;">🏦</div>
        <h2 style="margin: 0 0 15px 0; color: white;">BankID</h2>
        <p style="margin: 0 0 20px 0; color: white;">Simulerar öppning av BankID-appen...</p>
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #fff;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
        <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.8; color: white;">
          Detta är en demo. I verkligheten skulle BankID-appen öppnas här.
        </p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(modal);
    
    // Remove the modal after 3 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 3000);
    
    console.log('📱 Mock BankID app interface shown');
  }
}