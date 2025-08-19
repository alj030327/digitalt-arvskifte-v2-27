import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Users, FileText, CheckCircle, Clock, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import InteractiveDemo from "@/components/InteractiveDemo";

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleStartProcess = () => {
    navigate("/arvsskifte");
  };

  const steps = [
    {
      icon: Users,
      title: "Registrera dödsbodelägare",
      description: "Ange information om den avlidne och alla dödsbodelägare som ska delta i arvsskiftet."
    },
    {
      icon: FileText,
      title: "Inventera tillgångar",
      description: "Lägg till alla banktillgångar, fysiska tillgångar och skulder som ingår i dödsboet."
    },
    {
      icon: Scale,
      title: "Fördela arvet",
      description: "Specificera hur tillgångarna ska fördelas enligt Ärvdabalken - lagstadgad arvordning eller testamente med hänsyn till laglott."
    },
    {
      icon: CheckCircle,
      title: "Signera dokumenten",
      description: "Generera och signera arvsskiftesdokumenten fysiskt för att slutföra processen."
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Snabbt och enkelt",
      description: "Genomför ett arvsskifte på 30 minuter istället för månader"
    },
    {
      icon: Shield,
      title: "Följer svensk lag",
      description: "Systemet följer Ärvdabalken (SFS 1958:637) och säkerställer korrekt hantering av laglott, särkullbarn och lagstadgad arvordning"
    },
    {
      icon: FileText,
      title: "Komplett dokumentation",
      description: "Få alla nödvändiga dokument för banker och myndigheter"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Digital Arvsskifte</h1>
              <p className="text-muted-foreground">Enkel och säker hantering av dödsbon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Genomför ett arvsskifte
            <span className="text-primary block">snabbt och säkert</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Vi gör arvskiften enklare och snabbare
          </p>
          
          {/* Pricing Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-blue-800">
              <FileText className="w-5 h-5" />
              <p className="font-medium">
                Komplett arvsskifteshandling: <span className="font-bold">200 SEK</span>
              </p>
            </div>
            <p className="text-sm text-blue-600 text-center mt-1">
              Betalning sker först när du är klar och nöjd med ditt arvsskifte
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleStartProcess} className="text-lg px-8 py-6">
              Starta nu
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="py-16 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Se hur enkelt det är</h3>
            <p className="text-lg text-muted-foreground">
              Testa vår interaktiva genomgång av hela arvsskiftesprocessen
            </p>
          </div>
          <InteractiveDemo />
        </div>
      </div>

      {/* How it works */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Så här fungerar det</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fyra enkla steg som tar dig från början till ett färdigt arvsskifte
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-20 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Varför välja oss?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vi gör arvsskiften enklare, snabbare och säkrare än traditionella metoder
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-6">
            Redo att börja ditt arvsskifte?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Det tar bara några minuter att komma igång. Alla dina uppgifter sparas säkert 
            och du kan avbryta när som helst.
          </p>
          <Button size="lg" onClick={handleStartProcess} className="text-lg px-8 py-6">
            Starta nu
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Legal Disclaimer */}
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Juridisk information:</strong> Detta system hjälper till att skapa arvsskiftesdokument enligt svensk lag (Ärvdabalken SFS 1958:637 med ändringar). Dokumenten följer lagstadgad arvordning eller testamentets bestämmelser med hänsyn till laglott enligt 7 kap. Ärvdabalken. <strong>Ansvarsfriskrivning:</strong> Vi tar inget ansvar för juridiska konsekvenser - sök juridisk rådgivning vid komplexa ärenden.
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>© 2024 Digital Arvsskifte. Alla rättigheter förbehållna.</div>
            <div className="flex gap-4">
              <a href="/integritet" className="hover:text-foreground transition-colors">Integritetspolicy</a>
              <a href="/villkor" className="hover:text-foreground transition-colors">Villkor</a>
              <a href="/support" className="hover:text-foreground transition-colors">Support & FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;