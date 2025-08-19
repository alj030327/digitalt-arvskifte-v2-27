import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Scale, Users, AlertTriangle } from "lucide-react";

interface LegalGuidanceProps {
  context: 'distribution' | 'testament' | 'heirs' | 'general';
  className?: string;
}

const LegalGuidance = ({ context, className = "" }: LegalGuidanceProps) => {
  const getContent = () => {
    switch (context) {
      case 'distribution':
        return {
          title: "Juridisk vägledning - Arvsfördelning",
          icon: Scale,
          content: (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lagstadgad arvordning (Ärvdabalken):</strong> Om det inte finns testamente gäller lagstadgad arvordning:
                  <br />• 1:a arvsklassen: Barn och efterkommande
                  <br />• 2:a arvsklassen: Föräldrar och syskon
                  <br />• 3:e arvsklassen: Mor- och farföräldrar
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Laglott (7 kap. Ärvdabalken):</strong> Barn och efterlevande make har rätt till hälften av sin lagstadgade arvslott. Denna rätt kan inte frångås i testamente.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>Särkullbarn:</strong> Barn från tidigare förhållanden har samma arvsrätt som gemensamma barn och är skyddade av laglotten.
                </AlertDescription>
              </Alert>
            </div>
          )
        };

      case 'testament':
        return {
          title: "Juridisk vägledning - Testamente",
          icon: Scale,
          content: (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Testamentets begränsningar:</strong> Ett testamente kan inte frångå laglotten. Barn och efterlevande make har alltid rätt till hälften av sin lagstadgade arvslott.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formkrav:</strong> Testamente ska enligt 10 kap. Ärvdabalken vara skriftligt, undertecknat av testamentsgivaren inför två vittnen som också ska skriva under.
                </AlertDescription>
              </Alert>
            </div>
          )
        };

      case 'heirs':
        return {
          title: "Juridisk vägledning - Arvingar",
          icon: Users,
          content: (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Arvsrätt för makar:</strong> Efterlevande make ärver alltid enligt 3 kap. Ärvdabalken, men exakt andel beror på om det finns särkullbarn.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>Särkullbarn vs gemensamma barn:</strong> Alla barn har samma arvsrätt oavsett om de är gemensamma med efterlevande make eller från tidigare förhållanden.
                </AlertDescription>
              </Alert>
            </div>
          )
        };

      case 'general':
      default:
        return {
          title: "Juridisk information",
          icon: Info,
          content: (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Detta system följer svensk lagstiftning enligt Ärvdabalken (SFS 1958:637), Äktenskapsbalken och Föräldrabalken. Systemet är designat för att hjälpa till med korrekta arvsfördelningar men ersätter inte juridisk rådgivning.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Viktigt:</strong> Vid komplexa ärenden, tvister eller osäkerhet rekommenderas alltid kontakt med jurist eller dödsboförvaltare.
                </AlertDescription>
              </Alert>
            </div>
          )
        };
    }
  };

  const { title, icon: Icon, content } = getContent();

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {content}
      </CardContent>
    </Card>
  );
};

export default LegalGuidance;