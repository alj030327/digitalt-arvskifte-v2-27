import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Step1Props {
  personalNumber: string;
  setPersonalNumber: (value: string) => void;
  onNext: () => void;
}

export const Step1PersonalNumber = ({ personalNumber, setPersonalNumber, onNext }: Step1Props) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

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

  const handleNext = async () => {
    if (!validatePersonalNumber(personalNumber)) {
      setValidationError("Vänligen ange ett giltigt personnummer (ÅÅÅÅMMDD-XXXX)");
      return;
    }

    setIsValidating(true);
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsValidating(false);
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
            Ange personnumret för den person vars arvsskifte ska hanteras
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

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dina uppgifter behandlas säkert och konfidentiellt enligt GDPR. 
              Informationen används endast för att hantera arvsskiftet.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleNext} 
            disabled={!personalNumber || isValidating}
            className="w-full"
            size="lg"
          >
            {isValidating ? "Verifierar..." : "Fortsätt"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};