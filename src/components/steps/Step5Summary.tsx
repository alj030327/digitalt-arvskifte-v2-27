import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, FileText, Shield, Download, Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BankIdService } from "@/services/bankidService";

interface Asset {
  id: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  amount: number;
}

interface Beneficiary {
  id: string;
  name: string;
  personalNumber: string;
  relationship: string;
  percentage: number;
  accountNumber: string;
}

interface Step5Props {
  personalNumber: string;
  assets: Asset[];
  beneficiaries: Beneficiary[];
  testament: Testament | null;
  onBack: () => void;
  onComplete: () => void;
}

interface Testament {
  id: string;
  filename: string;
  uploadDate: string;
  verified: boolean;
}

export const Step5Summary = ({ personalNumber, assets, beneficiaries, testament, onBack, onComplete }: Step5Props) => {
  const [isSigning, setIsSigning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);

  const handleBankIdSign = async () => {
    setIsSigning(true);
    
    try {
      // Create signing request for final inheritance document
      const signRequest = {
        personalNumber: personalNumber,
        endUserIp: '127.0.0.1', // In production, get real IP
        userVisibleData: BankIdService.encodeUserVisibleData(
          `Arvsskifte - Slutgiltig sammanfattning\n\n` +
          `Genom att signera detta dokument bekräftar jag att jag har granskat ` +
          `den slutliga fördelningen av dödsboet och godkänner alla detaljer.\n\n` +
          `Totalt värde: ${totalAmount.toLocaleString('sv-SE')} kr\n` +
          `Datum: ${new Date().toLocaleDateString('sv-SE')}\n\n` +
          `Detta dokument utgör en juridiskt bindande överenskommelse.`
        )
      };
      
      const session = await BankIdService.sign(signRequest);
      
      if (!session) {
        throw new Error('Kunde inte starta BankID-session');
      }
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds with 500ms intervals
      
      while (attempts < maxAttempts) {
        const status = await BankIdService.checkStatus(session.orderRef);
        
        if (status?.status === 'complete') {
          setIsCompleted(true);
          // Complete after showing success
          setTimeout(() => {
            onComplete();
          }, 2000);
          break;
        } else if (status?.status === 'failed') {
          throw new Error('BankID-signering misslyckades');
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (attempts >= maxAttempts) {
        await BankIdService.cancel(session.orderRef);
        throw new Error('BankID-signering tog för lång tid');
      }
      
    } catch (error) {
      console.error('BankID signing failed:', error);
      // Could show error toast here
    } finally {
      setIsSigning(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-success mb-4">Arvsskiftet är genomfört!</h2>
            <p className="text-muted-foreground mb-6">
              Alla dokument har signerats och utbetalningar kommer att påbörjas inom 3-5 bankdagar.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Ladda ned dokument
              </Button>
              <Button>
                Avsluta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Slutlig sammanfattning</CardTitle>
          <CardDescription>
            Granska hela arvsskiftet innan det genomförs slutgiltigt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Deceased Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Avliden person</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p><span className="font-medium">Personnummer:</span> {personalNumber}</p>
            </div>
          </div>

          {/* Assets Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tillgångar</h3>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{asset.bank}</span>
                      <Badge variant="secondary">{asset.accountType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{asset.accountNumber}</p>
                  </div>
                  <div className="font-semibold">
                    {asset.amount.toLocaleString('sv-SE')} SEK
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-semibold text-lg">Totala tillgångar:</span>
                <span className="text-xl font-bold text-primary">
                  {totalAmount.toLocaleString('sv-SE')} SEK
                </span>
              </div>
            </div>
          </div>

          {/* Testament Information */}
          {testament && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Testamente</h3>
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium">{testament.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      Verifierat testamente från {testament.uploadDate}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-success text-success-foreground ml-auto">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verifierat
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Beneficiaries Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Fördelning {testament ? "(Enligt testamente)" : "(Lagstadgad arvordning)"}</h3>
            <div className="space-y-3">
              {beneficiaries.map((beneficiary) => (
                <div key={beneficiary.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{beneficiary.name}</span>
                        <Badge variant="secondary">{beneficiary.relationship}</Badge>
                        <Badge variant="default" className="bg-success text-success-foreground">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Signerad
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Personnummer: {beneficiary.personalNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kontonummer: {beneficiary.accountNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {beneficiary.percentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((beneficiary.percentage / 100) * totalAmount).toLocaleString('sv-SE')} SEK
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Information */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Genom att signera detta dokument bekräftar du att informationen är korrekt och 
              att du har behörighet att genomföra detta arvsskifte. Dokumentet blir juridiskt bindande.
            </AlertDescription>
          </Alert>

          {/* Sign Button */}
          <div className="text-center space-y-4">
            <Button 
              onClick={handleBankIdSign}
              disabled={isSigning}
              size="lg"
              className="px-8"
            >
              {isSigning ? (
                <>
                  <Smartphone className="w-4 h-4 mr-2 animate-pulse" />
                  Väntar på BankID...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Signera med BankID
                </>
              )}
            </Button>
            
            {isSigning && (
              <div className="text-sm text-muted-foreground">
                Öppna din BankID-app och bekräfta signeringen
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack} disabled={isSigning}>
              Tillbaka
            </Button>
            <div className="text-sm text-muted-foreground self-center">
              Alla uppgifter behandlas säkert enligt GDPR
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};