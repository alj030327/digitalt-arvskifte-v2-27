import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Send, Building2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { OpenBankingService } from "@/services/openBankingService";

interface Heir {
  personalNumber: string;
  name: string;
  relationship: string;
  inheritanceShare?: number;
  signed?: boolean;
  signedAt?: string;
  email?: string;
  phone?: string;
  documentSent?: boolean;
  sentAt?: string;
  notificationPreference?: 'email' | 'sms' | 'both';
}

interface Step5Props {
  heirs: Heir[];
  setHeirs: (heirs: Heir[]) => void;
  onNext: () => void;
  onBack: () => void;
  t: (key: string) => string;
}

export const Step5BeneficiarySigning = ({ 
  heirs, 
  setHeirs, 
  onNext, 
  onBack,
  t
}: Step5Props) => {
  const { toast } = useToast();
  const [isSendingToBanks, setIsSendingToBanks] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate automatic status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly sign some heirs if not all are signed
      if (!allSigned && Math.random() > 0.7) {
        const unsignedHeirs = heirs.filter(h => h.documentSent && !h.signed);
        if (unsignedHeirs.length > 0) {
          const randomHeir = unsignedHeirs[Math.floor(Math.random() * unsignedHeirs.length)];
          
          const updatedHeirs = heirs.map(h => 
            h.personalNumber === randomHeir.personalNumber 
              ? { ...h, signed: true, signedAt: new Date().toISOString() }
              : h
          );
          
          setHeirs(updatedHeirs);
          setLastUpdate(new Date());
          
          toast({
            title: "BankID-signering mottagen",
            description: `${randomHeir.name} har signerat med BankID.`,
          });
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [heirs, setHeirs, toast]);

  const signedCount = heirs.filter(h => h.signed).length;
  const allSigned = heirs.length > 0 && heirs.every(h => h.signed);

  const handleSendToBanks = async () => {
    if (!allSigned) return;

    setIsSendingToBanks(true);
    
    try {
      // Simulate sending data to banks via PSD2/Open Banking
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Log the inheritance data that would be sent to banks
      console.log("Sending inheritance data to banks:", {
        heirs: heirs.map(h => ({
          name: h.name,
          personalNumber: h.personalNumber,
          relationship: h.relationship,
          inheritanceShare: h.inheritanceShare,
          signedAt: h.signedAt
        })),
        documentId: `ARV-${Date.now()}`,
        allSignedAt: new Date().toISOString()
      });
      
      toast({
        title: "Skickat till banker",
        description: t('step5.all_signed'),
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

  const getStatusIcon = (heir: Heir) => {
    if (heir.signed) {
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
    if (heir.documentSent) {
      return <Clock className="w-5 h-5 text-warning" />;
    }
    return <div className="w-5 h-5 rounded-full bg-muted" />;
  };

  const getStatusText = (heir: Heir) => {
    if (heir.signed) {
      return "Signerat med BankID";
    }
    if (heir.documentSent) {
      return "Väntar på BankID-signering";
    }
    return "Ej skickat";
  };

  const getStatusVariant = (heir: Heir): "default" | "secondary" | "destructive" => {
    if (heir.signed) return "default";
    if (heir.documentSent) return "secondary";
    return "destructive";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('step5.title')}</CardTitle>
          <CardDescription>
            {t('step5.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{t('step5.signing_status')}:</span>
              <span className="text-lg font-bold text-primary">
                {signedCount} {t('step5.signed_count')} {heirs.length}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${heirs.length > 0 ? (signedCount / heirs.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              Sidan uppdateras automatiskt när dödsbodelägarna signerar med BankID. 
              Senaste uppdatering: {lastUpdate.toLocaleTimeString('sv-SE')}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dödsbodelägares BankID-signering</h3>
            
            {heirs.map((heir) => (
              <div key={heir.personalNumber} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(heir)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{heir.name}</span>
                        <Badge variant="outline">{heir.relationship}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {heir.personalNumber}
                      </p>
                      {heir.email && heir.phone && (
                        <p className="text-sm text-muted-foreground">
                          {heir.email} • {heir.phone}
                        </p>
                      )}
                      {heir.signedAt && (
                        <p className="text-sm text-muted-foreground">
                          Signerat: {new Date(heir.signedAt).toLocaleString('sv-SE')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(heir)}>
                    {getStatusText(heir)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {allSigned && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {t('step5.all_signed')}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              {t('button.back')}
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
                  Fortsätter...
                </>
              ) : (
                <>
                  Nästa
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};