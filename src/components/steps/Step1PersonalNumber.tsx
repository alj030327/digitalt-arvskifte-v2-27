import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, AlertCircle, Shield, Users, CheckCircle2, Briefcase, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SkatteverketService, SkatteverketHeirData } from "@/services/skatteverketService";
import { BankIdService } from "@/services/bankidService";
import { useToast } from "@/hooks/use-toast";

interface Heir {
  personalNumber: string;
  name: string;
  relationship: string;
  inheritanceShare?: number;
  signed?: boolean;
  signedAt?: string;
}

interface PowerOfAttorney {
  id: string;
  deceasedPersonalNumber: string;
  representativePersonalNumber: string;
  representativeName: string;
  grantedBy: string; // Personal number of the heir who granted it
  grantedAt: string;
  status: 'pending' | 'approved' | 'active';
  approvals: {
    heirPersonalNumber: string;
    heirName: string;
    approved: boolean;
    approvedAt?: string;
  }[];
}

interface Step1Props {
  personalNumber: string;
  setPersonalNumber: (value: string) => void;
  heirs: Heir[];
  setHeirs: (heirs: Heir[]) => void;
  onNext: () => void;
}

export const Step1PersonalNumber = ({ personalNumber, setPersonalNumber, heirs, setHeirs, onNext }: Step1Props) => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [localHeirs, setLocalHeirs] = useState<Heir[]>(heirs);
  const [currentUserPersonalNumber, setCurrentUserPersonalNumber] = useState("");
  const [hasFetchedHeirs, setHasFetchedHeirs] = useState(false);
  const [isSigningWithBankID, setIsSigningWithBankID] = useState(false);
  const [hasSignedWithBankID, setHasSignedWithBankID] = useState(false);
  const [bankIDError, setBankIDError] = useState("");
  
  // Power of Attorney states
  const [showPowerOfAttorneyForm, setShowPowerOfAttorneyForm] = useState(false);
  const [representativePersonalNumber, setRepresentativePersonalNumber] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [isGrantingPowerOfAttorney, setIsGrantingPowerOfAttorney] = useState(false);
  const [existingPowerOfAttorneys, setExistingPowerOfAttorneys] = useState<PowerOfAttorney[]>([]);

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

  
  // Load existing power of attorneys for this deceased person
  const loadExistingPowerOfAttorneys = () => {
    const stored = localStorage.getItem(`powerOfAttorneys_${personalNumber.replace('-', '')}`);
    if (stored) {
      setExistingPowerOfAttorneys(JSON.parse(stored));
    }
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
      
      if (response.success && response.heirs.length > 0) {
        // Convert SkatteverketHeirData to Heir format
        const convertedHeirs: Heir[] = response.heirs.map(heir => ({
          personalNumber: heir.personalNumber,
          name: heir.name,
          relationship: heir.relationship,
          inheritanceShare: heir.inheritanceShare * 100 // Convert to percentage
        }));
        
        setLocalHeirs(convertedHeirs);
        setHeirs(convertedHeirs);
        setHasFetchedHeirs(true);
        loadExistingPowerOfAttorneys(); // Load existing power of attorneys when heirs are loaded
      } else {
        setValidationError(response.error || "Inga arvingar hittades för det angivna personnumret.");
      }
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
      // Use BankIdService for authentication
      const authRequest = {
        personalNumber: currentUserPersonalNumber,
        endUserIp: '127.0.0.1' // In production, get real IP
      };
      
      const session = await BankIdService.authenticate(authRequest);
      
      if (!session) {
        setBankIDError("Kunde inte starta BankID-session. Försök igen.");
        setIsSigningWithBankID(false);
        return;
      }
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds with 500ms intervals
      
      while (attempts < maxAttempts) {
        const status = await BankIdService.checkStatus(session.orderRef);
        
        if (status?.status === 'complete') {
          // Check if current user is one of the heirs
          const isAuthorizedHeir = localHeirs.some(heir => 
            heir.personalNumber.replace('-', '') === currentUserPersonalNumber.replace('-', '')
          );
          
          if (!isAuthorizedHeir) {
            setBankIDError("Du är inte registrerad som arvinge för denna bouppteckning och kan därför inte fortsätta.");
            setIsSigningWithBankID(false);
            return;
          }
          
          setHasSignedWithBankID(true);
          break;
        } else if (status?.status === 'failed') {
          setBankIDError("BankID-signering misslyckades. Försök igen.");
          setIsSigningWithBankID(false);
          return;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (attempts >= maxAttempts) {
        setBankIDError("BankID-signering tog för lång tid. Försök igen.");
        await BankIdService.cancel(session.orderRef);
        setIsSigningWithBankID(false);
        return;
      }
    } catch (error) {
      setBankIDError("BankID-signering misslyckades. Försök igen.");
    } finally {
      setIsSigningWithBankID(false);
    }
  };

  const handleGrantPowerOfAttorney = async () => {
    if (!representativePersonalNumber || !representativeName) {
      toast({
        title: "Fel",
        description: "Ange personnummer och namn för företrädaren.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePersonalNumber(representativePersonalNumber)) {
      toast({
        title: "Fel", 
        description: "Ange ett giltigt personnummer för företrädaren.",
        variant: "destructive",
      });
      return;
    }

    setIsGrantingPowerOfAttorney(true);

    try {
      // Create power of attorney request
      const powerOfAttorney: PowerOfAttorney = {
        id: Date.now().toString(),
        deceasedPersonalNumber: personalNumber,
        representativePersonalNumber,
        representativeName,
        grantedBy: currentUserPersonalNumber,
        grantedAt: new Date().toISOString(),
        status: 'pending',
        approvals: localHeirs.map(heir => ({
          heirPersonalNumber: heir.personalNumber,
          heirName: heir.name,
          approved: heir.personalNumber === currentUserPersonalNumber, // Auto-approve for the grantor
          approvedAt: heir.personalNumber === currentUserPersonalNumber ? new Date().toISOString() : undefined
        }))
      };

      // Save to localStorage (in production, this would be a database)
      const key = `powerOfAttorneys_${personalNumber.replace('-', '')}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(powerOfAttorney);
      localStorage.setItem(key, JSON.stringify(existing));

      setExistingPowerOfAttorneys(existing);

      // Send BankID signing invitations to all other heirs (simulate)
      const otherHeirs = localHeirs.filter(heir => heir.personalNumber !== currentUserPersonalNumber);
      
      toast({
        title: "Fullmakt initierad",
        description: `E-signeringslänkar har skickats till ${otherHeirs.length} dödsbodelägare för godkännande.`,
      });

      // Reset form
      setRepresentativePersonalNumber("");
      setRepresentativeName("");
      setShowPowerOfAttorneyForm(false);

    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte initiera fullmakt. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsGrantingPowerOfAttorney(false);
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

          {hasFetchedHeirs && localHeirs.length > 0 && (
            <div className="space-y-4">
              {/* Existing Power of Attorneys */}
              {existingPowerOfAttorneys.length > 0 && (
                <div className="space-y-4">
                  <Alert>
                    <Briefcase className="h-4 w-4" />
                    <AlertDescription>
                      Befintliga fullmakter för detta dödsbo:
                    </AlertDescription>
                  </Alert>
                  
                  {existingPowerOfAttorneys.map((poa) => {
                    const approvedCount = poa.approvals.filter(a => a.approved).length;
                    const isActive = approvedCount === localHeirs.length;
                    
                    return (
                      <div key={poa.id} className="p-4 border border-border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{poa.representativeName}</div>
                            <div className="text-sm text-muted-foreground">
                              {poa.representativePersonalNumber}
                            </div>
                          </div>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "Aktiv fullmakt" : `${approvedCount}/${localHeirs.length} godkännanden`}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Beviljad av: {localHeirs.find(h => h.personalNumber === poa.grantedBy)?.name || poa.grantedBy}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Datum: {new Date(poa.grantedAt).toLocaleDateString('sv-SE')}
                        </div>
                        
                        {!isActive && (
                          <div className="mt-2 text-sm">
                            <div className="font-medium mb-1">Väntar på godkännande från:</div>
                            {poa.approvals.filter(a => !a.approved).map(approval => (
                              <div key={approval.heirPersonalNumber} className="text-muted-foreground">
                                • {approval.heirName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Följande dödsbodelägare hittades i bouppteckningen:
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                {localHeirs.map((heir, index) => (
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
                <div className="space-y-4 border-t pt-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      BankID-signering genomförd. Du är verifierad som dödsbodelägare.
                    </AlertDescription>
                  </Alert>

                  {/* Power of Attorney Section */}
                  {!showPowerOfAttorneyForm && (
                    <Button 
                      variant="outline"
                      onClick={() => setShowPowerOfAttorneyForm(true)}
                      className="w-full"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Ge fullmakt för företrädare
                    </Button>
                  )}

                  {showPowerOfAttorneyForm && (
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Ge fullmakt för företrädare</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowPowerOfAttorneyForm(false)}
                        >
                          ✕
                        </Button>
                      </div>
                      
                      <Alert>
                        <Briefcase className="h-4 w-4" />
                        <AlertDescription>
                          Genom att ge fullmakt kan en företrädare (t.ex. jurist) agera på dödsboets vägnar. 
                          Alla dödsbodelägare måste godkänna detta via BankID-signering.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="representativePersonalNumber">Företrädarens personnummer</Label>
                          <Input
                            id="representativePersonalNumber"
                            type="text"
                            placeholder="ÅÅÅÅMMDD-XXXX"
                            value={representativePersonalNumber}
                            onChange={(e) => setRepresentativePersonalNumber(formatPersonalNumber(e.target.value))}
                            maxLength={13}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="representativeName">Företrädarens namn</Label>
                          <Input
                            id="representativeName"
                            type="text"
                            placeholder="För- och efternamn"
                            value={representativeName}
                            onChange={(e) => setRepresentativeName(e.target.value)}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleGrantPowerOfAttorney}
                          disabled={!representativePersonalNumber || !representativeName || isGrantingPowerOfAttorney}
                          className="w-full"
                        >
                          {isGrantingPowerOfAttorney ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Skickar fullmakt...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Skicka fullmakt för godkännande
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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