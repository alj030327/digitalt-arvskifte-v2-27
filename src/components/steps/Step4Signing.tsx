import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Building2, Lock, Mail, Briefcase, CheckCircle2, Send, UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  bank: string;
  accountType: string;
  assetType: string;
  accountNumber: string;
  amount: number;
  toRemain?: boolean;
  reasonToRemain?: string;
}

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

interface Beneficiary {
  id: string;
  name: string;
  personalNumber: string;
  relationship: string;
  percentage: number;
  accountNumber: string;
  email?: string;
  phone?: string;
  signed?: boolean;
  signedAt?: string;
}

interface Testament {
  id: string;
  filename: string;
  uploadDate: string;
  verified: boolean;
}

interface PowerOfAttorney {
  id: string;
  deceasedPersonalNumber: string;
  representativePersonalNumber: string;
  representativeName: string;
  grantedBy: string;
  grantedAt: string;
  status: 'pending' | 'approved' | 'active';
  approvals: {
    heirPersonalNumber: string;
    heirName: string;
    approved: boolean;
    approvedAt?: string;
  }[];
}

interface Step6Props {
  personalNumber: string;
  heirs: Heir[];
  assets: Asset[];
  beneficiaries: Beneficiary[];
  testament: Testament | null;
  onBack: () => void;
  onComplete: () => void;
}

export const Step4Signing = ({ 
  personalNumber,
  heirs,
  assets,
  beneficiaries, 
  testament,
  onBack,
  onComplete
}: Step6Props) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load power of attorneys for this deceased person
  const powerOfAttorneys: PowerOfAttorney[] = JSON.parse(
    localStorage.getItem(`powerOfAttorneys_${personalNumber.replace('-', '')}`) || '[]'
  );

  const activePowerOfAttorneys = powerOfAttorneys.filter(poa => 
    poa.approvals.every(approval => approval.approved)
  );

  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const distributedAmount = assets.reduce((sum, asset) => sum + (asset.toRemain ? 0 : asset.amount), 0);
  const remainingAssets = assets.filter(asset => asset.toRemain);

  // Mock bank contact information (in production this would come from PSD2/Open Banking)
  const bankContacts = [
    { name: "Swedbank", email: "estates@swedbank.se", groupEmail: "arv.groupprevlada@swedbank.se" },
    { name: "Handelsbanken", email: "arvsskifte@handelsbanken.se", groupEmail: "estates.department@handelsbanken.se" },
    { name: "SEB", email: "inheritance@seb.se", groupEmail: "estate.services@seb.se" },
    { name: "Nordea", email: "arvs@nordea.se", groupEmail: "inheritance.group@nordea.se" },
    { name: "Danske Bank", email: "estate@danskebank.se", groupEmail: "arv.avdelning@danskebank.se" }
  ];

  const relevantBanks = bankContacts.filter(bank => 
    assets.some(asset => asset.bank.toLowerCase().includes(bank.name.toLowerCase()))
  );

  const handleSubmitInheritance = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate sending inheritance settlement to banks
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Arvsskifte skickat",
        description: `Arvsskiftet har skickats till ${relevantBanks.length} banker för genomförande.`,
      });
      
      // Complete the process
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skicka arvsskiftet. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sammanfattning av arvsskifte</CardTitle>
          <CardDescription>
            Granska all information innan arvsskiftet skickas till bankerna
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Deceased Person Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Avliden person
            </h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="font-medium">Personnummer: {personalNumber}</div>
            </div>
          </div>

          {/* Power of Attorney */}
          {activePowerOfAttorneys.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Aktiva fullmakter
              </h3>
              <div className="space-y-2">
                {activePowerOfAttorneys.map(poa => (
                  <div key={poa.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{poa.representativeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {poa.representativePersonalNumber}
                        </div>
                      </div>
                      <Badge variant="default">Aktiv fullmakt</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testament */}
          {testament && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Testamente
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{testament.filename}</span>
                  <Badge variant="default">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Inscannat
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Uppladdad: {testament.uploadDate}
                </div>
              </div>
            </div>
          )}

          {/* Heirs from Skatteverket */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Dödsbodelägare (från Skatteverket)
            </h3>
            <div className="space-y-2">
              {heirs.map(heir => (
                <div key={heir.personalNumber} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{heir.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {heir.personalNumber} • {heir.relationship}
                      </div>
                      {heir.email && (
                        <div className="text-sm text-muted-foreground">
                          E-post: {heir.email}
                        </div>
                      )}
                      {heir.phone && (
                        <div className="text-sm text-muted-foreground">
                          Telefon: {heir.phone}
                        </div>
                      )}
                      {heir.notificationPreference && (
                        <div className="text-sm text-muted-foreground">
                          Meddelanden via: {heir.notificationPreference === 'both' ? 'E-post & SMS' : heir.notificationPreference === 'email' ? 'E-post' : 'SMS'}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{heir.inheritanceShare || 0}%</div>
                      <div className="flex items-center gap-2 mt-1">
                        {heir.documentSent ? (
                          <Badge variant="default" className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Dokument skickat
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Väntar på kontaktinfo
                          </Badge>
                        )}
                      </div>
                      {heir.sentAt && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Skickat: {new Date(heir.sentAt).toLocaleString('sv-SE')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* E-signatures Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              E-signeringar
            </h3>
            <div className="space-y-2">
              {heirs.map(heir => (
                <div key={`signature-${heir.personalNumber}`} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{heir.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {heir.personalNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {heir.signed ? (
                        <>
                          <Badge variant="default" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Signerat
                          </Badge>
                          {heir.signedAt && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(heir.signedAt).toLocaleString('sv-SE')}
                            </div>
                          )}
                        </>
                      ) : heir.documentSent ? (
                        <Badge variant="outline" className="border-warning text-warning">
                          <Clock className="w-3 h-3 mr-1" />
                          Väntar på signering
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                          <XCircle className="w-3 h-3 mr-1" />
                          Ej skickat
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Fördelning mellan arvingar
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Total summa att fördela:</span>
                  <span className="text-xl font-bold text-primary">
                    {distributedAmount.toLocaleString('sv-SE')} SEK
                  </span>
                </div>
                <div className="space-y-2">
                  {beneficiaries.map(beneficiary => (
                    <div key={beneficiary.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                      <div>
                        <div className="font-medium">{beneficiary.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {beneficiary.personalNumber} • {beneficiary.relationship}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Konto: {beneficiary.accountNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{beneficiary.percentage}%</div>
                        <div className="text-sm text-muted-foreground">
                          {((beneficiary.percentage / 100) * distributedAmount).toLocaleString('sv-SE')} SEK
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Remaining Assets */}
          {remainingAssets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Konton som förblir låsta
              </h3>
              <div className="space-y-2">
                {remainingAssets.map(asset => (
                  <div key={asset.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{asset.bank}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.accountType} • {asset.accountNumber}
                        </div>
                        {asset.reasonToRemain && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Anledning: {asset.reasonToRemain}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{asset.amount.toLocaleString('sv-SE')} SEK</div>
                        <Badge variant="secondary">
                          <Lock className="w-3 h-3 mr-1" />
                          Förblir låst
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Contact Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Banker som kommer att kontaktas
            </h3>
            <div className="space-y-2">
              {relevantBanks.map(bank => (
                <div key={bank.name} className="p-4 bg-muted/30 rounded-lg">
                  <div className="font-medium">{bank.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-3 h-3" />
                      Arvsskifte: {bank.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      Gruppbrevlåda: {bank.groupEmail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Alla arvingar har signerat dokumentet. När du klickar "Skicka in arvsskifte" 
              kommer all information att skickas till de relevanta bankerna via PSD2 och Open Banking.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              Tillbaka
            </Button>
            
            <Button 
              onClick={handleSubmitInheritance}
              disabled={isSubmitting}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Skickar arvsskifte...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Skicka in arvsskifte
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};