import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Coins, Building, Bitcoin, AlertTriangle } from "lucide-react";

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

interface AssetPreferencesProps {
  beneficiaries: Beneficiary[];
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
}

export const AssetPreferences = ({ beneficiaries, setBeneficiaries }: AssetPreferencesProps) => {
  const updateAssetPreference = (beneficiaryId: string, assetType: keyof Beneficiary['assetPreferences'], preference: 'transfer' | 'sell') => {
    setBeneficiaries(beneficiaries.map(beneficiary => 
      beneficiary.id === beneficiaryId 
        ? { 
            ...beneficiary, 
            assetPreferences: {
              ...beneficiary.assetPreferences,
              [assetType]: preference
            }
          }
        : beneficiary
    ));
  };

  const updateAssetNotApplicable = (beneficiaryId: string, assetType: keyof Beneficiary['assetNotApplicable'], notApplicable: boolean) => {
    setBeneficiaries(beneficiaries.map(beneficiary => 
      beneficiary.id === beneficiaryId 
        ? { 
            ...beneficiary, 
            assetNotApplicable: {
              ...beneficiary.assetNotApplicable,
              [assetType]: notApplicable
            },
            // Clear preference if marking as not applicable
            assetPreferences: notApplicable 
              ? { ...beneficiary.assetPreferences, [assetType]: undefined }
              : beneficiary.assetPreferences
          }
        : beneficiary
    ));
  };

  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case 'warrants': return <TrendingUp className="w-4 h-4" />;
      case 'certificates': return <Building className="w-4 h-4" />;
      case 'options': return <Coins className="w-4 h-4" />;
      case 'futures': return <Bitcoin className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getAssetLabel = (assetType: string) => {
    switch (assetType) {
      case 'warrants': return 'Fonder';
      case 'certificates': return 'Aktier';
      case 'options': return 'Försäkring';
      case 'futures': return 'Andra värdepapper';
      default: return assetType;
    }
  };

  const getPreferenceLabel = (preference: string) => {
    switch (preference) {
      case 'transfer': return 'Överfört i sin helhet';
      case 'sell': return 'Sälj och dela värdet';
      default: return preference;
    }
  };

  const assetTypes = ['warrants', 'certificates', 'options', 'futures'] as const;

  if (beneficiaries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Preferenser för finansiella tillgångar
        </CardTitle>
        <CardDescription>
          Ange hur varje dödsbodelägare vill hantera finansiella tillgångar som fonder, aktier, försäkringar och andra värdepapper
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Viktigt att veta om finansiella tillgångar
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>Överföring:</strong> Tillgångarna överförs direkt till arvingen i samma form. Detta kan innebära skattekonsekvenser och kräver ofta att mottagaren har rätt typ av konto.</p>
                <p><strong>Försäljning:</strong> Tillgångarna säljs och kontantvärdet delas enligt fördelningen. Detta kan vara enklare administrativt men kan påverka marknadsexponering.</p>
                <p><strong>Skatteaspekter:</strong> Konsultera en skatterådgivare för att förstå konsekvenserna av olika val.</p>
                <p><strong>Försäkringar:</strong> Vissa försäkringar kan ha särskilda regler för överlåtelse eller uttag.</p>
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Viktigt att veta:</strong> Fonder och värdepapper kan inte alltid överföras direkt mellan konton. 
              I vissa fall måste de säljas och överföras som kontanter. Konsultera med respektive bank före 
              beslut om du är osäker på vad som gäller för specifika innehav.
            </AlertDescription>
          </Alert>
        </div>
          </div>
        </div>

        {beneficiaries.map((beneficiary) => (
          <div key={beneficiary.id} className="p-4 border border-border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{beneficiary.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {beneficiary.percentage}% av tillgångarna ({beneficiary.relationship})
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-sm font-medium">Preferenser för tillgångstyper:</h5>
              <div className="space-y-4">
                {assetTypes.map((assetType) => (
                  <div key={assetType} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAssetIcon(assetType)}
                        <Label className="text-sm font-medium">
                          {getAssetLabel(assetType)}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`notApplicable-${beneficiary.id}-${assetType}`}
                          checked={beneficiary.assetNotApplicable?.[assetType] || false}
                          onChange={(e) => updateAssetNotApplicable(beneficiary.id, assetType, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`notApplicable-${beneficiary.id}-${assetType}`} className="text-xs cursor-pointer">
                          Inte applicerbart
                        </Label>
                      </div>
                    </div>
                    
                    {!beneficiary.assetNotApplicable?.[assetType] && (
                      <div className="flex gap-2 ml-6">
                        <button
                          type="button"
                          onClick={() => updateAssetPreference(beneficiary.id, assetType, 'transfer')}
                          className={`flex-1 px-3 py-2 text-xs rounded-md border transition-colors ${
                            beneficiary.assetPreferences?.[assetType] === 'transfer'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          Överför
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAssetPreference(beneficiary.id, assetType, 'sell')}
                          className={`flex-1 px-3 py-2 text-xs rounded-md border transition-colors ${
                            beneficiary.assetPreferences?.[assetType] === 'sell'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          Sälj
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-3 border-t border-border">
              <h6 className="text-xs font-medium mb-2">Nuvarande preferenser:</h6>
              <div className="flex flex-wrap gap-1">
                {assetTypes.map((assetType) => {
                  if (beneficiary.assetNotApplicable?.[assetType]) {
                    return (
                      <Badge key={assetType} variant="secondary" className="text-xs">
                        {getAssetLabel(assetType)}: Inte applicerbart
                      </Badge>
                    );
                  }
                  const preference = beneficiary.assetPreferences?.[assetType];
                  if (!preference) return null;
                  return (
                    <Badge key={assetType} variant="outline" className="text-xs">
                      {getAssetLabel(assetType)}: {getPreferenceLabel(preference)}
                    </Badge>
                  );
                })}
                {!assetTypes.some(type => 
                  beneficiary.assetNotApplicable?.[type] || beneficiary.assetPreferences?.[type]
                ) && (
                  <span className="text-xs text-muted-foreground">Inga preferenser angivna</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            Vanliga scenarier och rekommendationer:
          </h4>
          <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
            <div>
              <strong>Fonder i ISK/KF:</strong> Kan ofta överföras direkt till mottagarens ISK/KF utan skattekonsekvenser.
            </div>
            <div>
              <strong>Aktier på AF-konto:</strong> Överföring kan utlösa skattepliktig kapitalvinst. Överväg försäljning.
            </div>
            <div>
              <strong>Försäkringar:</strong> Livförsäkringar och pensionsförsäkringar kan ha särskilda bestämmelser för förmånstagare.
            </div>
            <div>
              <strong>Andra värdepapper:</strong> Obligationer, företagscertifikat och andra instrument kan kräva individuell bedömning.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};