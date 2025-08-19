import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, ExternalLink, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const case_id = searchParams.get('case_id');
  const access_token = searchParams.get('access_token');
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [projectUrl, setProjectUrl] = useState('');

  useEffect(() => {
    if (case_id && access_token) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [case_id, access_token]);

  const verifyPayment = async () => {
    try {
      // Verify payment status
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
        body: { case_id }
      });

      if (verifyError) {
        throw verifyError;
      }

      if (verifyData.payment_status === 'paid') {
        setVerified(true);
        
        // Get case data
        const { data: caseInfo, error: caseError } = await supabase
          .from('cases')
          .select('*')
          .eq('id', case_id)
          .single();

        if (caseError) {
          throw caseError;
        }

        setCaseData(caseInfo);
        setProjectUrl(`${window.location.origin}/case/${access_token}`);
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      toast({
        title: "Verifieringsfel",
        description: "Kunde inte verifiera betalningen. Kontakta support om problemet kvarstår.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyProjectUrl = () => {
    navigator.clipboard.writeText(projectUrl);
    toast({
      title: "Länk kopierad!",
      description: "Projektlänken har kopierats till urklipp.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verifierar betalning...</span>
        </div>
      </div>
    );
  }

  if (!case_id || !access_token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Ogiltig länk</CardTitle>
            <CardDescription>
              Betalningsinformationen saknas eller är felaktig.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Tillbaka till startsidan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Betalning genomförd!
            </CardTitle>
            <CardDescription>
              Tack för din betalning. Ditt digitala arvsskifte är nu aktivt.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {verified && caseData && (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="font-medium text-green-800">Ärendet har aktiverats</div>
                    <div className="text-sm text-green-700 mt-1">
                      Ärendenummer: {caseData.case_number}
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Orderdetaljer</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Arvsskifte för:</span>
                      <span>{caseData.inheritance_data?.deceased?.name || 'Okänd person'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Belopp:</span>
                      <span>{(caseData.total_amount / 100).toFixed(2)} SEK</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-medium">Betald</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800">Kom åt ditt arvsskifte</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Spara denna länk säkert. Du kan använda den för att komma åt och hantera ditt arvsskifte när som helst:
                  </p>
                  
                  <div className="flex gap-2 mb-3">
                    <Button 
                      onClick={() => window.open(projectUrl, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Öppna arvsskifte
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={copyProjectUrl}
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-blue-600 font-mono bg-white p-2 rounded border break-all">
                    {projectUrl}
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <div className="font-medium">E-postkvitto skickat</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Ett kvitto och instruktioner har skickats till {caseData.email}
                    </div>
                  </AlertDescription>
                </Alert>
              </>
            )}

            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                Tillbaka till startsidan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};