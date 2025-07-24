import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Phone, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";
import { PDFService } from "@/services/pdfService";

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

interface Step4Props {
  heirs: Heir[];
  setHeirs: (heirs: Heir[]) => void;
  personalNumber?: string; // Added for PDF generation
  totalAmount?: number; // Added for PDF generation
  onNext: () => void;
  onBack: () => void;
  t: (key: string) => string;
}

export const Step4ContactInfo = ({ 
  heirs, 
  setHeirs,
  personalNumber = "",
  totalAmount = 0,
  onNext,
  onBack,
  t
}: Step4Props) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingDocuments, setIsSendingDocuments] = useState(false);

  const handleContactInfoChange = (personalNumber: string, field: 'email' | 'phone' | 'notificationPreference', value: string) => {
    setHeirs(heirs.map(h => 
      h.personalNumber === personalNumber ? { ...h, [field]: value } : h
    ));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const allContactInfoComplete = heirs.every(h => {
    const pref = h.notificationPreference || 'both';
    const needsEmail = pref === 'email' || pref === 'both';
    const needsSms = pref === 'sms' || pref === 'both';
    
    return (!needsEmail || (h.email && validateEmail(h.email))) &&
           (!needsSms || (h.phone && validatePhone(h.phone)));
  });

  const handleSendDocuments = async () => {
    if (!allContactInfoComplete) return;

    setIsSendingDocuments(true);
    
    try {
      // Generate PDF for inheritance settlement
      const settlementPdf = await PDFService.generateDistributionPDF({
        personalNumber,
        assets: [], // Would be passed from parent component in production
        beneficiaries: heirs.map(h => ({
          name: h.name,
          personalNumber: h.personalNumber,
          relationship: h.relationship,
          percentage: h.inheritanceShare || 0,
          amount: ((h.inheritanceShare || 0) / 100) * totalAmount,
          accountNumber: "" // Would need to be collected if not available
        })),
        totalAmount
      });

      if (!settlementPdf) {
        throw new Error("Kunde inte generera PDF");
      }

      // Convert Blob to File for notification service
      const pdfFile = new File([settlementPdf], "arvsskifte.pdf", { type: "application/pdf" });

      // Send e-signature requests via email and SMS
      const results = await notificationService.sendInheritanceSettlementForSigning(
        heirs.map(h => ({
          name: h.name,
          email: h.email || "",
          phone: h.phone || "",
          personalNumber: h.personalNumber
        })),
        pdfFile,
        personalNumber
      );

      // Update heirs with signature tracking info
      const updatedHeirs = heirs.map(h => {
        const result = results.find(r => r.beneficiary === h.name);
        return {
          ...h,
          documentSent: true,
          sentAt: new Date().toISOString(),
          signatureId: result?.signatureId || "",
          trackingUrl: result?.trackingUrl || ""
        };
      });
      
      setHeirs(updatedHeirs);
      
      const successCount = results.filter(r => r.emailSent && r.smsSent).length;
      
      toast({
        title: "Dokument skickade",
        description: `Arvsskiftet har skickats till ${successCount} av ${heirs.length} arvingar för e-signering.`,
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
          <CardTitle className="text-2xl">{t('step4.title')}</CardTitle>
          <CardDescription>
            {t('step4.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Arvsskiftet kommer att skickas som en PDF till alla dödsbodelägare för e-signering via e-post och/eller SMS enligt deras valda preferenser. 
              När alla har signerat kan dokumentet skickas vidare till bankerna.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Arvingarnas kontaktuppgifter</h3>
            
            {heirs.map((heir) => (
              <div key={heir.personalNumber} className="p-4 border border-border rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium">{heir.name}</span>
                    <Badge variant="secondary">{heir.relationship}</Badge>
                    {heir.documentSent && (
                      <Badge variant="default" className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Skickat
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Notification Preference */}
                    <div className="space-y-3">
                      <Label>Meddelanden via</Label>
                      <RadioGroup
                        value={heir.notificationPreference || 'both'}
                        onValueChange={(value) => handleContactInfoChange(heir.personalNumber, 'notificationPreference', value)}
                        disabled={heir.documentSent}
                        className="flex flex-row gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id={`email-only-${heir.personalNumber}`} />
                          <Label htmlFor={`email-only-${heir.personalNumber}`} className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            Endast e-post
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sms" id={`sms-only-${heir.personalNumber}`} />
                          <Label htmlFor={`sms-only-${heir.personalNumber}`} className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Endast SMS
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id={`both-${heir.personalNumber}`} />
                          <Label htmlFor={`both-${heir.personalNumber}`} className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <MessageSquare className="w-4 h-4" />
                            Båda
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email field - only required if preference includes email */}
                      {(heir.notificationPreference === 'email' || heir.notificationPreference === 'both' || !heir.notificationPreference) && (
                        <div className="space-y-2">
                          <Label htmlFor={`email-${heir.personalNumber}`}>E-postadress</Label>
                          <Input
                            id={`email-${heir.personalNumber}`}
                            type="email"
                            value={heir.email || ''}
                            onChange={(e) => handleContactInfoChange(heir.personalNumber, 'email', e.target.value)}
                            placeholder="namn@exempel.se"
                            disabled={heir.documentSent}
                          />
                          {heir.email && !validateEmail(heir.email) && (
                            <p className="text-sm text-destructive">Ange en giltig e-postadress</p>
                          )}
                        </div>
                      )}
                      
                      {/* Phone field - only required if preference includes SMS */}
                      {(heir.notificationPreference === 'sms' || heir.notificationPreference === 'both' || !heir.notificationPreference) && (
                        <div className="space-y-2">
                          <Label htmlFor={`phone-${heir.personalNumber}`}>{t('step4.phone')}</Label>
                          <Input
                            id={`phone-${heir.personalNumber}`}
                            type="tel"
                            value={heir.phone || ''}
                            onChange={(e) => handleContactInfoChange(heir.personalNumber, 'phone', formatPhoneNumber(e.target.value))}
                            placeholder="070-123 45 67"
                            disabled={heir.documentSent}
                          />
                          {heir.phone && !validatePhone(heir.phone) && (
                            <p className="text-sm text-destructive">Ange ett giltigt telefonnummer (minst 10 siffror)</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {heir.documentSent && heir.sentAt && (
                    <div className="text-sm text-muted-foreground">
                      Skickat: {new Date(heir.sentAt).toLocaleString('sv-SE')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {heirs.some(h => h.documentSent) && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Dokument har skickats till arvingarna. De kommer att få ett e-postmeddelande 
                med instruktioner för digital signering.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              {t('button.back')}
            </Button>
            
            <div className="flex gap-3">
              {!heirs.every(h => h.documentSent) ? (
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
                  {t('step4.continue_signing')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};