import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Shield, Smartphone, Clock, UserCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Beneficiary {
  id: string;
  name: string;
  personalNumber: string;
  relationship: string;
  percentage: number;
  accountNumber: string;
  signed?: boolean;
  signedAt?: string;
}

interface SigningStatus {
  beneficiaryId: string;
  isSigning: boolean;
  completed: boolean;
}

interface Step4Props {
  beneficiaries: Beneficiary[];
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Signing = ({ beneficiaries, setBeneficiaries, onNext, onBack }: Step4Props) => {
  const [signingStatuses, setSigningStatuses] = useState<SigningStatus[]>(
    beneficiaries.map(b => ({
      beneficiaryId: b.id,
      isSigning: false,
      completed: b.signed || false
    }))
  );

  const handleBankIdSign = async (beneficiaryId: string) => {
    // Update signing status
    setSigningStatuses(prev => prev.map(s => 
      s.beneficiaryId === beneficiaryId 
        ? { ...s, isSigning: true } 
        : s
    ));

    // Simulate BankID process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mark as completed
    setSigningStatuses(prev => prev.map(s => 
      s.beneficiaryId === beneficiaryId 
        ? { ...s, isSigning: false, completed: true } 
        : s
    ));

    // Update beneficiary
    const updatedBeneficiaries = beneficiaries.map(b => 
      b.id === beneficiaryId 
        ? { ...b, signed: true, signedAt: new Date().toLocaleString('sv-SE') }
        : b
    );
    setBeneficiaries(updatedBeneficiaries);
  };

  const allSigned = beneficiaries.every(b => b.signed);
  const signedCount = beneficiaries.filter(b => b.signed).length;

  const getBeneficiarySigningStatus = (beneficiaryId: string) => {
    return signingStatuses.find(s => s.beneficiaryId === beneficiaryId);
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
                {signedCount} av {beneficiaries.length} signerade
              </Badge>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-300"
                style={{ width: `${(signedCount / beneficiaries.length) * 100}%` }}
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
              {beneficiaries.map((beneficiary) => {
                const signingStatus = getBeneficiarySigningStatus(beneficiary.id);
                
                return (
                  <div key={beneficiary.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{beneficiary.name}</span>
                          <Badge variant="secondary">{beneficiary.relationship}</Badge>
                          {beneficiary.signed && (
                            <Badge variant="default" className="bg-success text-success-foreground">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Signerad
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Personnummer: {beneficiary.personalNumber}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Andel: {beneficiary.percentage}%</span>
                          {beneficiary.signedAt && (
                            <span>Signerad: {beneficiary.signedAt}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {beneficiary.signed ? (
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Slutförd</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleBankIdSign(beneficiary.id)}
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
                          {beneficiary.name} behöver öppna sin BankID-app och bekräfta signeringen
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