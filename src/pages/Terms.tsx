import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

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
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Digital Arvsskifte</h1>
              <p className="text-muted-foreground">Villkor för användning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4">
              Villkor för användning av Digitalt Arvskifte
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none dark:prose-invert">
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Tjänstens natur</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Digitalt Arvskifte tillhandahåller digitala mallar och verktyg för att underlätta framtagandet av arvskifteshandlingar.</p>
                  <p>Tjänsten hjälper till att skapa arvsskiftesdokument enligt svensk lagstiftning (Ärvdabalken SFS 1958:637, Äktenskapsbalken, Föräldrabalken). Systemet hanterar lagstadgad arvordning, laglott och särkullbarn enligt gällande lagar. Tjänsten ersätter inte juridisk rådgivning vid komplexa ärenden eller tvister.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Användarens ansvar</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Användaren ansvarar själv för att granska, komplettera och använda dokumenten korrekt.</p>
                  <p>Användaren ansvarar även för att kontrollera att handlingarna accepteras av berörda myndigheter, banker eller övriga institutioner.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Ansvarsbegränsning</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Digitalt Arvskifte ansvarar för att systemet följer svensk lagstiftning och korrekt hantering av arvsregler. Vi ansvarar inte för användarens felaktiga uppgifter, komplexa juridiska situationer som kräver professionell rådgivning, eller juridiska konsekvenser av felaktigt ifyllda uppgifter.</p>
                  <p>Vårt ansvar begränsas till att tjänsten fungerar tekniskt, dvs. att ifyllning och nedladdning sker på avsett sätt.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Återbetalningspolicy</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Återbetalning medges om det uppstår ett tekniskt fel som gör att användaren inte kan ladda ner eller använda sitt dokument.</p>
                  <p>Återbetalning kan även medges om handlingen, trots korrekt användning, inte accepteras av exempelvis en bank eller myndighet. I dessa fall ska användaren kunna uppvisa handlingen i inskannat format för att vi ska kunna bedöma ärendet.</p>
                  <p>Vi gör en individuell bedömning i varje ärende och förbehåller oss rätten att neka återbetalning om handlingen använts på ett felaktigt sätt eller om uppgifterna fyllts i bristfälligt.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Immateriella rättigheter</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Alla mallar, instruktioner och digitala verktyg tillhör Digitalt Arvskifte och får endast användas av köparen för privat bruk.</p>
                  <p>Vidarekopiering, spridning eller försäljning av materialet är inte tillåtet.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Tillämplig lag</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Dessa villkor regleras av svensk lag. Eventuella tvister ska i första hand lösas genom dialog mellan parterna.</p>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-border text-center">
              <Button onClick={handleBackHome} size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka till startsidan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;