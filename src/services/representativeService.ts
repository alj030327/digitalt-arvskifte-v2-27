// Interface for representatives with power of attorney
export interface RepresentativeAccess {
  personalNumber: string;
  name: string;
  deceasedPersonalNumbers: string[]; // Can represent multiple estates
  grantedAt: Date;
  accessLevel: 'full' | 'limited';
  permissions: {
    viewAssets: boolean;
    viewBeneficiaries: boolean;
    modifyDistribution: boolean;
    submitTobanks: boolean;
  };
}

// Service to handle representative access and authentication
export class RepresentativeService {
  
  /**
   * Check if a person has active power of attorney for a deceased person
   */
  static hasActivePowerOfAttorney(
    representativePersonalNumber: string, 
    deceasedPersonalNumber: string
  ): boolean {
    const key = `powerOfAttorneys_${deceasedPersonalNumber.replace('-', '')}`;
    const powerOfAttorneys = JSON.parse(localStorage.getItem(key) || '[]');
    
    return powerOfAttorneys.some((poa: any) => 
      poa.representativePersonalNumber === representativePersonalNumber &&
      poa.approvals.every((approval: any) => approval.approved)
    );
  }

  /**
   * Get all estates a representative has access to
   */
  static getRepresentativeAccesses(representativePersonalNumber: string): RepresentativeAccess[] {
    const accesses: RepresentativeAccess[] = [];
    
    // Check all possible power of attorney records in localStorage
    // In production, this would be a database query
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('powerOfAttorneys_')) {
        const deceasedPersonalNumber = key.replace('powerOfAttorneys_', '');
        const powerOfAttorneys = JSON.parse(localStorage.getItem(key) || '[]');
        
        const activePOA = powerOfAttorneys.find((poa: any) =>
          poa.representativePersonalNumber === representativePersonalNumber &&
          poa.approvals.every((approval: any) => approval.approved)
        );
        
        if (activePOA) {
          accesses.push({
            personalNumber: representativePersonalNumber,
            name: activePOA.representativeName,
            deceasedPersonalNumbers: [deceasedPersonalNumber],
            grantedAt: new Date(activePOA.grantedAt),
            accessLevel: 'full', // Default to full access
            permissions: {
              viewAssets: true,
              viewBeneficiaries: true,
              modifyDistribution: true,
              submitTobanks: true
            }
          });
        }
      }
    }
    
    return accesses;
  }

  /**
   * Authenticate representative and return their access
   */
  static async authenticateRepresentative(personalNumber: string): Promise<RepresentativeAccess[]> {
    // This would typically involve BankID authentication
    // For now, we'll simulate it
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.getRepresentativeAccesses(personalNumber);
  }

  /**
   * Get full estate information for a representative
   */
  static getEstateInformation(deceasedPersonalNumber: string, representativePersonalNumber: string) {
    // Verify access first
    if (!this.hasActivePowerOfAttorney(representativePersonalNumber, deceasedPersonalNumber)) {
      throw new Error('Ingen behörighet att komma åt denna information');
    }

    // Return mock estate data - in production this would come from various services
    return {
      deceasedPersonalNumber,
      assets: [
        {
          id: '1',
          bank: 'Swedbank',
          accountType: 'Sparkonto',
          accountNumber: '1234-567890',
          amount: 150000,
          currency: 'SEK'
        },
        {
          id: '2', 
          bank: 'Handelsbanken',
          accountType: 'Investeringskonto',
          accountNumber: '9876-543210',
          amount: 275000,
          currency: 'SEK'
        }
      ],
      beneficiaries: [], // Would be populated from actual data
      testament: null,
      powerOfAttorneys: JSON.parse(
        localStorage.getItem(`powerOfAttorneys_${deceasedPersonalNumber.replace('-', '')}`) || '[]'
      )
    };
  }
}

export default RepresentativeService;