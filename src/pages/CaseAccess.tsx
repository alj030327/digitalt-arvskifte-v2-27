import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Loader2, Users, Calendar, CreditCard, Shield, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CaseAccess = () => {
  const { access_token } = useParams<{ access_token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    if (access_token) {
      loadCase();
    }
  }, [access_token]);

  const loadCase = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('case_number', access_token)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: "Ärende hittades inte",
          description: "Länken är ogiltig eller ärendet finns inte längre.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setCaseData(data);
    } catch (error: any) {
      console.error('Error loading case:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda ärendet.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const generateSigningLink = async () => {
    try {
      // Create signing request
      const { data, error } = await supabase
        .from('signing_requests')
        .insert({
          user_id: caseData.customer_id,
          email: caseData.email || '',
          inheritance_data: caseData,
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const signingUrl = `${window.location.origin}/sign/${data.token}`;
      
      // Open in new tab
      window.open(signingUrl, '_blank');
      
      toast({
        title: "Signeringslänk skapad",
        description: "Signeringslänken öppnades i en ny flik.",
      });
    } catch (error: any) {
      console.error('Error creating signing link:', error);
      toast({
        title: "Fel",
        description: "Kunde inte skapa signeringslänk.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Laddar ärende...</span>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Ärende hittades inte</CardTitle>
            <CardDescription>
              Länken är ogiltig eller ärendet finns inte längre.
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

  const inheritanceData = caseData.inheritance_data || {};
  const deceased = inheritanceData.deceased || {};
  const heirs = inheritanceData.heirs || [];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              Digitalt Arvsskifte - {caseData.case_number}
            </CardTitle>
            <CardDescription>
              Hantera och signera ditt arvsskifte online
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status */}
            <Alert className={caseData.payment_status === 'paid' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
              {caseData.payment_status === 'paid' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription>
                <div className={`font-medium ${caseData.payment_status === 'paid' ? 'text-green-800' : 'text-yellow-800'}`}>
                  Status: {caseData.payment_status === 'paid' ? 'Aktivt' : 'Väntande betalning'}
                </div>
                <div className={`text-sm mt-1 ${caseData.payment_status === 'paid' ? 'text-green-700' : 'text-yellow-700'}`}>
                  {caseData.payment_status === 'paid' 
                    ? 'Ditt arvsskifte är aktivt och redo för hantering'
                    : 'Betalning krävs för att aktivera ärendet'
                  }
                </div>
              </AlertDescription>
            </Alert>

            {/* Case Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ärendeinformation
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ärendenummer:</span>
                    <span className="font-medium">{caseData.case_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>E-post:</span>
                    <span>{caseData.email}</span>
                  </div>
                  {caseData.phone && (
                    <div className="flex justify-between">
                      <span>Telefon:</span>
                      <span>{caseData.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Skapad:</span>
                    <span>{new Date(caseData.created_at).toLocaleDateString('sv-SE')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Betalningsinformation
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Belopp:</span>
                    <span className="font-medium">{(caseData.total_amount / 100).toFixed(2)} SEK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${caseData.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {caseData.payment_status === 'paid' ? 'Betald' : 'Obetald'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deceased Info */}
            {deceased.name && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Avliden person</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Namn:</strong> {deceased.name}</div>
                  {deceased.personalNumber && (
                    <div><strong>Personnummer:</strong> {deceased.personalNumber}</div>
                  )}
                  {deceased.deathDate && (
                    <div><strong>Dödsdatum:</strong> {new Date(deceased.deathDate).toLocaleDateString('sv-SE')}</div>
                  )}
                </div>
              </div>
            )}

            {/* Heirs */}
            {heirs.length > 0 && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Arvtagare</h3>
                <div className="space-y-2">
                  {heirs.map((heir: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <div className="font-medium">{heir.name}</div>
                        {heir.personalNumber && (
                          <div className="text-muted-foreground text-xs">{heir.personalNumber}</div>
                        )}
                      </div>
                      <div className="text-right">
                        {heir.inheritance && (
                          <div className="font-medium">{Number(heir.inheritance).toLocaleString('sv-SE')} SEK</div>
                        )}
                        {heir.percentage && (
                          <div className="text-xs text-muted-foreground">{heir.percentage}%</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {caseData.payment_status === 'paid' && (
                <Button onClick={generateSigningLink} className="flex-1">
                  <Shield className="w-4 h-4 mr-2" />
                  Skapa signeringslänk
                </Button>
              )}
              
              <Button variant="outline" onClick={() => navigate('/')}>
                Tillbaka till startsidan
              </Button>
            </div>

            {/* Help */}
            <Alert>
              <AlertDescription>
                <div className="font-medium">Behöver du hjälp?</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Kontakta oss på support@digitalarvsskifte.se för assistans med ditt ärende.
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};