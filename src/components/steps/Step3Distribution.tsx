import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, AlertTriangle, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestamentUpload } from "@/components/TestamentUpload";
import { PhysicalAssets, PhysicalAsset } from "@/components/PhysicalAssets";
import { AssetPreferences } from "@/components/AssetPreferences";
import { SpecificAssetAllocation } from "@/components/SpecificAssetAllocation";
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

interface Asset {
  id: string;
  bank: string;
  accountType: string;
  assetType: string;
  accountNumber: string;
  amount: number;
  toRemain?: boolean;
  amountToRemain?: number;
  reasonToRemain?: string;
}

interface AssetAllocation {
  assetId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  percentage?: number; // Percentage of the asset
  amount?: number;
}

interface Step3Props {
  beneficiaries: Beneficiary[];
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  totalAmount: number;
  assets?: Asset[];
  personalNumber?: string;
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
  t: (key: string) => string;
}

export const Step3Distribution = ({ 
  beneficiaries, 
  setBeneficiaries, 
  totalAmount,
  assets = [],
  personalNumber = "",
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
  savedProgress,
  t
}: Step3Props) => {
  const { toast } = useToast();
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: "",
    personalNumber: "",
    relationship: "",
    percentage: "",
    accountNumber: "",
    useSpecificAssets: false
  });

  const [selectedAssets, setSelectedAssets] = useState<{[assetId: string]: {selected: boolean, percentage: number}}>({});
  const [assetAllocations, setAssetAllocations] = useState<AssetAllocation[]>([]);

  const relationships = [
    "Make/Maka", "Barn", "Barnbarn", "Förälder", "Syskon", "Annan släkting", "Övrig"
  ];

  // Filter out debts and locked accounts
  const getAvailableAssets = () => {
    return assets.filter(asset => {
      // Exclude debt accounts
      const isDebt = ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(asset.assetType);
      if (isDebt) return false;
      
      // Exclude locked accounts
      if (asset.toRemain) return false;
      
      return true;
    });
  };

  const handleAssetSelection = (assetId: string, selected: boolean, percentage: number = 100) => {
    setSelectedAssets(prev => ({
      ...prev,
      [assetId]: { selected, percentage: Math.max(0, Math.min(100, percentage)) }
    }));
  };

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

    // If specific assets were selected, add them to allocations
    if (newBeneficiary.useSpecificAssets) {
      const newAllocations = Object.entries(selectedAssets)
        .filter(([_, selection]) => selection.selected)
        .map(([assetId, selection]) => ({
          assetId,
          beneficiaryId: beneficiary.id,
          beneficiaryName: beneficiary.name,
          percentage: selection.percentage
        }));
      
      setAssetAllocations(prev => [...prev, ...newAllocations]);
    }

    // Reset form
    setNewBeneficiary({
      name: "",
      personalNumber: "",
      relationship: "",
      percentage: "",
      accountNumber: "",
      useSpecificAssets: false
    });
    setSelectedAssets({});
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
      // Prepare comprehensive data for PDF generation
      const pdfData = {
        personalNumber: personalNumber,
        assets: assets.map(asset => ({
          ...asset,
          allocation: assetAllocations.find(a => a.assetId === asset.id)
        })),
        beneficiaries: beneficiaries.map(b => ({
          name: b.name,
          personalNumber: b.personalNumber,
          relationship: b.relationship,
          percentage: b.percentage,
          amount: (b.percentage / 100) * totalAmount,
          accountNumber: b.accountNumber,
          assetPreferences: b.assetPreferences,
          assetNotApplicable: b.assetNotApplicable
        })),
        totalAmount,
        testament: testament,
        physicalAssets: physicalAssets,
        assetAllocations: assetAllocations
      };

      const pdfBlob = await PDFService.generateDistributionPDF(pdfData, {
        includeSummary: true,
        includeAssets: true,
        includeBeneficiaries: true,
        includeTestament: !!testament,
        format: 'detailed'
      });

      if (pdfBlob) {
        const filename = PDFService.generateFilename(personalNumber || 'unknown');
        PDFService.downloadPDF(pdfBlob, filename);

        toast({
          title: "PDF genererad",
          description: "Komplett arvsskifte har laddats ner som PDF.",
        });
      } else {
        throw new Error("PDF generation failed");
      }

      // Call the original save function
      onSave();
    } catch (error) {
      console.error('PDF generation error:', error);
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
          <CardTitle className="text-2xl">{t('step3.title')}</CardTitle>
          <CardDescription>
            {t('step3.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('step3.total_amount')}:</span>
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
            <h3 className="text-lg font-semibold">{t('step3.add_beneficiary')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('step3.name')}</Label>
                <Input
                  id="name"
                  value={newBeneficiary.name}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                  placeholder={t('step3.first_last_name')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personalNumber">{t('step3.personal_number')}</Label>
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
                <Label htmlFor="relationship">{t('step3.relationship')}</Label>
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
                <Label htmlFor="accountNumber">{t('step3.account_number')}</Label>
                <Input
                  id="accountNumber"
                  value={newBeneficiary.accountNumber}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, accountNumber: e.target.value })}
                  placeholder="XXXX XX XXXXX X"
                />
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useSpecificAssets"
                    checked={newBeneficiary.useSpecificAssets}
                    onCheckedChange={(checked) => 
                      setNewBeneficiary({ ...newBeneficiary, useSpecificAssets: !!checked })
                    }
                  />
                  <Label htmlFor="useSpecificAssets" className="text-sm font-medium">
                    Tilldela specifika konton/tillgångar till denna arvinge
                  </Label>
                </div>
                
                {newBeneficiary.useSpecificAssets && getAvailableAssets().length > 0 && (
                  <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium">Välj konton/tillgångar</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Välj specifika konton som denna arvinge ska få. Du kan ange 0-100% för exklusiv tilldelning.
                    </p>
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                      {getAvailableAssets().map((asset) => {
                        const selection = selectedAssets[asset.id] || { selected: false, percentage: 100 };
                        return (
                          <div key={asset.id} className="p-3 bg-background rounded-md border space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Checkbox
                                    checked={selection.selected}
                                    onCheckedChange={(checked) => 
                                      handleAssetSelection(asset.id, !!checked, selection.percentage)
                                    }
                                  />
                                  <div>
                                    <div className="text-sm font-medium">
                                      {asset.bank} - {asset.accountType}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {asset.accountNumber} • {asset.assetType}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-primary ml-6">
                                  {asset.amount.toLocaleString('sv-SE')} SEK
                                </div>
                              </div>
                            </div>
                            
                            {selection.selected && (
                              <div className="ml-6 flex items-center gap-2">
                                <Label className="text-xs">Andel:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={selection.percentage}
                                  onChange={(e) => 
                                    handleAssetSelection(asset.id, true, parseInt(e.target.value) || 0)
                                  }
                                  className="w-16 h-7 text-xs"
                                />
                                <span className="text-xs">%</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  ≈ {((selection.percentage / 100) * asset.amount).toLocaleString('sv-SE')} SEK
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {Object.values(selectedAssets).some(s => s.selected) && (
                      <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                        <div className="text-sm font-medium text-primary">
                          Valda tillgångar: {Object.values(selectedAssets).filter(s => s.selected).length}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Dessa kommer att tilldelas specifikt till denna arvinge utöver den procentuella fördelningen.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <Button onClick={handleAddBeneficiary} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('step3.add_beneficiary')}
            </Button>
          </div>

          {beneficiaries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('step3.registered_heirs')}</h3>
              
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

          {/* Specific Asset Allocation Section */}
          <SpecificAssetAllocation
            assets={assets}
            beneficiaries={beneficiaries.map(b => ({ id: b.id, name: b.name }))}
            allocations={assetAllocations}
            setAllocations={setAssetAllocations}
          />

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
              <p className="text-sm font-medium text-success">Framsteg sparade</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              {t('button.back')}
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