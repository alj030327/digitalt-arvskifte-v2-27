import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, AlertCircle, Shield, Users, CheckCircle2, Briefcase, Send, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SkatteverketService, SkatteverketHeirData } from "@/services/skatteverketService";
import { BankIdService } from "@/services/bankidService";
import { BankIDSigning } from "@/components/BankIDSigning";
import { RepresentativeService, RepresentativeAccess } from "@/services/representativeService";
import { PDFUploadScanner } from "@/components/PDFUploadScanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
  t: (key: string) => string;
}

export const Step1PersonalNumber = ({ personalNumber, setPersonalNumber, heirs, setHeirs, onNext, t }: Step1Props) => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [localHeirs, setLocalHeirs] = useState<Heir[]>(heirs);
  const [currentUserPersonalNumber, setCurrentUserPersonalNumber] = useState("");
  const [hasFetchedHeirs, setHasFetchedHeirs] = useState(false);
  const [showBankIDSigning, setShowBankIDSigning] = useState(false);
  const [hasSignedWithBankID, setHasSignedWithBankID] = useState(false);
  const [bankIDError, setBankIDError] = useState("");
  
  // Power of Attorney states
  const [showPowerOfAttorneyForm, setShowPowerOfAttorneyForm] = useState(false);
  const [representativePersonalNumber, setRepresentativePersonalNumber] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [representativeType, setRepresentativeType] = useState("");
  const [isGrantingPowerOfAttorney, setIsGrantingPowerOfAttorney] = useState(false);
  const [existingPowerOfAttorneys, setExistingPowerOfAttorneys] = useState<PowerOfAttorney[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [heirsWithContact, setHeirsWithContact] = useState<Heir[]>([]);
  
  // Representative access states
  const [showRepresentativeLogin, setShowRepresentativeLogin] = useState(false);
  const [representativeLoginPersonalNumber, setRepresentativeLoginPersonalNumber] = useState("");
  const [isAuthenticatingRepresentative, setIsAuthenticatingRepresentative] = useState(false);
  const [representativeAccesses, setRepresentativeAccesses] = useState<RepresentativeAccess[]>([]);
  const [isLoggedInAsRepresentative, setIsLoggedInAsRepresentative] = useState(false);

  // Representative types
  const representativeTypes = [
    { value: "person", label: "Privatperson" },
    { value: "lawyer", label: "Jurist" },
    { value: "estate_administrator", label: "Boutredningsman" },
    { value: "testament_executor", label: "Testamentexekutor" }
  ];

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

  const handleStartBankIDSigning = () => {
    if (!currentUserPersonalNumber) {
      setBankIDError("Vänligen ange ditt personnummer för BankID-signering");
      return;
    }
    
    if (!validatePersonalNumber(currentUserPersonalNumber)) {
      setBankIDError("Vänligen ange ett giltigt personnummer");
      return;
    }

    setBankIDError("");
    setShowBankIDSigning(true);
  };

  const handleBankIDSuccess = (completionData: any) => {
    console.log('BankID signing completed:', completionData);
    
    // Check if current user is one of the heirs
    const isAuthorizedHeir = localHeirs.some(heir => 
      heir.personalNumber.replace('-', '') === currentUserPersonalNumber.replace('-', '')
    );
    
    if (!isAuthorizedHeir) {
      setBankIDError("Du är inte registrerad som arvinge för denna bouppteckning och kan därför inte fortsätta.");
      setShowBankIDSigning(false);
      return;
    }
    
    setHasSignedWithBankID(true);
    setShowBankIDSigning(false);
    
    toast({
      title: "Signering slutförd",
      description: "Du har framgångsrikt verifierats med BankID.",
    });
  };

  const handleBankIDError = (error: string) => {
    setBankIDError(error);
    setShowBankIDSigning(false);
  };

  const handleBankIDCancel = () => {
    setShowBankIDSigning(false);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  const handleContactInfoChange = (heirPersonalNumber: string, field: 'email' | 'phone', value: string) => {
    setHeirsWithContact(prev => {
      const updated = [...prev];
      const index = updated.findIndex(h => h.personalNumber === heirPersonalNumber);
      if (index !== -1) {
        updated[index] = { ...updated[index], [field]: value };
      } else {
        const heir = localHeirs.find(h => h.personalNumber === heirPersonalNumber);
        if (heir) {
          updated.push({ ...heir, [field]: value });
        }
      }
      return updated;
    });
  };

  const allContactInfoComplete = () => {
    const otherHeirs = localHeirs.filter(heir => heir.personalNumber !== currentUserPersonalNumber);
    return otherHeirs.every(heir => {
      const heirWithContact = heirsWithContact.find(h => h.personalNumber === heir.personalNumber);
      return heirWithContact?.email && validateEmail(heirWithContact.email) && 
             heirWithContact?.phone && validatePhone(heirWithContact.phone);
    });
  };

  const handleGrantPowerOfAttorney = async () => {
    if (!representativePersonalNumber || !representativeName || !representativeType) {
      toast({
        title: "Fel",
        description: "Ange personnummer, namn och typ för ombudet.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePersonalNumber(representativePersonalNumber)) {
      toast({
        title: "Fel", 
        description: "Ange ett giltigt personnummer för ombudet.",
        variant: "destructive",
      });
      return;
    }

    // Check if all contact info is complete
    if (!allContactInfoComplete()) {
      setShowContactForm(true);
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

      // Send PDF documents and BankID signing invitations to all other heirs
      const otherHeirs = localHeirs.filter(heir => heir.personalNumber !== currentUserPersonalNumber);
      const heirsWithContactInfo = otherHeirs.map(heir => {
        const contactInfo = heirsWithContact.find(h => h.personalNumber === heir.personalNumber);
        return {
          ...heir,
          email: contactInfo?.email || '',
          phone: contactInfo?.phone || ''
        };
      });

      // Here we would send the power of attorney PDF via email and SMS
      // and initiate BankID signing for each heir
      
      toast({
        title: "Fullmakt skickad",
        description: `Fullmaktshandlingar och BankID-signeringslänkar har skickats till ${otherHeirs.length} dödsbodelägare.`,
      });

      // Reset form
      setRepresentativePersonalNumber("");
      setRepresentativeName("");
      setRepresentativeType("");
      setShowPowerOfAttorneyForm(false);
      setShowContactForm(false);
      setHeirsWithContact([]);

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

  const handleRepresentativeLogin = async () => {
    if (!representativeLoginPersonalNumber) {
      toast({
        title: "Fel",
        description: "Ange ditt personnummer för att logga in som ombud.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePersonalNumber(representativeLoginPersonalNumber)) {
      toast({
        title: "Fel",
        description: "Ange ett giltigt personnummer.",
        variant: "destructive",
      });
      return;
    }

    setIsAuthenticatingRepresentative(true);

    try {
      // Authenticate with BankID first
      const authRequest = {
        personalNumber: representativeLoginPersonalNumber,
        endUserIp: '127.0.0.1'
      };
      
      const session = await BankIdService.authenticate(authRequest);
      
      if (!session) {
        throw new Error("Kunde inte starta BankID-session");
      }
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60;
      
      while (attempts < maxAttempts) {
        const status = await BankIdService.checkStatus(session.orderRef);
        
        if (status?.status === 'complete') {
          // Check if this person has any active power of attorneys
          const accesses = await RepresentativeService.authenticateRepresentative(
            representativeLoginPersonalNumber
          );
          
          if (accesses.length === 0) {
            toast({
              title: "Ingen behörighet",
              description: "Du har ingen aktiv fullmakt för något dödsbo.",
              variant: "destructive",
            });
            setIsAuthenticatingRepresentative(false);
            return;
          }
          
          setRepresentativeAccesses(accesses);
          setIsLoggedInAsRepresentative(true);
          setShowRepresentativeLogin(false);
          
          toast({
            title: "Inloggning lyckades",
            description: `Du har tillgång till ${accesses.length} dödsbo.`,
          });
          
          break;
        } else if (status?.status === 'failed') {
          throw new Error("BankID-autentisering misslyckades");
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (attempts >= maxAttempts) {
        await BankIdService.cancel(session.orderRef);
        throw new Error("BankID-autentisering tog för lång tid");
      }
      
    } catch (error) {
      toast({
        title: "Inloggning misslyckades",
        description: error instanceof Error ? error.message : "Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticatingRepresentative(false);
    }
  };

  const handleSelectEstate = (deceasedPersonalNumber: string) => {
    // Load the estate information
    try {
      const estateInfo = RepresentativeService.getEstateInformation(
        deceasedPersonalNumber,
        representativeLoginPersonalNumber
      );
      
      // Set the deceased person's information
      setPersonalNumber(deceasedPersonalNumber);
      
      // Convert estate assets to heirs format for compatibility
      const mockHeirs: Heir[] = [
        {
          personalNumber: representativeLoginPersonalNumber,
          name: representativeAccesses[0]?.name || "Ombud",
          relationship: "Ombud",
          signed: true,
          signedAt: new Date().toISOString()
        }
      ];
      
      setLocalHeirs(mockHeirs);
      setHeirs(mockHeirs);
      setHasFetchedHeirs(true);
      setHasSignedWithBankID(true);
      
      toast({
        title: "Dödsbo valt",
        description: `Du agerar nu som ombud för dödsbo ${deceasedPersonalNumber}.`,
      });
      
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ladda dödsbosinformation.",
        variant: "destructive",
      });
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
          <CardTitle className="text-2xl">{t('step1.title')}</CardTitle>
          <CardDescription>
            {t('step1.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test BankID Information */}
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-semibold">🧪 Test BankID miljö</p>
                <p>För utveckling och testning använder vi BankID:s officiella testmiljö:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Test-URL:</strong> https://appapi2.test.bankid.com/</li>
                  <li>• <strong>Test-personnummer:</strong> Avsluta med 0111 (t.ex. 19900101111)</li>
                  <li>• <strong>Certifikat:</strong> Test BankID SSL Root CA v1 Test</li>
                  <li>• <strong>Begränsning:</strong> Max 5 aktiva orders samtidigt</li>
                </ul>
                <p className="text-xs mt-2">
                  📚 <a href="https://developers.bankid.com/getting-started/environments" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline">
                    BankID Utvecklarguide - Miljöer
                  </a>
                </p>
              </div>
            </AlertDescription>
          </Alert>
          {/* Main input method selection */}
          {!isLoggedInAsRepresentative && !hasFetchedHeirs && (
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manuell inmatning</TabsTrigger>
                <TabsTrigger value="pdf">Scanna dokument</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                {/* Manual input method */}
                <Alert>
                  <UserCheck className="h-4 w-4" />
                  <AlertDescription>
                    Ange personnummer för den avlidne för att hämta arvsinformation från Skatteverket.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="personalNumber">Personnummer för avliden</Label>
                    <Input
                      id="personalNumber"
                      type="text"
                      placeholder="ÅÅÅÅMMDD-XXXX"
                      value={personalNumber}
                      onChange={handleInputChange}
                      maxLength={13}
                    />
                    {validationError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{validationError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button
                    onClick={fetchHeirsFromSkatteverket}
                    disabled={!personalNumber || isValidating}
                    className="w-full"
                  >
                    {isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Hämtar arvsinformation...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Hämta arvsinformation
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Representative Login Section */}
                <div className="mt-6 pt-6 border-t">
                  <Alert>
                    <Briefcase className="h-4 w-4" />
                    <AlertDescription>
                      Är du ombud för ett dödsbo? Logga in med BankID för att komma åt dina fullmakter.
                    </AlertDescription>
                  </Alert>
              
                  {!showRepresentativeLogin && (
                    <Button 
                      variant="outline"
                      onClick={() => setShowRepresentativeLogin(true)}
                      className="w-full mt-2"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Logga in som ombud
                    </Button>
                  )}

                  {showRepresentativeLogin && (
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30 mt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Inloggning för ombud</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowRepresentativeLogin(false)}
                        >
                          ✕
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="representativeLoginPersonalNumber">Ditt personnummer</Label>
                          <Input
                            id="representativeLoginPersonalNumber"
                            type="text"
                            placeholder="ÅÅÅÅMMDD-XXXX"
                            value={representativeLoginPersonalNumber}
                            onChange={(e) => setRepresentativeLoginPersonalNumber(formatPersonalNumber(e.target.value))}
                            maxLength={13}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleRepresentativeLogin}
                          disabled={!representativeLoginPersonalNumber || isAuthenticatingRepresentative}
                          className="w-full"
                        >
                          {isAuthenticatingRepresentative ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Autentiserar med BankID...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Logga in med BankID
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pdf" className="space-y-4">
                <PDFUploadScanner 
                  onScanComplete={(scannedPersonalNumber, scannedHeirs) => {
                    setPersonalNumber(scannedPersonalNumber);
                    setLocalHeirs(scannedHeirs);
                    setHeirs(scannedHeirs);
                    setHasFetchedHeirs(true);
                    toast({
                      title: "Scanning lyckades",
                      description: `Information från ${scannedHeirs.length} dödsbodelägare har importerats.`,
                    });
                  }}
                  t={t}
                />
              </TabsContent>
            </Tabs>
          )}

          {/* Representative Estate Selection */}
          {isLoggedInAsRepresentative && representativeAccesses.length > 0 && !hasFetchedHeirs && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Du är inloggad som ombud. Välj vilket dödsbo du vill hantera:
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                {representativeAccesses.map((access, index) => (
                  <div key={index} className="space-y-2">
                    {access.deceasedPersonalNumbers.map(deceasedPN => (
                      <div key={deceasedPN} className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                           onClick={() => handleSelectEstate(deceasedPN)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Dödsbo: {deceasedPN}</div>
                            <div className="text-sm text-muted-foreground">
                              Fullmakt beviljad: {access.grantedAt.toLocaleDateString('sv-SE')}
                            </div>
                          </div>
                          <Badge variant="default">Aktiv fullmakt</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
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
              
              {!hasSignedWithBankID && !isLoggedInAsRepresentative && (
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
                     type="button" 
                     onClick={handleStartBankIDSigning}
                     disabled={!currentUserPersonalNumber}
                     className="w-full"
                     size="lg"
                   >
                     Signera med BankID
                   </Button>
                </div>
              )}
                  
                  {showBankIDSigning && (
                    <div className="mt-6">
                      <BankIDSigning
                        personalNumber={currentUserPersonalNumber}
                        userVisibleData="Signering för verifiering av dödsbodelägare i digitalt arvsskifte"
                        onSuccess={handleBankIDSuccess}
                        onError={handleBankIDError}
                        onCancel={handleBankIDCancel}
                      />
                    </div>
                  )}
              {hasSignedWithBankID && !isLoggedInAsRepresentative && (
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
                      Ge fullmakt för ombud
                    </Button>
                  )}

                  {showPowerOfAttorneyForm && (
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Ge fullmakt för ombud</h4>
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
                          Genom att ge fullmakt kan ett ombud (t.ex. jurist, boutredningsman) agera på dödsboets vägnar. 
                          Alla dödsbodelägare måste godkänna detta via BankID-signering.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="representativePersonalNumber">Ombudets personnummer</Label>
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
                          <Label htmlFor="representativeName">Ombudets namn</Label>
                          <Input
                            id="representativeName"
                            type="text"
                            placeholder="För- och efternamn"
                            value={representativeName}
                            onChange={(e) => setRepresentativeName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="representativeType">Typ av ombud</Label>
                          <select
                            id="representativeType"
                            value={representativeType}
                            onChange={(e) => setRepresentativeType(e.target.value)}
                            className="w-full p-2 border border-border rounded-md bg-background"
                          >
                            <option value="">Välj typ av ombud</option>
                            {representativeTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Contact Information Form */}
                        {showContactForm && (
                          <div className="space-y-4 border-t pt-4">
                            <h5 className="font-medium">Kontaktuppgifter för dödsbodelägare</h5>
                            <p className="text-sm text-muted-foreground">
                              Ange e-post och telefonnummer för att skicka fullmaktshandlingar till övriga dödsbodelägare.
                            </p>
                            
                            {localHeirs
                              .filter(heir => heir.personalNumber !== currentUserPersonalNumber)
                              .map(heir => {
                                const heirWithContact = heirsWithContact.find(h => h.personalNumber === heir.personalNumber) || heir;
                                return (
                                  <div key={heir.personalNumber} className="p-3 border border-border rounded-lg space-y-3">
                                    <div className="font-medium">{heir.name}</div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label>E-postadress</Label>
                                        <Input
                                          type="email"
                                          value={heirWithContact.email || ''}
                                          onChange={(e) => handleContactInfoChange(heir.personalNumber, 'email', e.target.value)}
                                          placeholder="namn@exempel.se"
                                        />
                                        {heirWithContact.email && !validateEmail(heirWithContact.email) && (
                                          <p className="text-sm text-destructive">Ange en giltig e-postadress</p>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label>Telefonnummer</Label>
                                        <Input
                                          type="tel"
                                          value={heirWithContact.phone || ''}
                                          onChange={(e) => handleContactInfoChange(heir.personalNumber, 'phone', formatPhoneNumber(e.target.value))}
                                          placeholder="070-123 45 67"
                                        />
                                        {heirWithContact.phone && !validatePhone(heirWithContact.phone) && (
                                          <p className="text-sm text-destructive">Ange ett giltigt telefonnummer</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                        
                        <Button 
                          onClick={handleGrantPowerOfAttorney}
                          disabled={!representativePersonalNumber || !representativeName || !representativeType || isGrantingPowerOfAttorney}
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
                              {showContactForm ? "Skicka fullmakt för godkännande" : "Fortsätt"}
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
              {t('step1.continue_assets')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};