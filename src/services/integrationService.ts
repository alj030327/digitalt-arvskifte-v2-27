// ============= INTEGRATION SERVICE =============
// Central service för att hantera alla externa integrationer
// Detta gör det enkelt att växla mellan mock och riktiga API:er

import { IntegrationManager, INTEGRATION_CONFIG } from '@/config/integrationSettings';
import { SkatteverketService } from './skatteverketService';
import { BankIdService } from './bankidService';
import { OpenBankingService } from './openBankingService';
import { NotificationService } from './notificationService';

export interface IntegrationStatus {
  name: string;
  enabled: boolean;
  configured: boolean;
  environment: 'test' | 'production';
  status: 'ready' | 'mock' | 'error';
  message: string;
}

export class IntegrationService {
  // Hämta status för alla integrationer
  static getIntegrationsStatus(): IntegrationStatus[] {
    const integrations: IntegrationStatus[] = [];

    // Skatteverket
    integrations.push({
      name: 'Skatteverket API',
      enabled: INTEGRATION_CONFIG.skatteverket.enabled,
      configured: IntegrationManager.isConfigured('skatteverket'),
      environment: INTEGRATION_CONFIG.skatteverket.environment,
      status: IntegrationManager.isConfigured('skatteverket') ? 'ready' : 'mock',
      message: IntegrationManager.isConfigured('skatteverket') 
        ? 'Konfigurerad för att hämta arvingar från Skatteverket'
        : 'Använder mock-data för arvingar',
    });

    // BankID
    integrations.push({
      name: 'BankID',
      enabled: INTEGRATION_CONFIG.bankid.enabled,
      configured: IntegrationManager.isConfigured('bankid'),
      environment: INTEGRATION_CONFIG.bankid.environment,
      status: IntegrationManager.isConfigured('bankid') ? 'ready' : 'mock',
      message: IntegrationManager.isConfigured('bankid')
        ? 'Konfigurerad för digital signering'
        : 'Använder mock BankID-autentisering',
    });

    // Open Banking
    integrations.push({
      name: 'Open Banking/PSD2',
      enabled: INTEGRATION_CONFIG.openBanking.enabled,
      configured: IntegrationManager.isConfigured('openBanking'),
      environment: INTEGRATION_CONFIG.openBanking.environment,
      status: IntegrationManager.isConfigured('openBanking') ? 'ready' : 'mock',
      message: IntegrationManager.isConfigured('openBanking')
        ? 'Konfigurerad för bankkontohämtning'
        : 'Använder mock-bankdata',
    });

    // Meddelanden
    integrations.push({
      name: 'E-post & SMS',
      enabled: INTEGRATION_CONFIG.notifications.enabled,
      configured: IntegrationManager.isConfigured('notifications'),
      environment: INTEGRATION_CONFIG.notifications.environment,
      status: IntegrationManager.isConfigured('notifications') ? 'ready' : 'mock',
      message: IntegrationManager.isConfigured('notifications')
        ? 'Konfigurerad för e-post och SMS-meddelanden'
        : 'Meddelanden loggas endast till konsolen',
    });

    return integrations;
  }

  // Initiera alla integrationer vid appstart
  static initializeIntegrations(): void {
    console.log('🚀 Initialiserar integrationer...');
    
    // Logga konfigurationsstatus
    IntegrationManager.logConfigurationStatus();
    
    // Verifiera att kritiska integrationer fungerar
    this.verifyIntegrations();
  }

  // Verifiera att integrationer fungerar
  private static async verifyIntegrations(): Promise<void> {
    const status = this.getIntegrationsStatus();
    
    // Testa varje integration
    for (const integration of status) {
      if (integration.configured) {
        try {
          await this.testIntegration(integration.name);
          console.log(`✅ ${integration.name}: Test lyckades`);
        } catch (error) {
          console.error(`❌ ${integration.name}: Test misslyckades`, error);
        }
      }
    }
  }

  // Testa en specifik integration
  private static async testIntegration(integrationName: string): Promise<void> {
    switch (integrationName) {
      case 'Skatteverket API':
        // Test med ett dummy personnummer
        try {
          await SkatteverketService.fetchHeirs('19801015-1234');
        } catch (error) {
          throw new Error('Skatteverket API test failed');
        }
        break;

      case 'BankID':
        // Test BankID-anslutning (bara kontrollera att certifikat finns)
        if (!INTEGRATION_CONFIG.bankid.credentials.certificatePath) {
          throw new Error('BankID certificate path not configured');
        }
        break;

      case 'Open Banking/PSD2':
        // Test PSD2-konfiguration
        const banks = OpenBankingService.getSupportedBanks();
        if (banks.length === 0) {
          throw new Error('No supported banks configured');
        }
        break;

      case 'E-post & SMS':
        // Test meddelandekonfiguration
        if (!INTEGRATION_CONFIG.notifications.email.credentials.apiKey) {
          throw new Error('Email API key not configured');
        }
        break;

      default:
        console.warn(`Unknown integration test: ${integrationName}`);
    }
  }

  // Växla mellan test och production för alla integrationer
  static switchEnvironment(environment: 'test' | 'production'): void {
    Object.keys(INTEGRATION_CONFIG).forEach(key => {
      const config = INTEGRATION_CONFIG[key as keyof typeof INTEGRATION_CONFIG];
      config.environment = environment;
    });
    
    console.log(`🔄 Switched all integrations to ${environment} environment`);
    this.initializeIntegrations();
  }

  // Aktivera/inaktivera specifik integration
  static toggleIntegration(integration: keyof typeof INTEGRATION_CONFIG, enabled: boolean): void {
    INTEGRATION_CONFIG[integration].enabled = enabled;
    console.log(`🔄 ${integration} integration ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Hämta detaljerad rapport om alla integrationer
  static generateIntegrationReport(): string {
    const status = this.getIntegrationsStatus();
    const validation = IntegrationManager.validateAllConfigurations();
    
    let report = '📊 INTEGRATION REPORT\n';
    report += '='.repeat(50) + '\n\n';
    
    status.forEach(integration => {
      const statusIcon = integration.status === 'ready' ? '✅' : '⚠️';
      report += `${statusIcon} ${integration.name}\n`;
      report += `   Status: ${integration.status.toUpperCase()}\n`;
      report += `   Environment: ${integration.environment}\n`;
      report += `   Message: ${integration.message}\n\n`;
    });
    
    if (validation.warnings.length > 0) {
      report += '⚠️ WARNINGS:\n';
      validation.warnings.forEach(warning => {
        report += `   • ${warning}\n`;
      });
      report += '\n';
    }
    
    report += '📝 NEXT STEPS:\n';
    report += '   1. Update credentials in src/config/integrationSettings.ts\n';
    report += '   2. Set enabled: true for each integration\n';
    report += '   3. Test in staging environment\n';
    report += '   4. Deploy to production\n\n';
    
    return report;
  }
}

// Exportera för global användning
export default IntegrationService;