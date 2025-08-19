import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale, FileText, Users, AlertTriangle } from "lucide-react";

interface Heir {
  name: string;
  personalNumber: string;
  relationship: string;
  inheritanceShare?: number;
}

interface LegalSummaryProps {
  hasTestament: boolean;
  heirs: Heir[];
  totalAmount: number;
  className?: string;
}

const LegalSummary = ({ hasTestament, heirs, totalAmount, className = "" }: LegalSummaryProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  };

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
          <Scale className="w-6 h-6" />
          Juridisk sammanfattning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legal basis */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Rättslig grund:</strong> Detta arvsskifte följer svensk lagstiftning enligt:
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Ärvdabalken (SFS 1958:637) - huvudlag för arvsrätt</li>
              <li>Äktenskapsbalken - för makes arvsrätt</li>
              <li>Föräldrabalken - för barns arvsrätt och särkullbarn</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Distribution basis */}
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>Fördelningsgrund:</strong> 
            {hasTestament ? (
              <span> Testamentarisk fördelning med hänsyn till laglott enligt 7 kap. Ärvdabalken. Barn och efterlevande make har rätt till hälften av sin lagstadgade arvslott som inte kan frångås.</span>
            ) : (
              <span> Lagstadgad arvordning enligt Ärvdabalken. Fördelningen sker enligt arvsklasserna: 1) Barn och efterkommande, 2) Föräldrar och syskon, 3) Mor- och farföräldrar.</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Heirs summary */}
        <div className="space-y-3">
          <h4 className="font-semibold text-blue-800">Arvingar och fördelning:</h4>
          {heirs.map((heir, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{heir.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {heir.relationship} • {heir.personalNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {heir.inheritanceShare ? `${heir.inheritanceShare}%` : 'Ej specificerat'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {heir.inheritanceShare 
                      ? formatAmount((heir.inheritanceShare / 100) * totalAmount)
                      : 'Belopp ej beräknat'
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total amount */}
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-blue-800">Totalt att fördela:</span>
            <span className="text-xl font-bold text-blue-800">{formatAmount(totalAmount)}</span>
          </div>
        </div>

        {/* Legal compliance note */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Juridisk efterlevnad:</strong> Detta dokument har skapats för att följa svensk lagstiftning. 
            Vid komplexa ärenden, tvister eller osäkerhet rekommenderas alltid konsultation med jurist eller dödsboförvaltare. 
            Dokumentet utgör en sammanställning och ersätter inte professionell juridisk rådgivning.
          </AlertDescription>
        </Alert>

        {/* Reference to laws */}
        <div className="text-xs text-blue-600 space-y-1">
          <p><strong>Relevanta lagrum:</strong></p>
          <p>• Ärvdabalken 1 kap. (arvsrätt allmänt) • 3 kap. (makes arvsrätt) • 7 kap. (laglott)</p>
          <p>• Äktenskapsbalken 11-12 kap. (bodelning) • Föräldrabalken 15 kap. (förmyndares ansvar)</p>
          <p>• Förvaltningslagen 2017:900 (handläggning hos myndigheter)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LegalSummary;