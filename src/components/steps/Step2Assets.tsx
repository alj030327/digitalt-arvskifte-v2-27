import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2, Lock, Unlock } from "lucide-react";
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
  t: (key: string) => string;
}

export const Step2Assets = ({ assets, setAssets, onNext, onBack, t }: Step2Props) => {
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
    },
    "Nordea": {
      accountTypes: {
        "💳 Privatkonton": ["Personkonto"],
        "💰 Sparkonton": ["Sparkonto", "Högsparränta", "Fasträntekonto", "Fasträntekonto Plus"],
        "📈 Investeringskonton": ["ISK", "Kapitalförsäkring", "AF-konto", "Värdepapperskonto"],
        "🏦 Företags- & föreningskonton": ["Företagskonto", "Föreningskonto"],
        "🧒 Barn- och ungdomskonton": ["Ungdomskonto", "Barnsparkonto", "Sparfond för barn"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto", "Betalkortskonto", "Kontokredit"],
        "🏠 Lånekonton": ["Bostadskreditkonto", "Privatlånekonto", "Avbetalningskonto"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto", "Tjänstepension", "Livförsäkringar"]
      },
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Obligationer", "Pension", "Livförsäkring"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Blancolån", "Billån"]
    },
    "Danske Bank": {
      accountTypes: {
        "💳 Privatkonton": ["Danske Konto"],
        "💰 Sparkonton": ["Sparkonto", "Fasträntekonto"],
        "📈 Investeringskonton": ["ISK", "Kapitalförsäkring", "Danske Invest", "Depåkonto"],
        "🏦 Företags- & föreningskonton": ["Företagskonto", "Föreningskonto"],
        "🧒 Barn- och ungdomskonton": ["Ungdomskonto", "Barnsparkonto"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto", "Betalkortskonto"],
        "🏠 Lånekonton": ["Bolånekonto", "Privatlånekonto"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto", "Tjänstepension"]
      },
      assetTypes: ["Bankinsättning", "Aktier", "Danske Invest fonder", "Obligationer", "Pension"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Företagslån"]
    },
    "Länsförsäkringar Bank": {
      accountTypes: {
        "💳 Privatkonton": ["Lönekonto"],
        "💰 Sparkonton": ["Sparkonto"],
        "📈 Investeringskonton": ["ISK", "Försäkringssparande", "Kapitalförsäkring"],
        "🏦 Företags- & föreningskonton": ["Företagskonto", "Skogskonto", "Jordbrukskonto"],
        "🧒 Barn- och ungdomskonton": ["Ungdomskonto", "Barnsparkonto"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto", "Betalkortskonto"],
        "🏠 Lånekonton": ["Bolånekonto", "Privatlånekonto"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto", "Försäkringssparande"]
      },
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Försäkringssparande", "Pension"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort", "Blancolån"]
    },
    "ICA Banken": {
      accountTypes: {
        "💳 Privatkonton": ["ICA Konto", "Lönekonto"],
        "💰 Sparkonton": ["Sparkonto", "Buffert"],
        "📈 Investeringskonton": ["ISK"],
        "🏦 Företags- & föreningskonton": ["Företagskonto"],
        "🧒 Barn- och ungdomskonton": ["Ungdomskonto"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto", "Betalkortskonto"],
        "🏠 Lånekonton": ["Privatlånekonto", "Billånekonto"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto"]
      },
      assetTypes: ["Bankinsättning", "Fonder", "ICA-poäng", "Sparkonto"],
      debtTypes: ["Privatlån", "Kreditkort", "Billån"]
    },
    "Sparbanken": {
      accountTypes: {
        "💳 Privatkonton": ["Lönekonto"],
        "💰 Sparkonton": ["Sparkonto"],
        "📈 Investeringskonton": ["ISK", "AF-konto"],
        "🏦 Företags- & föreningskonton": ["Företagskonto"],
        "🧒 Barn- och ungdomskonton": ["Ungdomskonto", "Barnsparkonto"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto", "Betalkortskonto"],
        "🏠 Lånekonton": ["Bolånekonto", "Privatlånekonto"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto"]
      },
      assetTypes: ["Bankinsättning", "Aktier", "Fonder", "Pension"],
      debtTypes: ["Bolån", "Privatlån", "Kreditkort"]
    },
    "Avanza": {
      accountTypes: {
        "💳 Privatkonton": [],
        "💰 Sparkonton": [],
        "📈 Investeringskonton": ["ISK", "Kapitalförsäkring", "AF-konto", "Depåkonto"],
        "🏦 Företags- & föreningskonton": [],
        "🧒 Barn- och ungdomskonton": ["ISK för barn"],
        "💸 Betal- & kreditkonton": [],
        "🏠 Lånekonton": ["Blancolån"],
        "⚖️ Pensionskonton & försäkringar": ["Pensionskonto", "IPS"]
      },
      assetTypes: ["Aktier", "Fonder", "ETF:er", "Pension", "Räntefonder"],
      debtTypes: ["Blancolån"]
    },
    "Skandiabanken": {
      accountTypes: {
        "💳 Privatkonton": ["Lönekonto"],
        "💰 Sparkonton": ["Sparkonto"],
        "📈 Investeringskonton": ["ISK", "Kapitalförsäkring"],
        "🏦 Företags- & föreningskonton": ["Företagskonto"],
        "🧒 Barn- och ungdomskonton": ["Ungdomskonto"],
        "💸 Betal- & kreditkonton": ["Kreditkortkonto"],
        "🏠 Lånekonton": ["Bolånekonto", "Privatlånekonto"],
        "⚖️ Pensionskonton & försäkringar": ["Liv & Pension", "Pensionskonto"]
      },
      assetTypes: ["Bankinsättning", "Fonder", "Pension", "Livförsäkring"],
      debtTypes: ["Bolån", "Privatlån"]
    }
  };

  const commonBanks = Object.keys(banksWithDetails);

  const getAccountTypesForBank = (bank: string) => {
    const bankData = banksWithDetails[bank as keyof typeof banksWithDetails];
    if (!bankData?.accountTypes) return [];
    
    // Flatten all account types from all categories
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

  // Separate assets and debts
  const totalAssets = assets.reduce((sum, asset) => {
    // Skulder (negativa värden) läggs till som negativa
    const isDebt = ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(asset.assetType);
    const value = isDebt ? -Math.abs(asset.amount) : asset.amount;
    return sum + value;
  }, 0);

  const totalDistributableAmount = assets.reduce((sum, asset) => {
    const isDebt = ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(asset.assetType);
    const value = isDebt ? -Math.abs(asset.amount) : asset.amount;
    
    if (asset.toRemain && asset.amountToRemain !== undefined) {
      // För skulder: Om hela skulden ska vara kvar, inget att fördela
      // För tillgångar: Bara överskottet över vad som ska vara kvar
      const distributableAmount = isDebt 
        ? (asset.amountToRemain >= Math.abs(asset.amount) ? 0 : value + asset.amountToRemain)
        : value - asset.amountToRemain;
      return sum + Math.max(0, distributableAmount);
    }
    // Om inget ska vara kvar, lägg till hela värdet (skulder som negativa)
    return sum + (asset.toRemain ? 0 : value);
  }, 0);

  // Säkerställ att distributable amount aldrig blir negativt
  const safeDistributableAmount = Math.max(0, totalDistributableAmount);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('assets.title')}</CardTitle>
          <CardDescription>
            {t('assets.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">{t('assets.bank')}</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newAsset.bank}
                    onChange={(e) => setNewAsset({ ...newAsset, bank: e.target.value })}
                  >
                    <option value="">{t('button.choose')} {t('assets.bank').toLowerCase()}</option>
                    {commonBanks.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountType">{t('assets.account_type')}</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newAsset.accountType}
                    onChange={(e) => setNewAsset({ ...newAsset, accountType: e.target.value })}
                    disabled={!newAsset.bank}
                  >
                    <option value="">
                      {newAsset.bank ? t('assets.select_account_type') : t('assets.select_bank_first')}
                    </option>
                    {newAsset.bank && getAccountTypesForBank(newAsset.bank).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {newAsset.bank && (
                    <p className="text-xs text-muted-foreground">
                      {t('assets.account_type')} {t('button.select').toLowerCase()} {newAsset.bank}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assetType">{t('assets.asset_type')}</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newAsset.assetType}
                    onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}
                    disabled={!newAsset.bank}
                  >
                    <option value="">
                      {newAsset.bank ? t('assets.select_asset_type') : t('assets.select_bank_first')}
                    </option>
                    {newAsset.bank && getAssetTypesForBank(newAsset.bank).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {newAsset.bank && (
                    <p className="text-xs text-muted-foreground">
                      {t('assets.asset_type')} {t('button.select').toLowerCase()} {newAsset.bank}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">{t('assets.account_number')}</Label>
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
                      ? t('assets.debt') 
                      : t('assets.amount')}
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
                      {t('assets.debt_amount_help')}
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
                        ? t('assets.debt_remain')
                        : t('assets.account_remain')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType)
                        ? t('assets.remain_help_debt')
                        : t('assets.remain_help_asset')}
                    </p>
                  </div>
                </div>
                
                {newAsset.toRemain && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amountToRemain">
                        {t('assets.amount_remain')}
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
                        {t('assets.remain_amount_help')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reasonToRemain">
                        {newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType)
                          ? t('assets.reason_debt_remain')
                          : t('assets.reason_remain')}
                      </Label>
                      <Textarea
                        id="reasonToRemain"
                        value={newAsset.reasonToRemain}
                        onChange={(e) => setNewAsset({ ...newAsset, reasonToRemain: e.target.value })}
                        placeholder={newAsset.assetType && ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(newAsset.assetType)
                          ? t('assets.reason_placeholder_debt')
                          : t('assets.reason_placeholder_asset')}
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <Button onClick={handleAddAsset} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {t('assets.add_asset')}
              </Button>
          </div>

          {assets.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">{t('assets.registered_assets')}</h3>
              
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
                      <span className="font-medium">{t('assets.total_assets')}:</span>
                      <span className="font-semibold text-primary">
                        {bankAssets
                          .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
                          .reduce((sum, a) => sum + a.amount, 0)
                          .toLocaleString('sv-SE')} SEK
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t('assets.total_debts')}:</span>
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
                    <h5 className="font-medium text-sm text-muted-foreground">{t('assets.accounts_holdings')}</h5>
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
                              title={asset.toRemain ? t('assets.remain_tooltip_on') : t('assets.remain_tooltip_off')}
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
                              <span className="text-sm font-medium text-warning">{t('assets.marked_remain')}</span>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`amount-remain-${asset.id}`} className="text-xs font-medium">
                                {t('assets.amount_remain')}:
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
                                  <span className="font-medium">{t('assets.to_distribute')}:</span> {(asset.amount - asset.amountToRemain).toLocaleString('sv-SE')} SEK
                                </p>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`reason-${asset.id}`} className="text-xs">
                                {t('assets.reason_remain')}:
                              </Label>
                              <Textarea
                                id={`reason-${asset.id}`}
                                value={asset.reasonToRemain || ""}
                                onChange={(e) => updateReasonToRemain(asset.id, e.target.value)}
                                placeholder={t('assets.reason_remain_general')}
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
                  <span className="font-medium">{t('assets.total_assets')}:</span>
                  <span className="text-xl font-bold text-primary">
                    {assets
                      .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
                      .reduce((sum, a) => sum + a.amount, 0)
                      .toLocaleString('sv-SE')} SEK
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">{t('assets.total_debts')}:</span>
                  <span className="text-xl font-bold text-destructive">
                    {assets
                      .filter(a => ['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
                      .reduce((sum, a) => sum + a.amount, 0)
                      .toLocaleString('sv-SE')} SEK
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">{t('assets.net_distributable')}:</span>
                  <span className="text-xl font-bold text-success">
                    {safeDistributableAmount.toLocaleString('sv-SE')} SEK
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={onBack}>
              {t('button.back')}
            </Button>
            <Button 
              onClick={onNext} 
              disabled={assets.length === 0}
            >
              {t('assets.continue_distribution')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};