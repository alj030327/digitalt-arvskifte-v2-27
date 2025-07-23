import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Shield, Smartphone, Clock, UserCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BankIdService } from "@/services/bankidService";

interface Heir {
  personalNumber: string;
  name: string;
  relationship: string;
  inheritanceShare?: number;
  signed?: boolean;
  signedAt?: string;
}

interface SigningStatus {
  heirPersonalNumber: string;
  isSigning: boolean;
  completed: boolean;
  error?: string;
}

interface Step4Props {
  heirs: Heir[];
  setHeirs: (heirs: Heir[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Signing = ({ heirs, setHeirs, onNext, onBack }: Step4Props) => {
  const [signingStatuses, setSigningStatuses] = useState<SigningStatus[]>(
    heirs.map(h => ({
      heirPersonalNumber: h.personalNumber,
      isSigning: false,
      completed: h.signed || false
    }))
  );

  const handleBankIdSign = async (heirPersonalNumber: string) => {
    setSigningStatuses(prev => prev.map(status => 
      status.heirPersonalNumber === heirPersonalNumber 
        ? { ...status, isSigning: true, error: undefined }
        : status
    ));

    try {
      // Create signing request for inheritance document
      const signRequest = {
        personalNumber: heirPersonalNumber,
        endUserIp: '127.0.0.1', // In production, get real IP
        userVisibleData: BankIdService.encodeUserVisibleData(
          `Arvsskifte - Signering av slutlig fördelning\n\n` +
          `Genom att signera detta dokument bekräftar jag att jag har tagit del av ` +
          `den föreslagna fördelningen av dödsboet och godkänner denna.\n\n` +
          `Datum: ${new Date().toLocaleDateString('sv-SE')}`
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
          // Update signing status
          setSigningStatuses(prev => prev.map(signingStatus => 
            signingStatus.heirPersonalNumber === heirPersonalNumber 
              ? { 
                  ...signingStatus, 
                  isSigning: false, 
                  completed: true,
                  error: undefined 
                }
              : signingStatus
          ));

          // Update heir
          const updatedHeirs = heirs.map(h => 
            h.personalNumber === heirPersonalNumber 
              ? { ...h, signed: true, signedAt: new Date().toLocaleString('sv-SE') }
              : h
          );
          setHeirs(updatedHeirs);
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
      setSigningStatuses(prev => prev.map(status => 
        status.heirPersonalNumber === heirPersonalNumber 
          ? { 
              ...status, 
              isSigning: false, 
              error: error instanceof Error ? error.message : 'Signering misslyckades. Försök igen.' 
            }
          : status
      ));
    }
  };

  const allSigned = heirs.every(h => h.signed);
  const signedCount = heirs.filter(h => h.signed).length;

  const getHeirSigningStatus = (heirPersonalNumber: string) => {
    return signingStatuses.find(s => s.heirPersonalNumber === heirPersonalNumber);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Digital signering</CardTitle>
          <CardDescription>
            Alla dödsbodelägare måste signera digitalt med BankID för att genomföra arvsskiftet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Signeringsframsteg</span>
              <Badge variant={allSigned ? "default" : "secondary"} className={allSigned ? "bg-success text-success-foreground" : ""}>
                {signedCount} av {heirs.length} signerade
              </Badge>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-300"
                style={{ width: `${(signedCount / heirs.length) * 100}%` }}
              />
            </div>
          </div>

          {!allSigned && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Arvsskiftet kan endast genomföras när alla dödsbodelägare har signerat. 
                Varje person måste använda sitt eget BankID för att bekräfta sin identitet.
              </AlertDescription>
            </Alert>
          )}

          {/* Beneficiaries Signing List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dödsbodelägare som ska signera</h3>
            
            <div className="space-y-3">
              {heirs.map((heir) => {
                const signingStatus = getHeirSigningStatus(heir.personalNumber);
                
                return (
                  <div key={heir.personalNumber} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{heir.name}</span>
                          <Badge variant="secondary">{heir.relationship}</Badge>
                          {heir.signed && (
                            <Badge variant="default" className="bg-success text-success-foreground">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Signerad
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Personnummer: {heir.personalNumber}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {heir.signedAt && (
                            <span>Signerad: {heir.signedAt}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {heir.signed ? (
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Slutförd</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleBankIdSign(heir.personalNumber)}
                            disabled={signingStatus?.isSigning}
                            variant={signingStatus?.isSigning ? "secondary" : "default"}
                          >
                            {signingStatus?.isSigning ? (
                              <>
                                <Smartphone className="w-4 h-4 mr-2 animate-pulse" />
                                Signerar...
                              </>
                            ) : (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Signera med BankID
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {signingStatus?.isSigning && (
                      <div className="mt-3 p-3 bg-muted rounded border-l-4 border-l-primary">
                        <p className="text-sm font-medium">Väntar på BankID-signering</p>
                        <p className="text-xs text-muted-foreground">
                          {heir.name} behöver öppna sin BankID-app och bekräfta signeringen
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {allSigned && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Alla dödsbodelägare har signerat! Du kan nu fortsätta till sammanfattningen 
                för att slutföra arvsskiftet.
              </AlertDescription>
            </Alert>
          )}

          {/* Legal Information */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Genom digital signering med BankID bekräftar varje dödsbodelägare sin identitet 
              och samtycke till fördelningen. Signeringen är juridiskt bindande.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Tillbaka
            </Button>
            <Button 
              onClick={onNext} 
              disabled={!allSigned}
            >
              Fortsätt till sammanfattning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};