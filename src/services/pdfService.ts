import jsPDF from 'jspdf';

export interface PDFExportOptions {
  includeSummary: boolean;
  includeAssets: boolean;
  includeBeneficiaries: boolean;
  includeTestament: boolean;
  format: 'detailed' | 'summary';
}

export class PDFService {
  /**
   * Generate actual PDF from inheritance distribution data
   * Uses jsPDF for client-side PDF generation
   */
  static async generateDistributionPDF(data: {
    personalNumber: string;
    assets: any[];
    beneficiaries: any[];
    testament?: any;
    totalAmount: number;
    physicalAssets?: any[];
    assetAllocations?: any[];
  }, options: PDFExportOptions = {
    includeSummary: true,
    includeAssets: true,
    includeBeneficiaries: true,
    includeTestament: true,
    format: 'detailed'
  }): Promise<Blob | null> {
    
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set Swedish fonts (fallback to standard fonts if not available)
      doc.setFont('helvetica');
      
      let yPosition = 20;
      const lineHeight = 8;
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ARVSSKIFTE - FÖRDELNING', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Date and time
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Datum: ${new Date().toLocaleDateString('sv-SE')}`, 20, yPosition);
      doc.text(`Genererat: ${new Date().toLocaleTimeString('sv-SE')}`, pageWidth - 70, yPosition);
      yPosition += 15;
      
      // Deceased person section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AVLIDEN PERSON', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Personnummer: ${data.personalNumber}`, 20, yPosition);
      yPosition += 15;
      
      // Assets section
      if (options.includeAssets && data.assets.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TILLGÅNGAR', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        data.assets.forEach((asset, index) => {
          // Check if we need a new page
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(`${index + 1}. ${asset.bank} - ${asset.accountType}`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Kontonummer: ${asset.accountNumber}`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Belopp: ${asset.amount.toLocaleString('sv-SE')} SEK`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Typ: ${asset.assetType}`, 20, yPosition);
          yPosition += lineHeight;
          
          if (asset.toRemain) {
            doc.text(`   Kvar: ${asset.amountToRemain || asset.amount} SEK`, 20, yPosition);
            yPosition += lineHeight;
            doc.text(`   Anledning: ${asset.reasonToRemain || 'Ej specificerad'}`, 20, yPosition);
            yPosition += lineHeight;
          }
          yPosition += 5;
        });
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Totalt värde: ${data.totalAmount.toLocaleString('sv-SE')} SEK`, 20, yPosition);
        yPosition += 15;
      }
      
      // Testament section
      if (options.includeTestament && data.testament) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TESTAMENTE', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fil: ${data.testament.filename}`, 20, yPosition);
        yPosition += lineHeight;
        doc.text(`Uppladdad: ${data.testament.uploadDate}`, 20, yPosition);
        yPosition += lineHeight;
        doc.text(`Status: ${data.testament.verified ? 'Verifierat' : 'Ej verifierat'}`, 20, yPosition);
        yPosition += 15;
      }
      
      // Beneficiaries section
      if (options.includeBeneficiaries && data.beneficiaries.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('FÖRDELNING', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        data.beneficiaries.forEach((beneficiary, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          const amount = (beneficiary.percentage / 100) * data.totalAmount;
          doc.text(`${index + 1}. ${beneficiary.name}`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Personnummer: ${beneficiary.personalNumber}`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Relation: ${beneficiary.relationship}`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Andel: ${beneficiary.percentage}%`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Belopp: ${amount.toLocaleString('sv-SE')} SEK`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Kontonummer: ${beneficiary.accountNumber}`, 20, yPosition);
          yPosition += 10;
        });
      }

      // Specific asset allocations section
      if (data.assetAllocations && data.assetAllocations.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SPECIFIKA TILLGÅNGSTILLDELNINGAR', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        data.assetAllocations.forEach((allocation: any, index: number) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          const asset = data.assets.find((a: any) => a.id === allocation.assetId);
          if (asset) {
            doc.text(`${index + 1}. ${asset.bank} - ${asset.accountType}`, 20, yPosition);
            yPosition += lineHeight;
            doc.text(`   Kontonummer: ${asset.accountNumber}`, 20, yPosition);
            yPosition += lineHeight;
            doc.text(`   Belopp: ${asset.amount.toLocaleString('sv-SE')} SEK`, 20, yPosition);
            yPosition += lineHeight;
            doc.text(`   Tilldelad till: ${allocation.beneficiaryName}`, 20, yPosition);
            yPosition += 10;
          }
        });
      }

      // Physical assets section
      if (data.physicalAssets && data.physicalAssets.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('FYSISKA TILLGÅNGAR', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        data.physicalAssets.forEach((asset: any, index: number) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(`${index + 1}. ${asset.name}`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Kategori: ${asset.category}`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Uppskattat värde: ${asset.estimatedValue?.toLocaleString('sv-SE') || 'Ej angivet'} SEK`, 20, yPosition);
          yPosition += lineHeight;
          doc.text(`   Fördelningsmetod: ${PDFService.getDistributionLabel(asset.distributionMethod)}`, 20, yPosition);
          yPosition += lineHeight;
          if (asset.assignedTo) {
            doc.text(`   Tilldelad till: ${asset.assignedTo}`, 20, yPosition);
            yPosition += lineHeight;
          }
          if (asset.description) {
            const descLines = doc.splitTextToSize(`   Beskrivning: ${asset.description}`, pageWidth - 40);
            doc.text(descLines, 20, yPosition);
            yPosition += descLines.length * lineHeight;
          }
          yPosition += 5;
        });
        
        const totalPhysicalValue = data.physicalAssets.reduce((sum: number, asset: any) => 
          sum + (asset.estimatedValue || 0), 0);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Totalt uppskattat värde fysiska tillgångar: ${totalPhysicalValue.toLocaleString('sv-SE')} SEK`, 20, yPosition);
        yPosition += 15;
      }
      
      // Legal information
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('JURIDISK INFORMATION', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const legalText = `Detta dokument utgör en sammanfattning av den föreslagna fördelningen av dödsboet. Fördelningen baseras på ${data.testament ? 'testamentets bestämmelser' : 'lagstadgad arvordning'}. Alla arvingar har signerat digitalt med BankID och godkänt fördelningen.`;
      
      const splitText = doc.splitTextToSize(legalText, pageWidth - 40);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 5 + 10;
      
      doc.text('Dokumentet genererat av Digital Arvsskifte System', 20, yPosition);
      yPosition += lineHeight;
      doc.text(`Tid: ${new Date().toISOString()}`, 20, yPosition);
      
      // Convert to blob
      const pdfBlob = doc.output('blob');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return pdfBlob;
    } catch (error) {
      console.error('PDF generation failed:', error);
      return null;
    }
  }

  /**
   * Generate PDF content structure
   */
  private static generatePDFContent(data: any, options: PDFExportOptions): string {
    let content = `
ARVSSKIFTE - FÖRDELNING
=======================

Datum: ${new Date().toLocaleDateString('sv-SE')}
Dokument genererat: ${new Date().toLocaleTimeString('sv-SE')}

AVLIDEN PERSON
--------------
Personnummer: ${data.personalNumber}

`;

    if (options.includeAssets && data.assets.length > 0) {
      content += `
TILLGÅNGAR
----------
`;
      data.assets.forEach((asset: any, index: number) => {
        content += `
${index + 1}. ${asset.bank} - ${asset.accountType}
   Kontonummer: ${asset.accountNumber}
   Belopp: ${asset.amount.toLocaleString('sv-SE')} SEK
   Typ: ${asset.assetType}
`;
        if (asset.toRemain) {
          content += `   Kvar: ${asset.amountToRemain || asset.amount} SEK
   Anledning: ${asset.reasonToRemain || 'Ej specificerad'}
`;
        }
      });
      
      content += `
Totalt värde: ${data.totalAmount.toLocaleString('sv-SE')} SEK
`;
    }

    if (options.includeTestament && data.testament) {
      content += `
TESTAMENTE
----------
Fil: ${data.testament.filename}
Uppladdad: ${data.testament.uploadDate}
Status: ${data.testament.verified ? 'Verifierat' : 'Ej verifierat'}
`;
    }

    if (options.includeBeneficiaries && data.beneficiaries.length > 0) {
      content += `
FÖRDELNING
----------
`;
      data.beneficiaries.forEach((beneficiary: any, index: number) => {
        const amount = (beneficiary.percentage / 100) * data.totalAmount;
        content += `
${index + 1}. ${beneficiary.name}
   Personnummer: ${beneficiary.personalNumber}
   Relation: ${beneficiary.relationship}
   Andel: ${beneficiary.percentage}%
   Belopp: ${amount.toLocaleString('sv-SE')} SEK
   Kontonummer: ${beneficiary.accountNumber}
`;
      });
    }

    content += `

JURIDISK INFORMATION
-------------------
Detta dokument utgör en sammanfattning av den föreslagna fördelningen
av dödsboet. Fördelningen baseras på ${data.testament ? 'testamentets bestämmelser' : 'lagstadgad arvordning'}.

Alla arvingar har signerat digitalt med BankID och godkänt fördelningen.

Dokumentet genererat av Digital Arvsskifte System
Tid: ${new Date().toISOString()}
`;

    return content;
  }

  /**
   * Download PDF file
   */
  static downloadPDF(blob: Blob, filename: string = 'arvsskifte-fordelning.pdf'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Get distribution label for physical assets
   */
  static getDistributionLabel(method: string): string {
    switch (method) {
      case 'sell':
        return 'Sälj och fördela';
      case 'divide':
        return 'Dela mellan arvingar';
      case 'assign':
        return 'Tilldela specifik arvinge';
      default:
        return method || 'Ej specificerat';
    }
  }

  /**
   * Get PDF filename based on data
   */
  static generateFilename(personalNumber: string, date: Date = new Date()): string {
    const dateStr = date.toISOString().split('T')[0];
    const cleanPersonalNumber = personalNumber.replace(/[-\s]/g, '');
    return `arvsskifte-${cleanPersonalNumber}-${dateStr}.pdf`;
  }
}