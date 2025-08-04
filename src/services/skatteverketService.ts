import { IntegrationManager, SKATTEVERKET_CONFIG } from '@/config/integrationSettings';
import { isDemoMode, demoConfig, demoLogger } from '@/config/demoConfig';

export interface SkatteverketHeirData {
  personalNumber: string;
  name: string;
  relationship: string;
  inheritanceShare: number;
  address?: string;
  phoneNumber?: string;
  email?: string;
}

export interface SkatteverketResponse {
  status: 'success' | 'error';
  data?: {
    deceasedPersonalNumber: string;
    deceasedName: string;
    dateOfDeath: string;
    heirs: SkatteverketHeirData[];
  };
  error?: string;
  timestamp: string;
}

export class SkatteverketService {
  /**
   * Fetch heir information from Skatteverket API
   * This is a placeholder that simulates the API call
   * Real implementation would require backend integration
   */
  static async fetchHeirs(deceasedPersonalNumber: string): Promise<SkatteverketResponse> {
    // Demo mode - return mock heirs for any personal number
    if (isDemoMode()) {
      demoLogger.info('Skatteverket fetch heirs (demo mode)', { personalNumber: deceasedPersonalNumber });
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      
      // Accept any personal number in demo mode and return mock data
      return {
        status: 'success',
        data: {
          deceasedPersonalNumber,
          deceasedName: 'Demo Avliden',
          dateOfDeath: '2023-12-15',
          heirs: demoConfig.mockHeirs.map(heir => ({
            personalNumber: heir.personalNumber,
            name: heir.name,
            relationship: heir.relationship,
            inheritanceShare: heir.inheritancePercentage / 100,
            address: 'Testgatan 123, 11111 Stockholm',
            phoneNumber: heir.phone,
            email: heir.email
          }))
        },
        timestamp: new Date().toISOString()
      };
    }

    // Check if integration is properly configured
    if (!IntegrationManager.isConfigured('skatteverket')) {
      console.log('🏦 Skatteverket API not configured - using realistic mock data');
      return this.getMockHeirData(deceasedPersonalNumber);
    }

    try {
      console.log('🏦 Using real Skatteverket API');
      const response = await this.callSkatteverketAPI(deceasedPersonalNumber);
      return response;
    } catch (error) {
      console.error('Error fetching heirs from Skatteverket:', error);
      return {
        status: 'error',
        error: 'Failed to fetch heir information from Skatteverket',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Placeholder for actual API call
   * In production, this should be implemented as a secure backend endpoint
   */
  private static async callSkatteverketAPI(personalNumber: string): Promise<SkatteverketResponse> {
    const config = SKATTEVERKET_CONFIG;
    const baseUrl = IntegrationManager.getBaseUrl('skatteverket');
    
    try {
      const response = await fetch(`${baseUrl}${config.endpoints.heirLookup}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.credentials.apiKey}`,
          'X-Certificate-Path': config.credentials.certificatePath,
        },
        body: JSON.stringify({
          deceasedPersonalNumber: personalNumber,
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        status: 'success',
        data: {
          deceasedPersonalNumber: personalNumber,
          deceasedName: data.deceasedName || '',
          dateOfDeath: data.dateOfDeath || '',
          heirs: data.heirs || [],
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Skatteverket API Error:', error);
      return {
        status: 'error',
        error: 'Kunde inte hämta arvsinformation från Skatteverket',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate randomized mock heir data for testing purposes
   */
  private static async getMockHeirData(personalNumber: string): Promise<SkatteverketResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Randomized data arrays
    const firstNames = ['Anna', 'Erik', 'Maria', 'Johan', 'Karin', 'Lars', 'Birgitta', 'Per', 'Margareta', 'Nils'];
    const lastNames = ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson'];
    const streets = ['Storgatan', 'Kungsgatan', 'Drottninggatan', 'Vasagatan', 'Götgatan', 'Sveavägen', 'Hornsgatan', 'Folkungagatan'];
    const cities = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg'];
    const relationships = ['Son', 'Dotter', 'Make/Maka', 'Fader', 'Moder', 'Bror', 'Syster', 'Sonsons son', 'Dotters dotter'];
    
    // Generate random deceased name
    const deceasedFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const deceasedLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Generate random number of heirs (1-4)
    const numHeirs = Math.floor(Math.random() * 4) + 1;
    const heirs: SkatteverketHeirData[] = [];
    
    // Generate random inheritance shares that sum to 1.0
    const shares: number[] = [];
    for (let i = 0; i < numHeirs - 1; i++) {
      shares.push(Math.random());
    }
    shares.sort((a, b) => a - b);
    
    const inheritanceShares: number[] = [];
    for (let i = 0; i < numHeirs; i++) {
      if (i === 0) {
        inheritanceShares.push(shares[0]);
      } else if (i === numHeirs - 1) {
        inheritanceShares.push(1 - shares[i - 1]);
      } else {
        inheritanceShares.push(shares[i] - shares[i - 1]);
      }
    }
    
    // Generate heirs
    for (let i = 0; i < numHeirs; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = Math.random() > 0.7 ? deceasedLastName : lastNames[Math.floor(Math.random() * lastNames.length)];
      const street = streets[Math.floor(Math.random() * streets.length)];
      const streetNumber = Math.floor(Math.random() * 200) + 1;
      const postalCode = Math.floor(Math.random() * 90000) + 10000;
      const city = cities[Math.floor(Math.random() * cities.length)];
      const relationship = relationships[Math.floor(Math.random() * relationships.length)];
      
      // Generate BankID test-compatible personal numbers (ending with 0111)
      const birthYear = Math.floor(Math.random() * 70) + 1950;
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      // Always end with 0111 for BankID test environment compatibility
      const heirPersonalNumber = `${birthYear}${birthMonth}${birthDay}0111`;
      
      heirs.push({
        personalNumber: heirPersonalNumber,
        name: `${firstName} ${lastName}`,
        relationship,
        inheritanceShare: Math.round(inheritanceShares[i] * 1000) / 1000, // Round to 3 decimals
        address: `${street} ${streetNumber}, ${postalCode} ${city}`,
        phoneNumber: `+4670${Math.floor(Math.random() * 10000000)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
      });
    }

    // Random death date within last 2 years
    const deathDate = new Date();
    deathDate.setDate(deathDate.getDate() - Math.floor(Math.random() * 730));

    return {
      status: 'success',
      data: {
        deceasedPersonalNumber: personalNumber,
        deceasedName: `${deceasedFirstName} ${deceasedLastName}`,
        dateOfDeath: deathDate.toISOString().split('T')[0],
        heirs
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate Swedish personal number format
   */
  static validatePersonalNumber(personalNumber: string): boolean {
    // Remove any spaces or dashes
    const cleaned = personalNumber.replace(/[\s-]/g, '');
    
    // Check if it's 10 or 12 digits
    if (!/^\d{10}$|^\d{12}$/.test(cleaned)) {
      return false;
    }

    // TODO: Implement proper Luhn algorithm validation
    // This is a simplified validation
    return true;
  }
}