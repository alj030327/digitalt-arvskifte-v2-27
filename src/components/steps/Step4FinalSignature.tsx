import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, FileText, Download, Users, Building2, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EstateOwner } from "./Step1EstateOwners";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  bank: string;
  accountType: string;
  assetType: string;
  accountNumber: string;
  amount: number;
  toRemain?: boolean;
  reasonToRemain?: string;
}

interface PhysicalAsset {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  category: string;
}

interface Beneficiary {
  id: string;
  name: string;
  personalNumber: string;
  relationship: string;
  percentage: number;
  accountNumber: string;
}

interface Step4Props {
  deceasedFirstName: string;
  deceasedLastName: string;
  deceasedPersonalNumber: string;
  estateOwners: EstateOwner[];
  assets: Asset[];
  physicalAssets: PhysicalAsset[];
  beneficiaries: Beneficiary[];
  onBack: () => void;
  onComplete: () => void;
  t: (key: string) => string;
}

export const Step4FinalSignature = ({ 
  deceasedFirstName,
  deceasedLastName,
  deceasedPersonalNumber,
  estateOwners, 
  assets, 
  physicalAssets,
  beneficiaries,
  onBack,
  onComplete,
  t 
}: Step4Props) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const totalFinancialAssets = assets
    .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
    .reduce((sum, a) => sum + (a.toRemain ? 0 : a.amount), 0);
    
  const totalPhysicalAssets = physicalAssets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const totalNetAssets = totalFinancialAssets + totalPhysicalAssets;

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Here you would generate the PDF with all the information
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "PDF genererad",
        description: "Arvsskiftet har genererats som PDF och kan nu skrivas ut för signering.",
      });
      
      // Create comprehensive PDF content
      let pdfContent = `ARVSSKIFTE\n`;
      pdfContent += `==========\n\n`;
      pdfContent += `Avliden: ${deceasedFirstName} ${deceasedLastName} (${deceasedPersonalNumber})\n\n`;
      
      pdfContent += `DÖDSBODELÄGARE:\n`;
      pdfContent += `---------------\n`;
      estateOwners.forEach(owner => {
        pdfContent += `${owner.firstName} ${owner.lastName}\n`;
        pdfContent += `Personnummer: ${owner.personalNumber}\n`;
        pdfContent += `Relation: ${owner.relationshipToDeceased}\n`;
        if (owner.address) pdfContent += `Adress: ${owner.address}\n`;
        if (owner.phone) pdfContent += `Telefon: ${owner.phone}\n`;
        if (owner.email) pdfContent += `E-post: ${owner.email}\n`;
        pdfContent += `\n`;
      });
      
      pdfContent += `FINANSIELLA TILLGÅNGAR:\n`;
      pdfContent += `------------------------\n`;
      assets.forEach(asset => {
        if (!asset.toRemain && !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(asset.assetType)) {
          pdfContent += `${asset.bank} - ${asset.accountType}\n`;
          pdfContent += `Konto: ${asset.accountNumber}\n`;
          pdfContent += `Typ: ${asset.assetType}\n`;
          pdfContent += `Belopp: ${asset.amount.toLocaleString('sv-SE')} SEK\n\n`;
        }
      });
      
      if (physicalAssets.length > 0) {
        pdfContent += `FYSISKA TILLGÅNGAR:\n`;
        pdfContent += `-------------------\n`;
        physicalAssets.forEach(asset => {
          pdfContent += `${asset.name} (${asset.category})\n`;
          if (asset.description) pdfContent += `Beskrivning: ${asset.description}\n`;
          pdfContent += `Värde: ${asset.estimatedValue.toLocaleString('sv-SE')} SEK\n\n`;
        });
      }
      
      pdfContent += `ARVINGAR:\n`;
      pdfContent += `---------\n`;
      beneficiaries.forEach(beneficiary => {
        pdfContent += `${beneficiary.name} (${beneficiary.personalNumber})\n`;
        pdfContent += `Relation: ${beneficiary.relationship}\n`;
        pdfContent += `Andel: ${beneficiary.percentage}%\n`;
        pdfContent += `Belopp: ${((beneficiary.percentage / 100) * totalNetAssets).toLocaleString('sv-SE')} SEK\n`;
        pdfContent += `Konto: ${beneficiary.accountNumber}\n\n`;
      });
      
      pdfContent += `SAMMANFATTNING:\n`;
      pdfContent += `---------------\n`;
      pdfContent += `Totala nettotillgångar: ${totalNetAssets.toLocaleString('sv-SE')} SEK\n\n`;
      
      pdfContent += `SIGNATURER:\n`;
      pdfContent += `-----------\n`;
      estateOwners.forEach(owner => {
        pdfContent += `${owner.firstName} ${owner.lastName}\n`;
        pdfContent += `Personnummer: ${owner.personalNumber}\n`;
        pdfContent += `Signatur: ________________________  Datum: ____________\n\n\n`;
      });
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arvsskifte-${deceasedPersonalNumber.replace('-', '')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte generera PDF. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <PenTool className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Arvsskifte - Sammanfattning och signering</CardTitle>
          <CardDescription>
            Granska sammanfattningen och generera dokument för fysisk signering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sammanfattning</h3>
            
            {/* Deceased Person Information */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Den avlidne</h4>
              <p><strong>Namn:</strong> {deceasedFirstName} {deceasedLastName}</p>
              <p><strong>Personnummer:</strong> {deceasedPersonalNumber}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {estateOwners.length}
                </div>
                <div className="text-sm text-muted-foreground">Dödsbodelägare</div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {beneficiaries.length}
                </div>
                <div className="text-sm text-muted-foreground">Arvingar</div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {totalNetAssets.toLocaleString('sv-SE')} SEK
                </div>
                <div className="text-sm text-muted-foreground">Totala nettotillgångar</div>
              </div>
            </div>
          </div>

          {/* Estate Owners Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Dödsbodelägare
            </h3>
            <div className="space-y-3">
              {estateOwners.map((owner) => (
                <div key={owner.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{owner.firstName} {owner.lastName}</span>
                        <Badge variant="secondary">{owner.relationshipToDeceased}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Personnummer: {owner.personalNumber}
                      </p>
                      {owner.address && (
                        <p className="text-sm text-muted-foreground">
                          Adress: {owner.address}
                        </p>
                      )}
                      {owner.phone && (
                        <p className="text-sm text-muted-foreground">
                          Telefon: {owner.phone}
                        </p>
                      )}
                      {owner.email && (
                        <p className="text-sm text-muted-foreground">
                          E-post: {owner.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assets Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Tillgångar
            </h3>
            
            {assets.filter(a => !a.toRemain && !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType)).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Finansiella tillgångar</h4>
                {assets
                  .filter(a => !a.toRemain && !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
                  .map((asset) => (
                    <div key={asset.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{asset.bank} - {asset.accountType}</span>
                          <p className="text-sm text-muted-foreground">
                            {asset.accountNumber} • {asset.assetType}
                          </p>
                        </div>
                        <span className="font-semibold text-primary">
                          {asset.amount.toLocaleString('sv-SE')} SEK
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {physicalAssets.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Fysiska tillgångar
                </h4>
                {physicalAssets.map((asset) => (
                  <div key={asset.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{asset.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {asset.category}
                          {asset.description && ` • ${asset.description}`}
                        </p>
                      </div>
                      <span className="font-semibold text-primary">
                        {asset.estimatedValue.toLocaleString('sv-SE')} SEK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Beneficiaries Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Arvingar och fördelning</h3>
            <div className="space-y-3">
              {beneficiaries.map((beneficiary) => (
                <div key={beneficiary.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{beneficiary.name}</span>
                        <Badge variant="secondary">{beneficiary.relationship}</Badge>
                        <Badge variant="outline">{beneficiary.percentage}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Personnummer: {beneficiary.personalNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bankkonto: {beneficiary.accountNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {((beneficiary.percentage / 100) * totalNetAssets).toLocaleString('sv-SE')} SEK
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Signaturer</h3>
            
            <Alert>
              <PenTool className="h-4 w-4" />
              <AlertDescription>
                Detta dokument innehåller signeringsrutor för alla dödsbodelägare. Skriv ut PDF:en och låt alla parter signera fysiskt.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              {estateOwners.map((owner) => (
                <div key={owner.id} className="p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold text-lg">{owner.firstName} {owner.lastName}</span>
                        <Badge variant="secondary">{owner.relationshipToDeceased}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Personnummer: {owner.personalNumber}
                      </p>
                      {owner.address && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Adress: {owner.address}
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="w-48 h-16 border-2 border-gray-400 border-dashed rounded bg-white/50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Signatur</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        ________________________
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Datum
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generate PDF */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generera arvsskiftesdokument</h3>
            
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Generera ett komplett arvsskiftesdokument som kan skrivas ut och signeras fysiskt av alla dödsbodelägare.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              size="lg"
              className="w-full"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Genererar PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generera och ladda ner PDF
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              Tillbaka
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};