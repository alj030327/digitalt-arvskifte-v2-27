import { integrationConfig, isIntegrationReady } from '../config/integrations';

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
    // Check if integration is properly configured
    if (!isIntegrationReady.skatteverket()) {
      console.warn('Skatteverket integration not configured, using mock data');
      return this.getMockHeirData(deceasedPersonalNumber);
    }

    try {
      // TODO: Implement actual API call to Skatteverket
      // This would typically be done through a backend service/edge function
      // because API keys and certificates should not be exposed in frontend
      
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
    // This is where you would implement the actual API call
    // Example structure:
    /*
    const response = await fetch(`${integrationConfig.skatteverket.apiBaseUrl}/heirs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integrationConfig.skatteverket.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ personalNumber }),
    });
    
    const data = await response.json();
    return data;
    */

    // For now, return mock data
    return this.getMockHeirData(personalNumber);
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
      
      // Generate realistic personal number (19XX or 20XX)
      const birthYear = Math.floor(Math.random() * 70) + 1950;
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const lastFour = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const heirPersonalNumber = `${birthYear}${birthMonth}${birthDay}${lastFour}`;
      
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