import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Trash2, Upload, DollarSign, Lock, Unlock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface Step2Props {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Assets = ({ assets, setAssets, onNext, onBack }: Step2Props) => {
  const [newAsset, setNewAsset] = useState({
    bank: "",
    accountType: "",
    assetType: "",
    accountNumber: "",
    amount: "",
    toRemain: false,
    amountToRemain: "",
    reasonToRemain: ""
  });
  const [isAutoImporting, setIsAutoImporting] = useState(false);

  const banksWithDetails = {
    "Handelsbanken": {
      accountTypes: ["Sparkonto", "Transaktionskonto", "ISK", "Kapitalförsäkring", "Pensionskonto", "Företagskonto"],
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Obligationer", "Pension", "Försäkring"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Blancolån", "Billån"]
    },
    "SEB": {
      accountTypes: ["Sparkonto", "Lönekonot", "ISK", "Kapitalförsäkring", "Investeringssparkonto", "Pensionskonto"],
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Obligationer", "Pension", "Strukturerade produkter"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Företagslån", "Billån"]
    },
    "Swedbank": {
      accountTypes: ["Sparkonto", "Transaktionskonto", "ISK", "Robur fonder", "Pensionskonto", "Ungdomskonto"],
      assetTypes: ["Bankinsättning", "Aktier", "Robur fonder", "Obligationer", "Pension", "Försäkring"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Blancolån", "Företagslån"]
    },
    "Nordea": {
      accountTypes: ["Sparkonto", "Pluskonto", "ISK", "Kapitalförsäkring", "Pensionskonto", "Företagskonto"],
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Obligationer", "Pension", "Livförsäkring"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Blancolån", "Billån"]
    },
    "Danske Bank": {
      accountTypes: ["Sparkonto", "Lönekonto", "ISK", "Danske Invest", "Pensionskonto"],
      assetTypes: ["Bankinsättning", "Aktier", "Danske Invest fonder", "Obligationer", "Pension"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Företagslån"]
    },
    "Länsförsäkringar Bank": {
      accountTypes: ["Sparkonto", "Transaktionskonto", "ISK", "Försäkringssparande", "Pensionskonto"],
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Försäkringssparande", "Pension"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Blancolån"]
    },
    "ICA Banken": {
      accountTypes: ["Sparkonto", "Lönekonto", "ISK", "Buffert", "ICA Konto"],
      assetTypes: ["Bankinsättning", "Fonder", "ICA-poäng", "Sparkonto"],
      debtTypes: ["Privatlån", "Kreditkort", "Billån"]
    },
    "Sparbanken": {
      accountTypes: ["Sparkonto", "Transaktionskonto", "ISK", "Pensionskonto", "Ungdomskonto"],
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Pension"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort"]
    }
  };

  const commonBanks = Object.keys(banksWithDetails);

  const getAccountTypesForBank = (bank: string) => {
    return banksWithDetails[bank as keyof typeof banksWithDetails]?.accountTypes || [];
  };

  const getAssetTypesForBank = (bank: string) => {
    const bankData = banksWithDetails[bank as keyof typeof banksWithDetails];
    return bankData ? [...bankData.assetTypes, ...bankData.debtTypes] : [];
  };

  const handleAutoImport = async () => {
    setIsAutoImporting(true);
    // Simulate auto import from banks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAssets: Asset[] = [
      {
        id: "1",
        bank: "Handelsbanken",
        accountType: "Sparkonto",
        assetType: "Bankinsättning",
        accountNumber: "6000 123 456 789",
        amount: 450000
      },
      {
        id: "2",
        bank: "SEB",
        accountType: "ISK",
        assetType: "Fonder",
        accountNumber: "5000 987 654 321",
        amount: 275000
      },
      {
        id: "3",
        bank: "Skatteverket",
        accountType: "Återbetalning",
        assetType: "Kontant",
        accountNumber: "Skatteåterbäring 2024",
        amount: 8500,
        toRemain: true,
        reasonToRemain: "Skatteåterbäring som kommer att betalas ut senare"
      }
    ];
    
    setAssets([...assets, ...mockAssets]);
    setIsAutoImporting(false);
  };

  const handleAddAsset = () => {
    if (!newAsset.bank || !newAsset.accountType || !newAsset.assetType || !newAsset.accountNumber || !newAsset.amount) {
      return;
    }

    const asset: Asset = {
      id: Date.now().toString(),
      bank: newAsset.bank,
      accountType: newAsset.accountType,
      assetType: newAsset.assetType,
      accountNumber: newAsset.accountNumber,
      amount: parseFloat(newAsset.amount),
      toRemain: newAsset.toRemain,
      amountToRemain: newAsset.toRemain && newAsset.amountToRemain ? parseFloat(newAsset.amountToRemain) : undefined,
      reasonToRemain: newAsset.toRemain ? newAsset.reasonToRemain : undefined
    };

    setAssets([...assets, asset]);
    setNewAsset({ bank: "", accountType: "", assetType: "", accountNumber: "", amount: "", toRemain: false, amountToRemain: "", reasonToRemain: "" });
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const toggleAssetToRemain = (id: string) => {
    setAssets(assets.map(asset => 
      asset.id === id 
        ? { 
            ...asset, 
            toRemain: !asset.toRemain, 
            amountToRemain: !asset.toRemain ? asset.amount : undefined,
            reasonToRemain: !asset.toRemain ? "" : asset.reasonToRemain 
          }
        : asset
    ));
  };

  const updateReasonToRemain = (id: string, reason: string) => {
    setAssets(assets.map(asset => 
      asset.id === id 
        ? { ...asset, reasonToRemain: reason }
        : asset
    ));
  };

  const updateAmountToRemain = (id: string, amount: string) => {
    setAssets(assets.map(asset => 
      asset.id === id 
        ? { ...asset, amountToRemain: amount ? parseFloat(amount) : undefined }
        : asset
    ));
  };

  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const totalDistributableAmount = assets.reduce((sum, asset) => {
    if (asset.toRemain && asset.amountToRemain !== undefined) {
      // Only the excess amount over what should remain is distributable
      const distributableAmount = asset.amount - asset.amountToRemain;
      return sum + Math.max(0, distributableAmount);
    }
    return sum + (asset.toRemain ? 0 : asset.amount);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Tillgångar och bankkonton</CardTitle>
          <CardDescription>
            Samla in information om den avlidnes tillgångar från olika banker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auto" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auto">Automatisk hämtning</TabsTrigger>
              <TabsTrigger value="manual">Manuell inmatning</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto" className="space-y-6">
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Genom att ansluta till bankernas system kan vi automatiskt hämta kontoinformation. 
                  Detta kräver fullmakt eller dödsbevis.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {commonBanks.map((bank) => (
                  <Button
                    key={bank}
                    variant="outline"
                    className="p-6 h-auto flex flex-col items-center"
                    disabled={isAutoImporting}
                  >
                    <Building2 className="w-8 h-8 mb-2 text-muted-foreground" />
                    <span className="text-sm font-medium">{bank}</span>
                  </Button>
                ))}
              </div>
              
              <Button 
                onClick={handleAutoImport} 
                disabled={isAutoImporting}
                className="w-full"
                size="lg"
              >
                {isAutoImporting ? "Hämtar kontoinformation..." : "Starta automatisk hämtning"}
              </Button>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newAsset.bank}
                    onChange={(e) => setNewAsset({ ...newAsset, bank: e.target.value })}
                  >
                    <option value="">Välj bank</option>
                    {commonBanks.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountType">Kontotyp</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newAsset.accountType}
                    onChange={(e) => setNewAsset({ ...newAsset, accountType: e.target.value })}
                    disabled={!newAsset.bank}
                  >
                    <option value="">
                      {newAsset.bank ? "Välj kontotyp" : "Välj bank först"}
                    </option>
                    {newAsset.bank && getAccountTypesForBank(newAsset.bank).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {newAsset.bank && (
                    <p className="text-xs text-muted-foreground">
                      Visar kontotyper tillgängliga hos {newAsset.bank}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assetType">Tillgångs-/Skuldtyp</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newAsset.assetType}
                    onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}
                    disabled={!newAsset.bank}
                  >
                    <option value="">
                      {newAsset.bank ? "Välj tillgångs-/skuldtyp" : "Välj bank först"}
                    </option>
                    {newAsset.bank && getAssetTypesForBank(newAsset.bank).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {newAsset.bank && (
                    <p className="text-xs text-muted-foreground">
                      Visar tillgångs- och skuldtyper tillgängliga hos {newAsset.bank}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Kontonummer</Label>
                  <Input
                    id="accountNumber"
                    value={newAsset.accountNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, accountNumber: e.target.value })}
                    placeholder="XXXX XXX XXX XXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType) 
                      ? 'Skuld (SEK)' 
                      : 'Belopp (SEK)'}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newAsset.amount}
                    onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                    placeholder="0"
                  />
                  {newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType) && (
                    <p className="text-xs text-muted-foreground">
                      Ange skuldbeloppet som ett positivt tal
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="toRemain"
                    checked={newAsset.toRemain}
                    onCheckedChange={(checked) => setNewAsset({ ...newAsset, toRemain: !!checked })}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="toRemain" className="text-sm font-medium">
                      {newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType)
                        ? 'Skuld ska vara kvar'
                        : 'Konto ska vara kvar'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType)
                        ? 'Markera om skulden inte ska ingå i fördelningen (t.ex. bolån som ska fortsätta gälla)'
                        : 'Markera om kontot inte ska ingå i fördelningen (t.ex. skatteåterbäring)'}
                    </p>
                  </div>
                </div>
                
                {newAsset.toRemain && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amountToRemain">
                        Belopp som ska vara kvar (SEK)
                      </Label>
                      <Input
                        id="amountToRemain"
                        type="number"
                        value={newAsset.amountToRemain}
                        onChange={(e) => setNewAsset({ ...newAsset, amountToRemain: e.target.value })}
                        placeholder="0"
                        max={newAsset.amount}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ange hur mycket som ska vara kvar efter skiftet. Resterande belopp kommer att fördelas.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reasonToRemain">
                        {newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType)
                          ? 'Anledning till varför skulden ska vara kvar'
                          : 'Anledning till varför kontot ska vara kvar'}
                      </Label>
                      <Textarea
                        id="reasonToRemain"
                        value={newAsset.reasonToRemain}
                        onChange={(e) => setNewAsset({ ...newAsset, reasonToRemain: e.target.value })}
                        placeholder={newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType)
                          ? "T.ex. bolån som ska övertas av specifik arvinge, kvarstående månatliga betalningar, etc."
                          : "T.ex. skatteåterbäring, löpande ärende, etc."}
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <Button onClick={handleAddAsset} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Lägg till tillgång
              </Button>
            </TabsContent>
          </Tabs>

          {assets.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Registrerade tillgångar och skulder</h3>
              
              {/* Group assets by bank */}
              {Object.entries(
                assets.reduce((groups, asset) => {
                  if (!groups[asset.bank]) {
                    groups[asset.bank] = [];
                  }
                  groups[asset.bank].push(asset);
                  return groups;
                }, {} as Record<string, typeof assets>)
              ).map(([bank, bankAssets]) => (
                <div key={bank} className="border border-border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {bank}
                  </h4>
                  
                  {/* Bank totals first */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Totala tillgångar:</span>
                      <span className="font-semibold text-primary">
                        {bankAssets
                          .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
                          .reduce((sum, a) => sum + a.amount, 0)
                          .toLocaleString('sv-SE')} SEK
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Totala skulder:</span>
                      <span className="font-semibold text-destructive">
                        {bankAssets
                          .filter(a => ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
                          .reduce((sum, a) => sum + a.amount, 0)
                          .toLocaleString('sv-SE')} SEK
                      </span>
                    </div>
                  </div>
                  
                  {/* Individual accounts listed vertically */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm text-muted-foreground">Konton och innehav:</h5>
                    {bankAssets.map((asset) => (
                      <div key={asset.id} className="border border-border/50 rounded-md p-3 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">{asset.accountType}</Badge>
                              <Badge variant="outline" className="text-xs">{asset.assetType}</Badge>
                            </div>
                            <p className="font-medium text-sm">{asset.accountNumber}</p>
                            <p className="text-lg font-semibold">
                              {asset.amount.toLocaleString('sv-SE')} SEK
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAssetToRemain(asset.id)}
                              className={`p-2 ${asset.toRemain ? 'text-warning' : 'text-muted-foreground'}`}
                              title={asset.toRemain ? 'Kontot kommer att vara kvar' : 'Klicka för att markera att kontot ska vara kvar'}
                            >
                              {asset.toRemain ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAsset(asset.id)}
                              className="p-2 text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {asset.toRemain && (
                          <div className="space-y-3 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-warning" />
                              <span className="text-sm font-medium text-warning">Konto markerat att vara kvar</span>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`amount-remain-${asset.id}`} className="text-xs font-medium">
                                Belopp som ska vara kvar (SEK):
                              </Label>
                              <Input
                                id={`amount-remain-${asset.id}`}
                                type="number"
                                value={asset.amountToRemain || ""}
                                onChange={(e) => updateAmountToRemain(asset.id, e.target.value)}
                                placeholder="0"
                                max={asset.amount}
                                className="text-sm"
                              />
                              {asset.amountToRemain !== undefined && asset.amountToRemain < asset.amount && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Att fördela:</span> {(asset.amount - asset.amountToRemain).toLocaleString('sv-SE')} SEK
                                </p>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`reason-${asset.id}`} className="text-xs">
                                Anledning till varför kontot ska vara kvar:
                              </Label>
                              <Textarea
                                id={`reason-${asset.id}`}
                                value={asset.reasonToRemain || ""}
                                onChange={(e) => updateReasonToRemain(asset.id, e.target.value)}
                                placeholder="T.ex. skatteåterbäring, löpande ärende, bolån som ska övertas..."
                                className="text-sm"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">Total tillgångar:</span>
                  <span className="text-xl font-bold text-primary">
                    {assets
                      .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
                      .reduce((sum, a) => sum + a.amount, 0)
                      .toLocaleString('sv-SE')} SEK
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">Total skulder:</span>
                  <span className="text-xl font-bold text-destructive">
                    {assets
                      .filter(a => ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
                      .reduce((sum, a) => sum + a.amount, 0)
                      .toLocaleString('sv-SE')} SEK
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">Nettotillgångar att fördela:</span>
                  <span className="text-xl font-bold text-success">
                    {totalDistributableAmount.toLocaleString('sv-SE')} SEK
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={onBack}>
              Tillbaka
            </Button>
            <Button 
              onClick={onNext} 
              disabled={assets.length === 0}
            >
              Fortsätt till fördelning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};