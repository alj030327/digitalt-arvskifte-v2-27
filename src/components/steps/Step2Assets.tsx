import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Home, Car, Diamond, Plus, Trash2, Package, Building2, Lock, Unlock } from "lucide-react";
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

interface PhysicalAsset {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  category: string;
}

interface Step2Props {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  physicalAssets: PhysicalAsset[];
  setPhysicalAssets: (assets: PhysicalAsset[]) => void;
  onNext: () => void;
  onBack: () => void;
  t: (key: string) => string;
}

export const Step2Assets = ({ assets, setAssets, physicalAssets, setPhysicalAssets, onNext, onBack, t }: Step2Props) => {
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

  const [newPhysicalAsset, setNewPhysicalAsset] = useState({
    name: "",
    description: "",
    estimatedValue: "",
    category: ""
  });

  const physicalAssetCategories = [
    "Fastighet", "Fordon", "Smycken", "Konst", "Möbler", "Elektronik", "Verktyg", "Samlingar", "Övrigt"
  ];

  const banksWithDetails = {
    "Handelsbanken": {
      accountTypes: {
        "💳 Privatkonton": ["Privatkonto"],
        "💰 Sparkonton": ["Sparkonto", "Placeringskonto"],
        "📈 Investeringskonton": ["ISK", "Kapitalförsäkring", "AF-konto", "Depåkonto"],
        "🏦 Företags- & föreningskonton": ["Företagskonto", "Föreningskonto"],
        "🧒 Barn- och ungdomskonton": ["Ungdomskonto", "Barnsparkonto"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto", "Betalkortskonto"],
        "🏠 Lånekonton": ["Bolånekonto", "Privatlånekonto", "Billånekonto"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto", "Tjänstepension", "Livförsäkringar"]
      },
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Obligationer", "Pension", "Försäkring"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Blancolån", "Billån"]
    },
    "SEB": {
      accountTypes: {
        "💳 Privatkonton": ["Lönekonto", "Allkonto"],
        "💰 Sparkonton": ["Sparkonto", "E-sparkonto", "Enkla sparkontot", "Kapitalkonto"],
        "📈 Investeringskonton": ["ISK", "Kapitalförsäkring", "AF-konto", "Depåkonto", "IPS"],
        "🏦 Företags- & föreningskonton": ["Företagskonto", "Föreningskonto"],
        "🧒 Barn- och ungdomskonton": ["Ungdomskonto", "Barnsparkonto", "ISK för barn"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto", "Betalkortskonto", "Kontokredit"],
        "🏠 Lånekonton": ["Bolånekonto", "Privatlånekonto", "Billånekonto"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto", "Tjänstepension", "Privat pension"]
      },
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Obligationer", "Pension", "Strukturerade produkter"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Företagslån", "Billån"]
    },
    "Swedbank": {
      accountTypes: {
        "💳 Privatkonton": ["Lönekonto", "Allkonto"],
        "💰 Sparkonton": ["Sparkonto", "E-sparkonto", "Enkla sparkontot"],
        "📈 Investeringskonton": ["ISK", "Kapitalförsäkring", "AF-konto", "Depåkonto"],
        "🏦 Företags- & föreningskonton": ["Företagskonto", "Föreningskonto"],
        "🧒 Barn- och ungdomskonton": ["Swedbank Ung", "Ungdomskonto", "Barnsparkonto"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto", "Betalkortskonto", "Kreditlina"],
        "🏠 Lånekonton": ["Bolånekonto", "Privatlånekonto", "Billånekonto"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto", "Tjänstepension"]
      },
      assetTypes: ["Bankinsättning", "Aktier", "Robur fonder", "Obligationer", "Pension", "Försäkring"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Blancolån", "Företagslån"]
    }
  };

  const commonBanks = Object.keys(banksWithDetails);

  const getAccountTypesForBank = (bank: string) => {
    const bankData = banksWithDetails[bank as keyof typeof banksWithDetails];
    if (!bankData?.accountTypes) return [];
    return Object.values(bankData.accountTypes).flat();
  };

  const getAssetTypesForBank = (bank: string) => {
    const bankData = banksWithDetails[bank as keyof typeof banksWithDetails];
    return bankData ? [...bankData.assetTypes, ...bankData.debtTypes] : [];
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

  const handleAddPhysicalAsset = () => {
    if (!newPhysicalAsset.name || !newPhysicalAsset.category || !newPhysicalAsset.estimatedValue) {
      return;
    }

    const asset: PhysicalAsset = {
      id: Date.now().toString(),
      name: newPhysicalAsset.name,
      description: newPhysicalAsset.description,
      estimatedValue: parseFloat(newPhysicalAsset.estimatedValue),
      category: newPhysicalAsset.category
    };

    setPhysicalAssets([...physicalAssets, asset]);
    setNewPhysicalAsset({
      name: "",
      description: "",
      estimatedValue: "",
      category: ""
    });
  };

  const handleRemovePhysicalAsset = (id: string) => {
    setPhysicalAssets(physicalAssets.filter(asset => asset.id !== id));
  };

  const totalFinancialAssets = assets
    .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
    .reduce((sum, a) => sum + (a.toRemain ? 0 : a.amount), 0);
    
  const totalPhysicalAssets = physicalAssets.reduce((sum, a) => sum + a.estimatedValue, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Financial Assets Section */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Finansiella tillgångar</CardTitle>
          <CardDescription>
            Lägg till bankkonton, investeringar och skulder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                <option value="">{newAsset.bank ? "Välj kontotyp" : "Välj bank först"}</option>
                {newAsset.bank && getAccountTypesForBank(newAsset.bank).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assetType">Tillgångstyp</Label>
              <select
                className="w-full p-2 border border-border rounded-md bg-background"
                value={newAsset.assetType}
                onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}
                disabled={!newAsset.bank}
              >
                <option value="">{newAsset.bank ? "Välj tillgångstyp" : "Välj bank först"}</option>
                {newAsset.bank && getAssetTypesForBank(newAsset.bank).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
              <Label htmlFor="amount">Belopp (SEK)</Label>
              <Input
                id="amount"
                type="number"
                value={newAsset.amount}
                onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          
          <Button onClick={handleAddAsset} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till finansiell tillgång
          </Button>

          {assets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Registrerade finansiella tillgångar</h3>
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">{asset.bank} - {asset.accountType}</span>
                          <Badge variant="secondary">{asset.assetType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Kontonummer: {asset.accountNumber}
                        </p>
                        <p className="text-lg font-semibold text-primary">
                          {asset.amount.toLocaleString('sv-SE')} SEK
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAsset(asset.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Physical Assets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Fysiska tillgångar
          </CardTitle>
          <CardDescription>
            Registrera fysiska tillgångar som fastigheter, fordon, smycken och andra värdefulla föremål
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">Namn på tillgång</Label>
              <Input
                id="assetName"
                value={newPhysicalAsset.name}
                onChange={(e) => setNewPhysicalAsset({ ...newPhysicalAsset, name: e.target.value })}
                placeholder="T.ex. Villa Roslagsgatan 5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <select
                className="w-full p-2 border border-border rounded-md bg-background"
                value={newPhysicalAsset.category}
                onChange={(e) => setNewPhysicalAsset({ ...newPhysicalAsset, category: e.target.value })}
              >
                <option value="">Välj kategori</option>
                {physicalAssetCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Uppskattat värde (SEK)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={newPhysicalAsset.estimatedValue}
                onChange={(e) => setNewPhysicalAsset({ ...newPhysicalAsset, estimatedValue: e.target.value })}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beskrivning (valfritt)</Label>
              <Textarea
                id="description"
                value={newPhysicalAsset.description}
                onChange={(e) => setNewPhysicalAsset({ ...newPhysicalAsset, description: e.target.value })}
                placeholder="Ytterligare detaljer om tillgången..."
                rows={2}
              />
            </div>
          </div>
          
          <Button onClick={handleAddPhysicalAsset} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till fysisk tillgång
          </Button>

          {physicalAssets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Registrerade fysiska tillgångar</h3>
              <div className="space-y-3">
                {physicalAssets.map((asset) => (
                  <div key={asset.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4" />
                          <span className="font-medium">{asset.name}</span>
                          <Badge variant="secondary">{asset.category}</Badge>
                        </div>
                        {asset.description && (
                          <p className="text-sm text-muted-foreground mb-2">{asset.description}</p>
                        )}
                        <p className="text-lg font-semibold text-primary">
                          {asset.estimatedValue.toLocaleString('sv-SE')} SEK
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePhysicalAsset(asset.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Totala finansiella tillgångar:</span>
              <span className="text-xl font-bold text-primary">
                {totalFinancialAssets.toLocaleString('sv-SE')} SEK
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Totala fysiska tillgångar:</span>
              <span className="text-xl font-bold text-primary">
                {totalPhysicalAssets.toLocaleString('sv-SE')} SEK
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="font-semibold">Totala nettotillgångar:</span>
              <span className="text-xl font-bold text-primary">
                {(totalFinancialAssets + totalPhysicalAssets).toLocaleString('sv-SE')} SEK
              </span>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack}>
              Tillbaka
            </Button>
            <Button 
              onClick={onNext} 
              disabled={assets.length === 0 && physicalAssets.length === 0}
            >
              Fortsätt till fördelning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
