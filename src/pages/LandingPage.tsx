import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Users, FileText, CheckCircle, Clock, Shield, ArrowRight, Play } from "lucide-react";
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
      description: "Specificera hur tillgångarna ska fördelas mellan arvtagarna enligt lag eller testamente."
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
      title: "Juridiskt säkert",
      description: "Alla dokument följer svensk lag och är juridiskt bindande"
    },
    {
      icon: FileText,
      title: "Komplett dokumentation",
      description: "Få alla nödvändiga dokument för Skatteverket och banker"
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
            Vår digitala plattform guidar dig genom hela arvsskiftesprocessen steg för steg. 
            Från inventering av tillgångar till färdiga dokument för Skatteverket.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleStartProcess} className="text-lg px-8 py-6">
              Starta arvsskifte
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Play className="w-5 h-5 mr-2" />
              Se hur det fungerar
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
            Starta nu - Det är gratis
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
              <strong>Ansvarsfriskrivning:</strong> Vi på Digitalt Arvskifte, tar inget ansvar för de kostnadsfria juridiska mallar och avtal som publiceras. Använd dokumenten på eget ansvar.
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>© 2024 Digital Arvsskifte. Alla rättigheter förbehållna.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Integritetspolicy</a>
              <a href="#" className="hover:text-foreground transition-colors">Villkor</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;