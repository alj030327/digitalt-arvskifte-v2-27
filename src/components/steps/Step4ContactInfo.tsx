import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Send, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

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
}

interface Step4Props {
  beneficiaries: Beneficiary[];
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4ContactInfo = ({ 
  beneficiaries, 
  setBeneficiaries, 
  onNext, 
  onBack 
}: Step4Props) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingDocuments, setIsSendingDocuments] = useState(false);

  const handleContactInfoChange = (id: string, field: 'email' | 'phone', value: string) => {
    setBeneficiaries(beneficiaries.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const allContactInfoComplete = beneficiaries.every(b => 
    b.email && validateEmail(b.email) && b.phone && validatePhone(b.phone)
  );

  const handleSendDocuments = async () => {
    if (!allContactInfoComplete) return;

    setIsSendingDocuments(true);
    
    try {
      // Simulate PDF generation and document sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark all documents as sent
      const updatedBeneficiaries = beneficiaries.map(b => ({
        ...b,
        documentSent: true,
        sentAt: new Date().toISOString()
      }));
      
      setBeneficiaries(updatedBeneficiaries);
      
      toast({
        title: "Dokument skickade",
        description: "Arvsskiftet har skickats till alla dödsbodelägare för e-signering.",
      });
      
      // Proceed to signing step after a short delay
      setTimeout(() => {
        onNext();
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skicka dokumenten. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsSendingDocuments(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Kontaktuppgifter för e-signering</CardTitle>
          <CardDescription>
            Ange e-post och telefonnummer för att skicka arvsskiftet för digitala signaturer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Arvsskiftet kommer att skickas som en PDF till alla dödsbodelägare för e-signering. 
              När alla har signerat kan dokumentet skickas vidare till bankerna.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dödsbodelägares kontaktuppgifter</h3>
            
            {beneficiaries.map((beneficiary) => (
              <div key={beneficiary.id} className="p-4 border border-border rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium">{beneficiary.name}</span>
                    <Badge variant="secondary">{beneficiary.relationship}</Badge>
                    <Badge variant="outline">{beneficiary.percentage}%</Badge>
                    {beneficiary.documentSent && (
                      <Badge variant="default" className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Skickat
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`email-${beneficiary.id}`}>E-postadress</Label>
                      <Input
                        id={`email-${beneficiary.id}`}
                        type="email"
                        value={beneficiary.email || ''}
                        onChange={(e) => handleContactInfoChange(beneficiary.id, 'email', e.target.value)}
                        placeholder="namn@exempel.se"
                        disabled={beneficiary.documentSent}
                      />
                      {beneficiary.email && !validateEmail(beneficiary.email) && (
                        <p className="text-sm text-destructive">Ange en giltig e-postadress</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`phone-${beneficiary.id}`}>Telefonnummer</Label>
                      <Input
                        id={`phone-${beneficiary.id}`}
                        type="tel"
                        value={beneficiary.phone || ''}
                        onChange={(e) => handleContactInfoChange(beneficiary.id, 'phone', formatPhoneNumber(e.target.value))}
                        placeholder="070-123 45 67"
                        disabled={beneficiary.documentSent}
                      />
                      {beneficiary.phone && !validatePhone(beneficiary.phone) && (
                        <p className="text-sm text-destructive">Ange ett giltigt telefonnummer (minst 10 siffror)</p>
                      )}
                    </div>
                  </div>
                  
                  {beneficiary.documentSent && beneficiary.sentAt && (
                    <div className="text-sm text-muted-foreground">
                      Skickat: {new Date(beneficiary.sentAt).toLocaleString('sv-SE')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {beneficiaries.some(b => b.documentSent) && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Dokument har skickats till dödsbodelägarna. De kommer att få ett e-postmeddelande 
                med instruktioner för digital signering.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              Tillbaka
            </Button>
            
            <div className="flex gap-3">
              {!beneficiaries.every(b => b.documentSent) ? (
                <Button 
                  onClick={handleSendDocuments}
                  disabled={!allContactInfoComplete || isSendingDocuments}
                  size="lg"
                  className="flex-1 sm:flex-none"
                >
                  {isSendingDocuments ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Skickar dokument...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Skicka för e-signering
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={onNext}
                  size="lg"
                  className="flex-1 sm:flex-none"
                >
                  Fortsätt till signering
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};