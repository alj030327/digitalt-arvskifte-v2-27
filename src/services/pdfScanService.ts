// PDF scanning service for estate documents

export interface ScannedHeirData {
  personalNumber: string;
  name: string;
  relationship?: string;
  inheritanceShare?: number;
  address?: string;
}

export interface ScannedDocumentData {
  documentType: 'bouppteckning' | 'testament' | 'unknown';
  deceasedPersonalNumber?: string;
  deceasedName?: string;
  heirs: ScannedHeirData[];
  totalAssetValue?: number;
  scanConfidence: number; // 0-1 score
  rawText: string;
}

export class PDFScanService {
  /**
   * Scan PDF file and extract heir information
   */
  static async scanPDF(file: File): Promise<ScannedDocumentData> {
    try {
      console.log('Starting PDF scan for:', file.name);
      
      // Convert file to text using browser-compatible method
      const text = await this.extractTextFromPDF(file);
      
      // Analyze the extracted text
      const scanResult = this.analyzeExtractedText(text);
      
      console.log('PDF scan completed:', scanResult);
      return scanResult;
    } catch (error) {
      console.error('PDF scanning failed:', error);
      return {
        documentType: 'unknown',
        heirs: [],
        scanConfidence: 0,
        rawText: ''
      };
    }
  }

  /**
   * Extract text from PDF file using browser-compatible method
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    // For now, return a mock extraction since full PDF parsing requires heavy libraries
    // In production, you'd use a library like pdf.js or send to a backend service
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
    
    // Mock extracted text for demonstration
    return `
BOUPPTECKNING
Avliden: Anna Andersson
Personnummer: 195601012345

DÖDSBODELÄGARE:
1. Lars Andersson, 198503154567, Son, 50%
   Adress: Storgatan 12, 123 45 Stockholm
   
2. Maria Johansson, 198705238901, Dotter, 50%
   Adress: Lillgatan 34, 543 21 Göteborg

TILLGÅNGAR:
Banktillgångar: 850 000 kr
Fastighet: 2 100 000 kr
Totalt: 2 950 000 kr

Dokumentet upprättat: ${new Date().toLocaleDateString('sv-SE')}
`;
  }

  /**
   * Analyze extracted text to identify heirs and document type
   */
  private static analyzeExtractedText(text: string): ScannedDocumentData {
    const result: ScannedDocumentData = {
      documentType: 'unknown',
      heirs: [],
      scanConfidence: 0,
      rawText: text
    };

    // Detect document type
    if (text.toLowerCase().includes('bouppteckning')) {
      result.documentType = 'bouppteckning';
    } else if (text.toLowerCase().includes('testamente')) {
      result.documentType = 'testament';
    }

    // Extract deceased person's information
    const deceasedMatch = text.match(/avliden:?\s*([^\n]+)/i);
    if (deceasedMatch) {
      result.deceasedName = deceasedMatch[1].trim();
    }

    // Extract deceased person's personal number
    const deceasedPnMatch = text.match(/personnummer:?\s*(\d{6,8}[-\s]?\d{4})/i);
    if (deceasedPnMatch) {
      result.deceasedPersonalNumber = deceasedPnMatch[1].replace(/\s/g, '');
    }

    // Extract heirs information using various patterns
    result.heirs = this.extractHeirs(text);

    // Extract total asset value
    const assetMatch = text.match(/totalt:?\s*(\d+(?:\s?\d{3})*)\s*kr/i);
    if (assetMatch) {
      result.totalAssetValue = parseInt(assetMatch[1].replace(/\s/g, ''));
    }

    // Calculate confidence score
    result.scanConfidence = this.calculateConfidence(result);

    return result;
  }

  /**
   * Extract heir information from text
   */
  private static extractHeirs(text: string): ScannedHeirData[] {
    const heirs: ScannedHeirData[] = [];
    
    // Pattern for heir entries: Name, PersonalNumber, Relationship, Percentage
    const heirPatterns = [
      // Pattern: "1. Lars Andersson, 198503154567, Son, 50%"
      /(\d+\.\s*)?([A-ZÅÄÖ][a-zåäö]+\s+[A-ZÅÄÖ][a-zåäö]+),?\s*(\d{6,8}[-\s]?\d{4}),?\s*([^,\n]+?)(?:,?\s*(\d+)%)?/gi,
      
      // Pattern: "Lars Andersson 198503154567 Son 50%"
      /([A-ZÅÄÖ][a-zåäö]+\s+[A-ZÅÄÖ][a-zåäö]+)\s+(\d{6,8}[-\s]?\d{4})\s+([^,\n]+?)\s+(\d+)%/gi
    ];

    for (const pattern of heirPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[2] || match[1];
        const personalNumber = (match[3] || match[2]).replace(/\s/g, '');
        const relationship = match[4] || match[3];
        const shareMatch = match[5] || match[4];
        const inheritanceShare = shareMatch ? parseInt(shareMatch) : undefined;

        // Validate personal number format
        if (this.isValidPersonalNumber(personalNumber) && name) {
          heirs.push({
            personalNumber,
            name: name.trim(),
            relationship: relationship?.trim(),
            inheritanceShare
          });
        }
      }
    }

    // Remove duplicates based on personal number
    const uniqueHeirs = heirs.filter((heir, index, self) => 
      index === self.findIndex(h => h.personalNumber === heir.personalNumber)
    );

    return uniqueHeirs;
  }

  /**
   * Validate Swedish personal number format
   */
  private static isValidPersonalNumber(pn: string): boolean {
    const cleaned = pn.replace(/[-\s]/g, '');
    return /^\d{10}$/.test(cleaned) || /^\d{12}$/.test(cleaned);
  }

  /**
   * Calculate confidence score for the scan result
   */
  private static calculateConfidence(result: ScannedDocumentData): number {
    let score = 0;
    
    // Document type identified
    if (result.documentType !== 'unknown') score += 0.2;
    
    // Deceased person identified
    if (result.deceasedPersonalNumber) score += 0.2;
    if (result.deceasedName) score += 0.1;
    
    // Heirs found
    if (result.heirs.length > 0) score += 0.3;
    
    // Each heir with complete information
    result.heirs.forEach(heir => {
      if (heir.personalNumber && heir.name) score += 0.1;
      if (heir.relationship) score += 0.05;
      if (heir.inheritanceShare) score += 0.05;
    });
    
    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Format personal number consistently
   */
  static formatPersonalNumber(pn: string): string {
    const cleaned = pn.replace(/[-\s]/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 8)}-${cleaned.slice(8)}`;
    } else if (cleaned.length === 12) {
      return `${cleaned.slice(0, 8)}-${cleaned.slice(8)}`;
    }
    return pn;
  }

  /**
   * Get document type in Swedish
   */
  static getDocumentTypeLabel(type: string): string {
    switch (type) {
      case 'bouppteckning':
        return 'Bouppteckning';
      case 'testament':
        return 'Testamente';
      default:
        return 'Okänt dokument';
    }
  }
}