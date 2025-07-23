import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestamentUpload } from "@/components/TestamentUpload";
import { PhysicalAssets, PhysicalAsset } from "@/components/PhysicalAssets";
import { AssetPreferences } from "@/components/AssetPreferences";
import { PDFService } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";

interface Beneficiary {
  id: string;
  name: string;
  personalNumber: string;
  relationship: string;
  percentage: number;
  accountNumber: string;
  assetPreferences?: {
    warrants: 'transfer' | 'sell';
    certificates: 'transfer' | 'sell';
    options: 'transfer' | 'sell';
    futures: 'transfer' | 'sell';
  };
  assetNotApplicable?: {
    warrants?: boolean;
    certificates?: boolean;
    options?: boolean;
    futures?: boolean;
  };
}

interface Testament {
  id: string;
  filename: string;
  uploadDate: string;
  verified: boolean;
}

interface Step3Props {
  beneficiaries: Beneficiary[];
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  totalAmount: number;
  testament: Testament | null;
  setTestament: (testament: Testament | null) => void;
  hasTestament: boolean;
  setHasTestament: (hasTestament: boolean) => void;
  physicalAssets: PhysicalAsset[];
  setPhysicalAssets: (assets: PhysicalAsset[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  onComplete: () => void;
  savedProgress: boolean;
}

export const Step3Distribution = ({ 
  beneficiaries, 
  setBeneficiaries, 
  totalAmount, 
  testament, 
  setTestament, 
  hasTestament, 
  setHasTestament, 
  physicalAssets,
  setPhysicalAssets,
  onNext, 
  onBack,
  onSave,
  onComplete,
  savedProgress
}: Step3Props) => {
  const { toast } = useToast();
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: "",
    personalNumber: "",
    relationship: "",
    percentage: "",
    accountNumber: ""
  });

  const relationships = [
    "Make/Maka", "Barn", "Barnbarn", "Förälder", "Syskon", "Annan släkting", "Övrig"
  ];

  const handleAddBeneficiary = () => {
    if (!newBeneficiary.name || !newBeneficiary.personalNumber || !newBeneficiary.relationship || 
        !newBeneficiary.percentage || !newBeneficiary.accountNumber) {
      return;
    }

    const beneficiary: Beneficiary = {
      id: Date.now().toString(),
      name: newBeneficiary.name,
      personalNumber: newBeneficiary.personalNumber,
      relationship: newBeneficiary.relationship,
      percentage: parseFloat(newBeneficiary.percentage),
      accountNumber: newBeneficiary.accountNumber
    };

    setBeneficiaries([...beneficiaries, beneficiary]);
    setNewBeneficiary({
      name: "",
      personalNumber: "",
      relationship: "",
      percentage: "",
      accountNumber: ""
    });
  };

  const handleRemoveBeneficiary = (id: string) => {
    setBeneficiaries(beneficiaries.filter(b => b.id !== id));
  };

  const handlePercentageChange = (id: string, percentage: number) => {
    setBeneficiaries(beneficiaries.map(b => 
      b.id === id ? { ...b, percentage } : b
    ));
  };

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  const isValidDistribution = totalPercentage === 100;

  const handleSaveWithPDF = async () => {
    try {
      // Generate and download PDF using static method
      await PDFService.generateDistributionPDF({
        personalNumber: "",
        assets: [],
        beneficiaries: beneficiaries.map(b => ({
          name: b.name,
          personalNumber: b.personalNumber,
          relationship: b.relationship,
          percentage: b.percentage,
          amount: (b.percentage / 100) * totalAmount,
          accountNumber: b.accountNumber
        })),
        totalAmount
      });

      toast({
        title: "PDF genererad",
        description: "Arvsskiftet har laddats ner som PDF.",
      });

      // Call the original save function
      onSave();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte generera PDF. Försök igen.",
        variant: "destructive",
      });
    }
  };

  const formatPersonalNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 8) {
      return cleaned;
    }
    return cleaned.slice(0, 8) + "-" + cleaned.slice(8, 12);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Fördelning mellan dödsbodelägare</CardTitle>
          <CardDescription>
            Ange hur tillgångarna ska fördelas mellan de olika dödsbodelägarna
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total att fördela:</span>
              <span className="text-xl font-bold text-primary">
                {totalAmount.toLocaleString('sv-SE')} SEK
              </span>
            </div>
          </div>

          {/* Testament Section */}
          <TestamentUpload
            testament={testament}
            setTestament={setTestament}
            hasTestament={hasTestament}
            setHasTestament={setHasTestament}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lägg till dödsbodelägare</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  value={newBeneficiary.name}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                  placeholder="För- och efternamn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personalNumber">Personnummer</Label>
                <Input
                  id="personalNumber"
                  value={newBeneficiary.personalNumber}
                  onChange={(e) => setNewBeneficiary({ 
                    ...newBeneficiary, 
                    personalNumber: formatPersonalNumber(e.target.value) 
                  })}
                  placeholder="ÅÅÅÅMMDD-XXXX"
                  maxLength={13}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relationship">Relation till avliden</Label>
                <select
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={newBeneficiary.relationship}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, relationship: e.target.value })}
                >
                  <option value="">Välj relation</option>
                  {relationships.map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="percentage">Andel (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={newBeneficiary.percentage}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, percentage: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="accountNumber">Kontonummer för utbetalning</Label>
                <Input
                  id="accountNumber"
                  value={newBeneficiary.accountNumber}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, accountNumber: e.target.value })}
                  placeholder="XXXX XX XXXXX X"
                />
              </div>
            </div>
            
            <Button onClick={handleAddBeneficiary} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Lägg till dödsbodelägare
            </Button>
          </div>

          {beneficiaries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Registrerade dödsbodelägare</h3>
              
              <div className="space-y-3">
                {beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{beneficiary.name}</span>
                          <Badge variant="secondary">{beneficiary.relationship}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Personnummer: {beneficiary.personalNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Kontonummer: {beneficiary.accountNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={beneficiary.percentage}
                              onChange={(e) => handlePercentageChange(beneficiary.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-center"
                            />
                            <span className="text-sm">%</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {((beneficiary.percentage / 100) * totalAmount).toLocaleString('sv-SE')} SEK
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBeneficiary(beneficiary.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total fördelning:</span>
                  <span className={`text-lg font-bold ${isValidDistribution ? 'text-success' : 'text-warning'}`}>
                    {totalPercentage}%
                  </span>
                </div>
              </div>
              
              {!isValidDistribution && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Den totala fördelningen måste vara exakt 100%. Nuvarande fördelning: {totalPercentage}%
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Physical Assets Section */}
          <PhysicalAssets
            physicalAssets={physicalAssets}
            setPhysicalAssets={setPhysicalAssets}
            beneficiaries={beneficiaries.map(b => ({ id: b.id, name: b.name }))}
          />

          {/* Asset Preferences Section */}
          <AssetPreferences
            beneficiaries={beneficiaries}
            setBeneficiaries={setBeneficiaries}
          />

          {savedProgress && (
            <div className="text-center p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm font-medium text-success">Framsteg sparat!</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              Tillbaka
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="secondary" 
                onClick={handleSaveWithPDF}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                Spara framsteg (Ladda ner PDF)
              </Button>
              <Button 
                onClick={onComplete}
                disabled={beneficiaries.length === 0 || !isValidDistribution || (hasTestament && (!testament || !testament.verified))}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                Färdigställ och signera
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};