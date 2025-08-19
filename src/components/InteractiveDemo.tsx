import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Scale, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react';

const InteractiveDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSteps = [
    {
      icon: Users,
      title: "Registrera dödsbodelägare",
      description: "Ange personnummer för den avlidne och alla dödsbodelägare",
      details: "Systemet hämtar automatiskt namn och adresser från folkbokföringen",
      mockContent: {
        deceased: "Karl Andersson (19450312-1234)",
        owners: ["Anna Andersson (19701205-5678)", "Erik Andersson (19751120-9012)"]
      }
    },
    {
      icon: FileText,
      title: "Inventera tillgångar",
      description: "Lägg till banktillgångar, fastigheter och skulder",
      details: "Koppla till banker för automatisk hämtning av kontosaldon",
      mockContent: {
        bankAccounts: ["Swedbank: 450 000 kr", "Nordea: 125 000 kr"],
        properties: ["Villan på Storgatan 15: 2 800 000 kr"],
        debts: ["Bolån: -1 200 000 kr"]
      }
    },
    {
      icon: Scale,
      title: "Fördela arvet",
      description: "Ange hur tillgångarna ska fördelas mellan arvtagarna",
      details: "Följer automatiskt laglott eller specifikt testamente",
      mockContent: {
        distribution: ["Anna Andersson: 50%", "Erik Andersson: 50%"],
        amounts: ["Anna: 987 500 kr", "Erik: 987 500 kr"]
      }
    },
    {
      icon: CheckCircle,
      title: "Generera dokument",
      description: "Skapa färdiga arvsskiftesdokument för signering",
      details: "PDF-dokument redo för utskrift och fysisk signering",
      mockContent: {
        documents: ["Arvskifteshandling", "Skattedeklaration för dödsbo", "Kvitto på skattsedel"]
      }
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            const nextStep = (currentStep + 1) % demoSteps.length;
            setCurrentStep(nextStep);
            return 0;
          }
          return newProgress;
        });
      }, 50); // 5 seconds per step (100 * 50ms)
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, demoSteps.length]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const currentStepData = demoSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Demo Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Interaktiv genomgång</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${(currentStep * 25) + (progress * 0.25)}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {demoSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                index === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Steg {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Step Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">{currentStepData.title}</h4>
                <p className="text-sm text-muted-foreground">Steg {currentStep + 1} av {demoSteps.length}</p>
              </div>
            </div>
            
            <p className="text-foreground">{currentStepData.description}</p>
            <p className="text-sm text-muted-foreground">{currentStepData.details}</p>
          </div>

          {/* Mock Content */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Exempel på data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentStep === 0 && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Avliden:</span> {currentStepData.mockContent.deceased}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Dödsbodelägare:</span>
                    <ul className="mt-1 space-y-1">
                      {currentStepData.mockContent.owners.map((owner, idx) => (
                        <li key={idx} className="text-muted-foreground ml-2">• {owner}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Bankkonton:</span>
                    <ul className="mt-1 space-y-1">
                      {currentStepData.mockContent.bankAccounts.map((account, idx) => (
                        <li key={idx} className="text-muted-foreground ml-2">• {account}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Fastigheter:</span>
                    <ul className="mt-1 space-y-1">
                      {currentStepData.mockContent.properties.map((property, idx) => (
                        <li key={idx} className="text-muted-foreground ml-2">• {property}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Skulder:</span>
                    <ul className="mt-1 space-y-1">
                      {currentStepData.mockContent.debts.map((debt, idx) => (
                        <li key={idx} className="text-muted-foreground ml-2">• {debt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Fördelning:</span>
                    <ul className="mt-1 space-y-1">
                      {currentStepData.mockContent.distribution.map((dist, idx) => (
                        <li key={idx} className="text-muted-foreground ml-2">• {dist}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Belopp:</span>
                    <ul className="mt-1 space-y-1">
                      {currentStepData.mockContent.amounts.map((amount, idx) => (
                        <li key={idx} className="text-muted-foreground ml-2">• {amount}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Genererade dokument:</span>
                    <ul className="mt-1 space-y-1">
                      {currentStepData.mockContent.documents.map((doc, idx) => (
                        <li key={idx} className="text-muted-foreground ml-2">• {doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;