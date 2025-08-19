import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Scale, ArrowLeft, HelpCircle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    message: ""
  });

  const handleBackHome = () => {
    navigate("/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.message) {
      toast({
        title: "Fyll i alla fält",
        description: "Både namn och meddelande krävs för att skicka meddelandet.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the form data to your backend
    toast({
      title: "Meddelande skickat!",
      description: "Vi kommer att svara så snart som möjligt.",
    });
    
    setFormData({ name: "", message: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const faqs = [
    {
      question: "Vad är Digitalt Arvskifte?",
      answer: "Digitalt Arvskifte följer svensk lagstiftning enligt Ärvdabalken (SFS 1958:637). Systemet hjälper dig skapa juridiskt korrekt arvsskiftesdokument som följer lagstadgad arvordning eller testamentets bestämmelser med hänsyn till laglott. Dokumenten är designade för att uppfylla myndighetskrav men ersätter inte juridisk rådgivning vid komplexa ärenden."
    },
    {
      question: "Hur fungerar tjänsten?",
      answer: "Du går igenom fyra steg där du fyller i uppgifter om dödsbo, arvtagare, tillgångar och fördelning. Vi räknar automatiskt ut arvsandelar och sammanställer dokumentet. När allt är klart laddar du ner PDF:en och kan skriva ut och signera den."
    },
    {
      question: "Är mina uppgifter säkra?",
      answer: "Ja! Vi lagrar uppgifterna endast under den tid som behövs för att generera dokumentet. Efter nedladdning kan uppgifterna raderas permanent. Vi använder säker teknik för att skydda dina uppgifter."
    },
    {
      question: "Kan jag använda tjänsten på mobilen eller surfplatta?",
      answer: "Ja, Digitalt Arvskifte fungerar på både dator, mobil och surfplatta."
    },
    {
      question: "Vad händer om banken inte godkänner dokumentet?",
      answer: "Vi garanterar att systemet följer svensk lagstiftning (Ärvdabalken, Äktenskapsbalken, Föräldrabalken) och korrekt hantering av laglott och särkullbarn. Vi tar ansvar för tekniska fel i systemet men inte för felaktiga uppgifter eller komplexa juridiska situationer som kräver professionell rådgivning."
    },
    {
      question: "Kan jag göra ändringar efter att jag laddat ner PDF:en?",
      answer: "Du kan alltid gå tillbaka och ändra uppgifterna i tjänsten och generera en ny PDF. Observera att redan nedladdade dokument inte ändras automatiskt."
    },
    {
      question: "Tar ni betalt?",
      answer: "Ja, vi tar betalt per användning (engångsavgift). När du genomför köpet via Stripe får du omedelbar tillgång till PDF:en."
    },
    {
      question: "Vad händer om jag fyller i fel uppgifter?",
      answer: "Det är användarens ansvar att fylla i korrekta uppgifter. Vi tar endast ansvar för tekniska problem i tjänsten, inte för felaktiga uppgifter eller juridiska konsekvenser."
    },
    {
      question: "Hur kontaktar jag er?",
      answer: "Om du har frågor eller vill begära återbetalning vid tekniska problem kan du kontakta oss på: [din e-postadress]."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleBackHome} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Digital Arvsskifte</h1>
              <p className="text-muted-foreground">Support & FAQ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Kontakta oss
            </CardTitle>
            <p className="text-muted-foreground">
              Har du frågor om refunds, tjänsten eller något annat? Skicka oss ett meddelande så svarar vi så snart som möjligt.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Ditt namn</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ange ditt namn"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Meddelande</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Beskriv din fråga eller ditt ärende..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Skicka meddelande
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>FAQ – Digitalt Arvskifte</CardTitle>
            <p className="text-muted-foreground">
              Här hittar du svar på de vanligaste frågorna om vår tjänst.
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={handleBackHome} size="lg" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till startsidan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Support;