import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Trash2, Upload, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Asset {
  id: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  amount: number;
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
    accountNumber: "",
    amount: ""
  });
  const [isAutoImporting, setIsAutoImporting] = useState(false);

  const commonBanks = [
    "Handelsbanken", "SEB", "Swedbank", "Nordea", "Danske Bank", 
    "Länsförsäkringar Bank", "ICA Banken", "Sparbanken"
  ];

  const accountTypes = [
    "Sparkonto", "Transaktionskonto", "Pensionskonto", "ISK", "Kapitalförsäkring"
  ];

  const handleAutoImport = async () => {
    setIsAutoImporting(true);
    // Simulate auto import from banks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAssets: Asset[] = [
      {
        id: "1",
        bank: "Handelsbanken",
        accountType: "Sparkonto",
        accountNumber: "6000 123 456 789",
        amount: 450000
      },
      {
        id: "2",
        bank: "SEB",
        accountType: "ISK",
        accountNumber: "5000 987 654 321",
        amount: 275000
      }
    ];
    
    setAssets([...assets, ...mockAssets]);
    setIsAutoImporting(false);
  };

  const handleAddAsset = () => {
    if (!newAsset.bank || !newAsset.accountType || !newAsset.accountNumber || !newAsset.amount) {
      return;
    }

    const asset: Asset = {
      id: Date.now().toString(),
      bank: newAsset.bank,
      accountType: newAsset.accountType,
      accountNumber: newAsset.accountNumber,
      amount: parseFloat(newAsset.amount)
    };

    setAssets([...assets, asset]);
    setNewAsset({ bank: "", accountType: "", accountNumber: "", amount: "" });
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);

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
                  >
                    <option value="">Välj kontotyp</option>
                    {accountTypes.map((type) => (
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
                Lägg till tillgång
              </Button>
            </TabsContent>
          </Tabs>

          {assets.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Registrerade tillgångar</h3>
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{asset.bank}</span>
                        <Badge variant="secondary">{asset.accountType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{asset.accountNumber}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {asset.amount.toLocaleString('sv-SE')} SEK
                        </div>
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
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-semibold">Total tillgångar:</span>
                <span className="text-xl font-bold text-primary">
                  {totalAmount.toLocaleString('sv-SE')} SEK
                </span>
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