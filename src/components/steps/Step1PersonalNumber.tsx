import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, AlertCircle, Shield, Users, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SkatteverketService } from "@/services/skatteverketService";
import { useToast } from "@/hooks/use-toast";
import { BankIDPhoneAuth } from "@/components/BankIDPhoneAuth";

interface Heir {
  personalNumber: string;
  name: string;
  relationship: string;
  inheritanceShare?: number;
  signed?: boolean;
  signedAt?: string;
  email?: string;
  phone?: string;
}

interface Step1Props {
  personalNumber: string;
  setPersonalNumber: (value: string) => void;
  heirs: Heir[];
  setHeirs: (heirs: Heir[]) => void;
  onNext: () => void;
  t: (key: string) => string;
}

export const Step1PersonalNumber = ({ personalNumber, setPersonalNumber, heirs, setHeirs, onNext, t }: Step1Props) => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [localHeirs, setLocalHeirs] = useState<Heir[]>(heirs);
  const [hasFetchedHeirs, setHasFetchedHeirs] = useState(false);
  const [isSigningWithBankID, setIsSigningWithBankID] = useState(false);
  const [hasSignedWithBankID, setHasSignedWithBankID] = useState(false);
  const [bankIDError, setBankIDError] = useState("");
  const [currentUserPersonalNumber, setCurrentUserPersonalNumber] = useState("");

  const validatePersonalNumber = (number: string) => {
    // Simplified validation for Swedish personal numbers (YYYYMMDD-XXXX)
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.length !== 10 && cleaned.length !== 12) {
      return false;
    }
    return true;
  };

  const formatPersonalNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 8) {
      return cleaned;
    }
    return cleaned.slice(0, 8) + "-" + cleaned.slice(8, 12);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPersonalNumber(e.target.value);
    setPersonalNumber(formatted);
    setValidationError("");
  };

  const fetchHeirsFromSkatteverket = async () => {
    if (!SkatteverketService.validatePersonalNumber(personalNumber)) {
      setValidationError("Vänligen ange ett giltigt personnummer (ÅÅÅÅMMDD-XXXX)");
      return;
    }

    setIsValidating(true);
    setValidationError("");
    
    try {
      // Use SkatteverketService to fetch heirs
      const response = await SkatteverketService.fetchHeirs(personalNumber);
      
      if (response.status === 'success' && response.data?.heirs.length > 0) {
        // Convert SkatteverketHeirData to Heir format
        const convertedHeirs: Heir[] = response.data.heirs.map(heir => ({
          personalNumber: heir.personalNumber,
          name: heir.name,
          relationship: heir.relationship,
          inheritanceShare: heir.inheritanceShare * 100 // Convert to percentage
        }));
        
        setLocalHeirs(convertedHeirs);
        setHeirs(convertedHeirs);
        setHasFetchedHeirs(true);
      } else {
        setValidationError(response.error || "Inga arvingar hittades för det angivna personnumret.");
      }
    } catch (error) {
      setValidationError("Kunde inte hämta arvsinformation från Skatteverket. Försök igen.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleBankIDSuccess = (result: any) => {
    // Kontrollera att användaren är en registrerad arvinge
    const isAuthorizedHeir = localHeirs.some(heir => 
      heir.personalNumber.replace('-', '') === result.completionData.user.personalNumber.replace('-', '')
    );
    
    if (!isAuthorizedHeir) {
      setBankIDError("Du är inte registrerad som arvinge för denna bouppteckning och kan därför inte fortsätta.");
      setIsSigningWithBankID(false);
      return;
    }
    
    setCurrentUserPersonalNumber(result.completionData.user.personalNumber);
    setHasSignedWithBankID(true);
    setIsSigningWithBankID(false);
    setBankIDError("");
    
    toast({
      title: "BankID-signering lyckades",
      description: `Välkommen ${result.completionData.user.name}!`,
    });
  };

  const handleBankIDError = (error: string) => {
    setBankIDError(error);
    setIsSigningWithBankID(false);
  };

  const handleNext = () => {
    if (!hasSignedWithBankID) {
      setBankIDError("Du måste signera med BankID för att fortsätta");
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('step1.title')}</CardTitle>
          <CardDescription>
            {t('step1.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Enter deceased personal number to fetch heirs */}
          {!hasFetchedHeirs && (
            <div className="space-y-4">
              <Alert>
                <UserCheck className="h-4 w-4" />
                <AlertDescription>
                  Ange den avlidnes personnummer för att hämta dödsbodelägarna från Skatteverket.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="personalNumber">Den avlidnes personnummer</Label>
                <Input
                  id="personalNumber"
                  type="text"
                  placeholder="ÅÅÅÅMMDD-XXXX"
                  value={personalNumber}
                  onChange={handleInputChange}
                  disabled={isValidating}
                />
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={fetchHeirsFromSkatteverket} 
                disabled={!personalNumber || isValidating}
                className="w-full"
              >
                {isValidating ? "Hämtar dödsbodelägare..." : "Hämta dödsbodelägare"}
              </Button>
            </div>
          )}

          {/* Step 2: Show heirs and allow BankID signing */}
          {hasFetchedHeirs && !hasSignedWithBankID && (
            <div className="space-y-6">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Här är dödsbodelägarna enligt Skatteverket. Identifiera dig med BankID för att fortsätta.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dödsbodelägare</h3>
                <div className="space-y-2">
                  {localHeirs.map((heir, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-card">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-medium">{heir.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {heir.personalNumber} • {heir.relationship}
                          </p>
                          {heir.inheritanceShare && (
                            <Badge variant="outline">
                              {heir.inheritanceShare}% av arvet
                            </Badge>
                          )}
                        </div>
                        {heir.signed && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm">Signerad</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {bankIDError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{bankIDError}</AlertDescription>
                </Alert>
              )}

              {!isSigningWithBankID ? (
                <Button 
                  onClick={() => setIsSigningWithBankID(true)}
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Signera med BankID
                </Button>
              ) : (
                <BankIDPhoneAuth
                  onSuccess={handleBankIDSuccess}
                  onError={handleBankIDError}
                />
              )}
            </div>
          )}

          {/* Step 3: After successful BankID, show continue button */}
          {hasSignedWithBankID && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  BankID-signering lyckades! Du kan nu fortsätta med bouppteckningen.
                </AlertDescription>
              </Alert>

              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Identifiering bekräftad</p>
                    <p className="text-sm text-muted-foreground">
                      Personnummer: {currentUserPersonalNumber}
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full">
                Fortsätt till nästa steg
              </Button>
            </div>
          )}

          {/* GDPR notice */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm text-muted-foreground text-center">
              Dina uppgifter behandlas säkert och konfidentiellt enligt GDPR. 
              Informationen används endast för att hantera arvsskiftet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};