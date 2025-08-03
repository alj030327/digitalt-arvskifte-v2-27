import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, FileText, Loader2, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BankIdService } from "@/services/bankidService";

interface SigningRequest {
  id: string;
  token: string;
  email: string;
  inheritance_data: any;
  expires_at: string;
  signed_at?: string;
  signature_data?: any;
  created_at: string;
}

export const SignDocument = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [signingRequest, setSigningRequest] = useState<SigningRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [bankIdSession, setBankIdSession] = useState<any>(null);
  const [statusChecking, setStatusChecking] = useState(false);

  useEffect(() => {
    if (token) {
      loadSigningRequest();
    }
  }, [token]);

  const loadSigningRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('signing_requests')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: "Dokument hittades inte",
          description: "Signeringslänken är ogiltig eller har gått ut.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        toast({
          title: "Länken har gått ut",
          description: "Denna signeringslänk har gått ut. Kontakta avsändaren för en ny länk.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setSigningRequest(data);
    } catch (error: any) {
      console.error('Error loading signing request:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda signeringsdokumentet.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signingRequest) return;

    setSigning(true);
    
    try {
      // Create signing data
      const signingData = {
        endUserIp: "127.0.0.1", // In production, get real IP
        userVisibleData: `Signering av arvskifte för ${signingRequest.inheritance_data.deceased?.name || 'okänd person'}`,
        userNonVisibleData: JSON.stringify({
          documentId: signingRequest.id,
          timestamp: new Date().toISOString(),
          inheritanceData: signingRequest.inheritance_data
        })
      };

      // Start BankID signing
      const session = await BankIdService.sign(signingData);
      
      if (!session) {
        throw new Error("Kunde inte starta BankID-signering");
      }

      setBankIdSession(session);
      setStatusChecking(true);
      
      // Start polling for status
      pollSigningStatus(session.orderRef);
      
    } catch (error: any) {
      console.error('Error starting signing:', error);
      toast({
        title: "Fel",
        description: "Kunde inte starta signeringen. Försök igen.",
        variant: "destructive",
      });
      setSigning(false);
    }
  };

  const pollSigningStatus = async (orderRef: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await BankIdService.checkStatus(orderRef);
        
        if (!status) return;

        if (status.status === 'complete' && status.completionData) {
          clearInterval(pollInterval);
          await completeSignature(status.completionData);
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setStatusChecking(false);
          setSigning(false);
          toast({
            title: "Signering misslyckades",
            description: status.hintCode === 'userCancel' ? 
              "Signeringen avbröts av användaren." : 
              "Signeringen misslyckades. Försök igen.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking status:', error);
        clearInterval(pollInterval);
        setStatusChecking(false);
        setSigning(false);
        toast({
          title: "Fel",
          description: "Kunde inte kontrollera signeringsstatus.",
          variant: "destructive",
        });
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setStatusChecking(false);
      setSigning(false);
    }, 300000);
  };

  const completeSignature = async (completionData: any) => {
    try {
      const { error } = await supabase
        .from('signing_requests')
        .update({
          signed_at: new Date().toISOString(),
          signature_data: completionData
        })
        .eq('id', signingRequest!.id);

      if (error) {
        throw error;
      }

      setStatusChecking(false);
      setSigning(false);
      
      toast({
        title: "Signering genomförd!",
        description: "Dokumentet har signerats framgångsrikt.",
      });

      // Update local state
      setSigningRequest(prev => prev ? {
        ...prev,
        signed_at: new Date().toISOString(),
        signature_data: completionData
      } : null);

    } catch (error: any) {
      console.error('Error completing signature:', error);
      toast({
        title: "Fel",
        description: "Kunde inte slutföra signeringen.",
        variant: "destructive",
      });
      setStatusChecking(false);
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Laddar dokument...</span>
        </div>
      </div>
    );
  }

  if (!signingRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Dokument hittades inte</CardTitle>
            <CardDescription>
              Signeringslänken är ogiltig eller har gått ut.
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
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {signingRequest.signed_at ? 'Dokument signerat' : 'Signering av arvskifte'}
            </CardTitle>
            <CardDescription>
              {signingRequest.signed_at 
                ? 'Detta dokument har redan signerats'
                : 'Granska och signera arvskiftesdokumentet med BankID'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Document Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Dokumentinformation</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Avliden: {signingRequest.inheritance_data.deceased?.name || 'Ej specificerat'}</div>
                <div>Skickat till: {signingRequest.email}</div>
                <div>Skapat: {new Date(signingRequest.created_at).toLocaleString('sv-SE')}</div>
                <div>Giltigt till: {new Date(signingRequest.expires_at).toLocaleString('sv-SE')}</div>
              </div>
            </div>

            {/* Inheritance Details */}
            {signingRequest.inheritance_data.heirs && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Arvfördelning</h3>
                <div className="space-y-2">
                  {signingRequest.inheritance_data.heirs.map((heir: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{heir.name}</span>
                      <span>{heir.inheritance} SEK</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signing Status */}
            {signingRequest.signed_at ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Dokumentet har signerats</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Signerat: {new Date(signingRequest.signed_at).toLocaleString('sv-SE')}
                  </div>
                </AlertDescription>
              </Alert>
            ) : statusChecking ? (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  <div className="font-medium">Väntar på BankID-signering...</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Öppna BankID-appen och följ instruktionerna för att signera dokumentet.
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Säker signering med BankID</span>
                </div>
                
                <Button 
                  onClick={handleSign}
                  disabled={signing}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Startar BankID...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Signera med BankID
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Expiry Warning */}
            {!signingRequest.signed_at && (
              <Alert variant="default">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Denna signeringslänk gäller till {new Date(signingRequest.expires_at).toLocaleString('sv-SE')}.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};