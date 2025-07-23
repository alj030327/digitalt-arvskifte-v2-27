import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, AlertCircle, Shield, Users, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Heir {
  personalNumber: string;
  name: string;
  relationship: string;
  inheritanceShare: number;
}

interface Step1Props {
  personalNumber: string;
  setPersonalNumber: (value: string) => void;
  onNext: () => void;
}

export const Step1PersonalNumber = ({ personalNumber, setPersonalNumber, onNext }: Step1Props) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [currentUserPersonalNumber, setCurrentUserPersonalNumber] = useState("");
  const [hasFetchedHeirs, setHasFetchedHeirs] = useState(false);
  const [isSigningWithBankID, setIsSigningWithBankID] = useState(false);
  const [hasSignedWithBankID, setHasSignedWithBankID] = useState(false);
  const [bankIDError, setBankIDError] = useState("");

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
    if (!validatePersonalNumber(personalNumber)) {
      setValidationError("Vänligen ange ett giltigt personnummer (ÅÅÅÅMMDD-XXXX)");
      return;
    }

    setIsValidating(true);
    setValidationError("");
    
    try {
      // Simulate API call to Skatteverket
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data representing heirs from bouppteckning
      const mockHeirs: Heir[] = [
        {
          personalNumber: "19901201-1234",
          name: "Anna Andersson",
          relationship: "Barn",
          inheritanceShare: 50
        },
        {
          personalNumber: "19851115-5678",
          name: "Erik Andersson", 
          relationship: "Barn",
          inheritanceShare: 50
        }
      ];
      
      setHeirs(mockHeirs);
      setHasFetchedHeirs(true);
    } catch (error) {
      setValidationError("Kunde inte hämta arvsinformation från Skatteverket. Försök igen.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleBankIDSigning = async () => {
    if (!currentUserPersonalNumber) {
      setBankIDError("Vänligen ange ditt personnummer för BankID-signering");
      return;
    }
    
    if (!validatePersonalNumber(currentUserPersonalNumber)) {
      setBankIDError("Vänligen ange ett giltigt personnummer");
      return;
    }

    setIsSigningWithBankID(true);
    setBankIDError("");
    
    try {
      // Simulate BankID signing process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if current user is one of the heirs
      const isAuthorizedHeir = heirs.some(heir => 
        heir.personalNumber.replace('-', '') === currentUserPersonalNumber.replace('-', '')
      );
      
      if (!isAuthorizedHeir) {
        setBankIDError("Du är inte registrerad som arvinge för denna bouppteckning och kan därför inte fortsätta.");
        setIsSigningWithBankID(false);
        return;
      }
      
      setHasSignedWithBankID(true);
    } catch (error) {
      setBankIDError("BankID-signering misslyckades. Försök igen.");
    } finally {
      setIsSigningWithBankID(false);
    }
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
          <CardTitle className="text-2xl">Identifiering av den avlidne</CardTitle>
          <CardDescription>
            Ange personnumret för den person vars arvsskifte ska hanteras. Vi hämtar sedan information om dödsbodelägarna från Skatteverket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="personalNumber">Personnummer</Label>
            <Input
              id="personalNumber"
              type="text"
              placeholder="ÅÅÅÅMMDD-XXXX"
              value={personalNumber}
              onChange={handleInputChange}
              maxLength={13}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Format: ÅÅÅÅMMDD-XXXX (t.ex. 19501231-1234)
            </p>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {!hasFetchedHeirs && !isValidating && (
            <Button 
              onClick={fetchHeirsFromSkatteverket} 
              disabled={!personalNumber}
              className="w-full"
              size="lg"
            >
              Hämta arvsinformation från Skatteverket
            </Button>
          )}

          {isValidating && (
            <div className="text-center py-4">
              <div className="animate-pulse text-muted-foreground">
                Hämtar information från Skatteverket och bouppteckningen...
              </div>
            </div>
          )}

          {hasFetchedHeirs && heirs.length > 0 && (
            <div className="space-y-4">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Följande dödsbodelägare hittades i bouppteckningen:
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                {heirs.map((heir, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{heir.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {heir.personalNumber} • {heir.relationship}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {!hasSignedWithBankID && (
                <div className="space-y-4 border-t pt-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      För att fortsätta till nästa steg måste du signera med BankID. 
                      Endast registrerade dödsbodelägare kan komma åt bankuppgifterna.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentUserPersonalNumber">Ditt personnummer för BankID-signering</Label>
                    <Input
                      id="currentUserPersonalNumber"
                      type="text"
                      placeholder="ÅÅÅÅMMDD-XXXX"
                      value={currentUserPersonalNumber}
                      onChange={(e) => {
                        const formatted = formatPersonalNumber(e.target.value);
                        setCurrentUserPersonalNumber(formatted);
                        setBankIDError("");
                      }}
                      maxLength={13}
                    />
                  </div>
                  
                  {bankIDError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{bankIDError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    onClick={handleBankIDSigning}
                    disabled={!currentUserPersonalNumber || isSigningWithBankID}
                    className="w-full"
                    size="lg"
                  >
                    {isSigningWithBankID ? "Signerar med BankID..." : "Signera med BankID"}
                  </Button>
                </div>
              )}
              
              {hasSignedWithBankID && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    BankID-signering genomförd. Du är verifierad som dödsbodelägare och kan nu fortsätta.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dina uppgifter behandlas säkert och konfidentiellt enligt GDPR. 
              Informationen används endast för att hantera arvsskiftet.
            </AlertDescription>
          </Alert>

          {hasSignedWithBankID && (
            <Button 
              onClick={handleNext} 
              className="w-full"
              size="lg"
            >
              Fortsätt till tillgångar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};