import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Send, Building2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { OpenBankingService } from "@/services/openBankingService";

interface Beneficiary {
  id: string;
  name: string;
  personalNumber: string;
  relationship: string;
  percentage: number;
  accountNumber: string;
  email?: string;
  phone?: string;
  documentSent?: boolean;
  sentAt?: string;
  signed?: boolean;
  signedAt?: string;
}

interface Step5Props {
  beneficiaries: Beneficiary[];
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5BeneficiarySigning = ({ 
  beneficiaries, 
  setBeneficiaries, 
  onNext, 
  onBack 
}: Step5Props) => {
  const { toast } = useToast();
  const [isSendingToBanks, setIsSendingToBanks] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate automatic status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly sign some beneficiaries if not all are signed
      if (!allSigned && Math.random() > 0.7) {
        const unsignedBeneficiaries = beneficiaries.filter(b => b.documentSent && !b.signed);
        if (unsignedBeneficiaries.length > 0) {
          const randomBeneficiary = unsignedBeneficiaries[Math.floor(Math.random() * unsignedBeneficiaries.length)];
          
          const updatedBeneficiaries = beneficiaries.map(b => 
            b.id === randomBeneficiary.id 
              ? { ...b, signed: true, signedAt: new Date().toISOString() }
              : b
          );
          
          setBeneficiaries(updatedBeneficiaries);
          setLastUpdate(new Date());
          
          toast({
            title: "Signering mottagen",
            description: `${randomBeneficiary.name} har signerat dokumentet.`,
          });
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [beneficiaries, setBeneficiaries, toast]);

  const signedCount = beneficiaries.filter(b => b.signed).length;
  const allSigned = beneficiaries.length > 0 && beneficiaries.every(b => b.signed);

  const handleSendToBanks = async () => {
    if (!allSigned) return;

    setIsSendingToBanks(true);
    
    try {
      // Simulate sending data to banks via PSD2/Open Banking
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Log the inheritance data that would be sent to banks
      console.log("Sending inheritance data to banks:", {
        beneficiaries: beneficiaries.map(b => ({
          name: b.name,
          personalNumber: b.personalNumber,
          accountNumber: b.accountNumber,
          percentage: b.percentage
        })),
        documentId: `ARV-${Date.now()}`,
        signedAt: new Date().toISOString()
      });
      
      toast({
        title: "Skickat till banker",
        description: "Arvsskiftet har skickats till alla relevanta banker via PSD2/Open Banking.",
      });
      
      // Proceed to final summary
      setTimeout(() => {
        onNext();
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skicka till bankerna. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsSendingToBanks(false);
    }
  };

  const getStatusIcon = (beneficiary: Beneficiary) => {
    if (beneficiary.signed) {
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
    if (beneficiary.documentSent) {
      return <Clock className="w-5 h-5 text-warning" />;
    }
    return <div className="w-5 h-5 rounded-full bg-muted" />;
  };

  const getStatusText = (beneficiary: Beneficiary) => {
    if (beneficiary.signed) {
      return "Signerat";
    }
    if (beneficiary.documentSent) {
      return "Väntar på signering";
    }
    return "Ej skickat";
  };

  const getStatusVariant = (beneficiary: Beneficiary): "default" | "secondary" | "destructive" => {
    if (beneficiary.signed) return "default";
    if (beneficiary.documentSent) return "secondary";
    return "destructive";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Signeringsstatus</CardTitle>
          <CardDescription>
            Följ signeringsprocessen i realtid. Sidan uppdateras automatiskt när signaturer kommer in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Signeringsframsteg:</span>
              <span className="text-lg font-bold text-primary">
                {signedCount} av {beneficiaries.length}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${beneficiaries.length > 0 ? (signedCount / beneficiaries.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              Sidan uppdateras automatiskt när dödsbodelägarna signerar dokumentet. 
              Senaste uppdatering: {lastUpdate.toLocaleTimeString('sv-SE')}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dödsbodelägares signeringsstatus</h3>
            
            {beneficiaries.map((beneficiary) => (
              <div key={beneficiary.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(beneficiary)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{beneficiary.name}</span>
                        <Badge variant="outline">{beneficiary.relationship}</Badge>
                        <Badge variant="outline">{beneficiary.percentage}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {beneficiary.email} • {beneficiary.phone}
                      </p>
                      {beneficiary.signedAt && (
                        <p className="text-sm text-muted-foreground">
                          Signerat: {new Date(beneficiary.signedAt).toLocaleString('sv-SE')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(beneficiary)}>
                    {getStatusText(beneficiary)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {allSigned && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Alla dödsbodelägare har signerat dokumentet! Nu kan arvsskiftet skickas till bankerna 
                för genomförande via PSD2 och Open Banking.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              Tillbaka
            </Button>
            
            <Button 
              onClick={handleSendToBanks}
              disabled={!allSigned || isSendingToBanks}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {isSendingToBanks ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Skickar till banker...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Skicka till banker
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};