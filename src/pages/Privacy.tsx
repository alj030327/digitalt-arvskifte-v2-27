import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
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
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Digital Arvsskifte</h1>
              <p className="text-muted-foreground">Integritetspolicy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4">
              Integritetspolicy – Digitalt Arvskifte
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none dark:prose-invert">
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">1. Ansvarig för personuppgifter</h3>
                <p className="text-muted-foreground">
                  Digitalt Arvskifte är personuppgiftsansvarig för den behandling av personuppgifter som sker inom ramen för vår tjänst.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">2. Vilka uppgifter samlar vi in?</h3>
                <p className="text-muted-foreground">
                  Vi samlar endast in de personuppgifter som användaren själv fyller i för att kunna generera arvskifteshandlingen. Dessa kan omfatta namn, personnummer, adresser, kontaktuppgifter och uppgifter om tillgångar.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">3. Hur används uppgifterna?</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Uppgifterna används enbart för att skapa den valda handlingen.</p>
                  <p>Vi sparar inte uppgifterna längre än vad som är nödvändigt för att leverera tjänsten.</p>
                  <p>Efter att dokumentet genererats kan uppgifterna raderas permanent från våra system.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">4. Delning av uppgifter</h3>
                <p className="text-muted-foreground">
                  Vi delar inte personuppgifter med tredje part, förutom om det krävs enligt lag eller myndighetsbeslut.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">5. Lagring och säkerhet</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Alla uppgifter behandlas konfidentiellt och lagras på säkra servrar.</p>
                  <p>Vi använder tekniska och organisatoriska åtgärder för att skydda uppgifterna mot obehörig åtkomst, förlust eller manipulation.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">6. Betalningsinformation</h3>
                <p className="text-muted-foreground">
                  Betalningar hanteras av vår betalningsleverantör (t.ex. Stripe). Vi har ingen åtkomst till och lagrar inte känsliga betalningsuppgifter som kortnummer.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">7. Användarens rättigheter</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Du har rätt att:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Begära utdrag av de uppgifter vi behandlar om dig.</li>
                    <li>Begära rättelse eller radering av dina uppgifter.</li>
                    <li>Invända mot viss behandling av personuppgifter.</li>
                  </ul>
                  <p>För att utöva dina rättigheter, kontakta oss på [din e-postadress].</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">8. Ändringar av policyn</h3>
                <p className="text-muted-foreground">
                  Vi kan komma att uppdatera denna integritetspolicy. Den senaste versionen finns alltid publicerad på vår webbplats.
                </p>
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

export default Privacy;