// Abstract interfaces for notification services
export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
}

export interface EmailProvider {
  sendEmail(to: string, subject: string, content: string, attachments?: EmailAttachment[]): Promise<boolean>;
}

export interface SMSProvider {
  sendSMS(phoneNumber: string, message: string): Promise<boolean>;
}

export interface ESignatureProvider {
  sendESignatureRequest(recipient: {
    email: string;
    phone: string;
    name: string;
    personalNumber: string;
  }, document: File, metadata: {
    documentType: 'inheritance_settlement' | 'power_of_attorney';
    deceasedPersonalNumber: string;
    deadline?: Date;
  }): Promise<{
    signatureId: string;
    trackingUrl: string;
  }>;
  
  checkSignatureStatus(signatureId: string): Promise<{
    status: 'pending' | 'signed' | 'declined' | 'expired';
    signedAt?: Date;
    ipAddress?: string;
  }>;
}

// Mock implementations (can be easily replaced with real services)
// Real email implementation using Supabase edge function
export class RealEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, content: string, attachments?: EmailAttachment[]): Promise<boolean> {
    try {
      const response = await fetch('/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          html: content,
          attachments: attachments?.map(att => ({
            filename: att.filename,
            content: att.content
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`📧 Email sent to: ${to} - ID: ${result.id}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
}

// Mock implementation - fallback when API is not configured
export class MockEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, content: string, attachments?: EmailAttachment[]): Promise<boolean> {
    console.log(`📧 Mock Email sent to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${content}`);
    if (attachments) {
      console.log(`Attachments: ${attachments.map(f => f.filename).join(', ')}`);
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
}

// Real SMS implementation using Twilio via Supabase edge function
export class RealSMSProvider implements SMSProvider {
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await fetch('/functions/v1/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, message })
      });
      
      if (!response.ok) {
        throw new Error(`SMS sending failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`📱 SMS sent to: ${phoneNumber} - SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }
}

// Mock implementation - fallback when API is not configured
export class MockSMSProvider implements SMSProvider {
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    console.log(`📱 Mock SMS sent to ${phoneNumber}:`);
    console.log(`Message: ${message}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }
}

export class MockESignatureProvider implements ESignatureProvider {
  async sendESignatureRequest(
    recipient: {
      email: string;
      phone: string;
      name: string;
      personalNumber: string;
    }, 
    document: File, 
    metadata: {
      documentType: 'inheritance_settlement' | 'power_of_attorney';
      deceasedPersonalNumber: string;
      deadline?: Date;
    }
  ): Promise<{ signatureId: string; trackingUrl: string }> {
    console.log(`✍️ Sending e-signature request to ${recipient.name} (${recipient.email})`);
    console.log(`Document: ${document.name}`);
    console.log(`Type: ${metadata.documentType}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const signatureId = `sig_${Date.now()}_${recipient.personalNumber.replace('-', '')}`;
    const trackingUrl = `https://esign.example.com/track/${signatureId}`;
    
    return { signatureId, trackingUrl };
  }
  
  async checkSignatureStatus(signatureId: string): Promise<{
    status: 'pending' | 'signed' | 'declined' | 'expired';
    signedAt?: Date;
    ipAddress?: string;
  }> {
    console.log(`🔍 Checking signature status for ${signatureId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock random status for demo purposes
    const statuses: ('pending' | 'signed' | 'declined' | 'expired')[] = ['pending', 'signed', 'declined'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      status: randomStatus,
      signedAt: randomStatus === 'signed' ? new Date() : undefined,
      ipAddress: randomStatus === 'signed' ? '192.168.1.100' : undefined
    };
  }
}

// Notification service that combines email and SMS
export class NotificationService {
  constructor(
    private emailProvider: EmailProvider = new RealEmailProvider(),
    private smsProvider: SMSProvider = new RealSMSProvider(),
    private eSignatureProvider: ESignatureProvider = new MockESignatureProvider()
  ) {}

  async sendInheritanceSettlementForSigning(
    beneficiaries: Array<{
      name: string;
      email: string;
      phone: string;
      personalNumber: string;
    }>,
    settlementPdf: File,
    deceasedPersonalNumber: string
  ): Promise<Array<{
    beneficiary: string;
    signatureId: string;
    trackingUrl: string;
    emailSent: boolean;
    smsSent: boolean;
  }>> {
    const results = [];

    for (const beneficiary of beneficiaries) {
      try {
        // Send e-signature request
        const eSignResult = await this.eSignatureProvider.sendESignatureRequest(
          beneficiary,
          settlementPdf,
          {
            documentType: 'inheritance_settlement',
            deceasedPersonalNumber,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        );

        // Send email notification
        const emailContent = `
Hej ${beneficiary.name},

Du har fått ett arvsskifte för digital signering.

Klicka här för att signera: ${eSignResult.trackingUrl}

Dokument måste signeras inom 7 dagar.

Med vänliga hälsningar,
Digitalt Arvsskifte
        `;

        const emailSent = await this.emailProvider.sendEmail(
          beneficiary.email,
          'Arvsskifte för digital signering',
          emailContent
        );

        // Send SMS notification
        const smsMessage = `Arvsskifte väntar på din digitala signatur. Signera här: ${eSignResult.trackingUrl}`;
        const smsSent = await this.smsProvider.sendSMS(beneficiary.phone, smsMessage);

        results.push({
          beneficiary: beneficiary.name,
          signatureId: eSignResult.signatureId,
          trackingUrl: eSignResult.trackingUrl,
          emailSent,
          smsSent
        });

      } catch (error) {
        console.error(`Failed to send to ${beneficiary.name}:`, error);
        results.push({
          beneficiary: beneficiary.name,
          signatureId: '',
          trackingUrl: '',
          emailSent: false,
          smsSent: false
        });
      }
    }

    return results;
  }

  async sendPowerOfAttorneyForApproval(
    heirs: Array<{
      name: string;
      email?: string;
      phone?: string;
      personalNumber: string;
    }>,
    powerOfAttorneyPdf: File,
    representativeName: string,
    deceasedPersonalNumber: string
  ): Promise<Array<{
    heir: string;
    signatureId: string;
    trackingUrl: string;
    emailSent: boolean;
    smsSent: boolean;
  }>> {
    const results = [];

    for (const heir of heirs) {
      if (!heir.email || !heir.phone) {
        console.warn(`Missing contact info for ${heir.name}, skipping`);
        continue;
      }

      try {
        // Send e-signature request for power of attorney approval
        const eSignResult = await this.eSignatureProvider.sendESignatureRequest(
          {
            name: heir.name,
            email: heir.email,
            phone: heir.phone,
            personalNumber: heir.personalNumber
          },
          powerOfAttorneyPdf,
          {
            documentType: 'power_of_attorney',
            deceasedPersonalNumber,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
          }
        );

        // Send email notification
        const emailContent = `
Hej ${heir.name},

En fullmakt har begärts för dödsboet där ${representativeName} ska företräda dödsboet.

Du behöver godkänna eller avslå denna fullmakt genom digital signering.

Klicka här: ${eSignResult.trackingUrl}

Med vänliga hälsningar,
Digitalt Arvsskifte
        `;

        const emailSent = await this.emailProvider.sendEmail(
          heir.email,
          'Godkännande av fullmakt krävs',
          emailContent
        );

        // Send SMS notification
        const smsMessage = `Fullmakt för ${representativeName} behöver ditt godkännande. Signera: ${eSignResult.trackingUrl}`;
        const smsSent = await this.smsProvider.sendSMS(heir.phone, smsMessage);

        results.push({
          heir: heir.name,
          signatureId: eSignResult.signatureId,
          trackingUrl: eSignResult.trackingUrl,
          emailSent,
          smsSent
        });

      } catch (error) {
        console.error(`Failed to send to ${heir.name}:`, error);
        results.push({
          heir: heir.name,
          signatureId: '',
          trackingUrl: '',
          emailSent: false,
          smsSent: false
        });
      }
    }

    return results;
  }

  async checkAllSignatureStatuses(signatureIds: string[]): Promise<Record<string, {
    status: 'pending' | 'signed' | 'declined' | 'expired';
    signedAt?: Date;
    ipAddress?: string;
  }>> {
    const results: Record<string, any> = {};

    for (const signatureId of signatureIds) {
      try {
        results[signatureId] = await this.eSignatureProvider.checkSignatureStatus(signatureId);
      } catch (error) {
        console.error(`Failed to check status for ${signatureId}:`, error);
        results[signatureId] = { status: 'pending' };
      }
    }

    return results;
  }
}

// Export singleton instance for easy use
export const notificationService = new NotificationService();