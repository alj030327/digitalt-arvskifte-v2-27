import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenTool, FileText, Download, Users, Building2, Package, CreditCard, Lock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EstateOwner } from "./Step1EstateOwners";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [currentPhase, setCurrentPhase] = useState<'review' | 'payment' | 'complete'>('review');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const totalFinancialAssets = assets
    .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
    .reduce((sum, a) => sum + (a.toRemain ? 0 : a.amount), 0);
     
  const totalPhysicalAssets = physicalAssets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const totalNetAssets = totalFinancialAssets + totalPhysicalAssets;

  const handleProceedToPayment = () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Ogiltig e-post",
        description: "Ange en giltig e-postadress.",
        variant: "destructive",
      });
      return;
    }
    setCurrentPhase('payment');
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Create inheritance data object
      const inheritanceData = {
        deceased: {
          name: `${deceasedFirstName} ${deceasedLastName}`,
          personalNumber: deceasedPersonalNumber,
        },
        estateOwners,
        assets: assets.filter(a => !a.toRemain && !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType)),
        physicalAssets,
        beneficiaries,
        totals: {
          financialAssets: totalFinancialAssets,
          physicalAssets: totalPhysicalAssets,
          netAssets: totalNetAssets,
        }
      };

      // Create payment session
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          email,
          phone,
          inheritanceData
        }
      });

      if (error) {
        throw error;
      }

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Omdirigerar till betalning",
        description: "Betalningssidan öppnades i en ny flik. Slutför betalningen där.",
      });
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Betalningsfel",
        description: error.message || "Kunde inte starta betalningen. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

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
      {currentPhase === 'review' && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <PenTool className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Arvsskifte - Granska sammanfattning</CardTitle>
            <CardDescription>
              Granska all information innan du går vidare till betalning
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

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Kontaktinformation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-postadress *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din.email@exempel.se"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Kvitto och projektåtkomst skickas till denna e-post
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefonnummer (valfritt)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+46 70 123 45 67"
                  />
                </div>
              </div>
            </div>

            {/* Next Step Info */}
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Nästa steg: Betalning (200 SEK)</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Efter betalningen får du 12 månaders tillgång till ditt digitala arvsskifte och kan generera signeringsdokument.
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button variant="outline" onClick={onBack} className="sm:w-auto">
                Tillbaka
              </Button>
              <Button onClick={handleProceedToPayment} size="lg" className="sm:w-auto">
                <CreditCard className="w-4 h-4 mr-2" />
                Fortsätt till betalning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentPhase === 'payment' && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Betalning - Digitalt Arvsskifte</CardTitle>
            <CardDescription>
              Säker betalning för aktivering av ditt arvsskifte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Vad ingår:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Digitalt arvsskifte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Säker dokumenthantering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">BankID-signering</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">E-postkvitto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">12 månaders projektåtkomst</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Support och hjälp</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Digitalt Arvsskifte</div>
                  <div className="text-sm text-muted-foreground">
                    För: {deceasedFirstName} {deceasedLastName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">200 SEK</div>
                  <div className="text-sm text-muted-foreground">Engångsbetalning</div>
                </div>
              </div>
            </div>

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Säker betalning via Stripe</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Din betalning är skyddad med branschledande säkerhetsstandard.
                </div>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handlePayment}
              disabled={isProcessingPayment}
              size="lg"
              className="w-full"
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Förbereder betalning...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Betala 200 SEK - Säkert med Stripe
                </>
              )}
            </Button>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentPhase('review')}>
                Tillbaka
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};