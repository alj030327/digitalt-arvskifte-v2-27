import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, FileText, Download, CheckCircle2 } from "lucide-react";
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
  const [signatures, setSignatures] = useState<{[ownerId: string]: boolean}>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const totalFinancialAssets = assets
    .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
    .reduce((sum, a) => sum + (a.toRemain ? 0 : a.amount), 0);
    
  const totalPhysicalAssets = physicalAssets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const totalNetAssets = totalFinancialAssets + totalPhysicalAssets;

  const handleSignature = (ownerId: string) => {
    setSignatures(prev => ({
      ...prev,
      [ownerId]: !prev[ownerId]
    }));
  };

  const allSigned = estateOwners.every(owner => signatures[owner.id]);

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
      
      // Create a mock PDF blob and download
      const pdfContent = `Arvsskifte för ${deceasedPersonalNumber}\n\nDödsbodelägare:\n${estateOwners.map(o => `${o.firstName} ${o.lastName} (${o.personalNumber})`).join('\n')}\n\nTotala nettotillgångar: ${totalNetAssets.toLocaleString('sv-SE')} SEK`;
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

  const handleComplete = () => {
    if (!allSigned) {
      toast({
        title: "Ofullständiga signaturer",
        description: "Alla dödsbodelägare måste markera sina signaturer som slutförda.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Arvsskifte slutfört",
      description: "Alla signaturer är slutförda. Arvsskiftet är nu komplett.",
    });
    
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <PenTool className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Slutföra arvsskifte</CardTitle>
          <CardDescription>
            Generera PDF och samla fysiska signaturer från alla dödsbodelägare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sammanfattning</h3>
            
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

          {/* Signature tracking */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Signaturer</h3>
            
            <Alert>
              <PenTool className="h-4 w-4" />
              <AlertDescription>
                När varje dödsbodelägare har signerat det utskrivna dokumentet, markera deras signatur som slutförd nedan.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              {estateOwners.map((owner) => (
                <div key={owner.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{owner.firstName} {owner.lastName}</span>
                        <Badge variant="secondary">{owner.relationshipToDeceased}</Badge>
                        {signatures[owner.id] && (
                          <Badge variant="default" className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Signerad
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Personnummer: {owner.personalNumber}
                      </p>
                      {owner.address && (
                        <p className="text-sm text-muted-foreground">
                          Adress: {owner.address}
                        </p>
                      )}
                    </div>
                    <Button
                      variant={signatures[owner.id] ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSignature(owner.id)}
                    >
                      {signatures[owner.id] ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Signerad
                        </>
                      ) : (
                        <>
                          <PenTool className="w-4 h-4 mr-2" />
                          Markera som signerad
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Signaturstatus:</span>
                <span className={`font-bold ${allSigned ? 'text-success' : 'text-warning'}`}>
                  {Object.values(signatures).filter(Boolean).length} av {estateOwners.length} signaturer slutförda
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              Tillbaka
            </Button>
            
            <Button 
              onClick={handleComplete}
              disabled={!allSigned}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              Slutför arvsskifte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};