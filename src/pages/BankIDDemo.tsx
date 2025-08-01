import React, { useState } from 'react';
import { BankIDPhoneAuth } from '@/components/BankIDPhoneAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Info } from 'lucide-react';

interface BankIDResult {
  orderRef: string;
  completionData: {
    user: {
      personalNumber: string;
      name: string;
      givenName: string;
      surname: string;
    };
    device: {
      ipAddress: string;
      uhi: string;
    };
    signature: string;
    ocspResponse: string;
  };
}

export const BankIDDemo = () => {
  const [userVisibleData, setUserVisibleData] = useState('Logga in med BankID för demo');
  const [userNonVisibleData, setUserNonVisibleData] = useState('');
  const [personalNumber, setPersonalNumber] = useState('');
  const [result, setResult] = useState<BankIDResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showAuth, setShowAuth] = useState(false);

  const handleSuccess = (result: BankIDResult) => {
    console.log('BankID success:', result);
    setResult(result);
    setError('');
    setShowAuth(false);
  };

  const handleError = (error: string) => {
    console.error('BankID error:', error);
    setError(error);
    setResult(null);
  };

  const startNewAuth = () => {
    setResult(null);
    setError('');
    setShowAuth(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">BankID Phone Auth Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Demo av BankID Phone Auth API integration med QR-kod support, 
          automatisk app-start och real-time status polling.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Konfiguration */}
        <Card>
          <CardHeader>
            <CardTitle>Test-konfiguration</CardTitle>
            <CardDescription>
              Anpassa parametrar för BankID autentisering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visibleData">Synlig text för användaren</Label>
              <Textarea
                id="visibleData"
                value={userVisibleData}
                onChange={(e) => setUserVisibleData(e.target.value)}
                placeholder="Text som visas i BankID-appen"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nonVisibleData">Osynlig data (valfritt)</Label>
              <Textarea
                id="nonVisibleData"
                value={userNonVisibleData}
                onChange={(e) => setUserNonVisibleData(e.target.value)}
                placeholder="Osynlig data för servern (base64-kodas automatiskt)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalNumber">Personnummer (valfritt)</Label>
              <Input
                id="personalNumber"
                value={personalNumber}
                onChange={(e) => setPersonalNumber(e.target.value)}
                placeholder="YYYYMMDD-XXXX"
                maxLength={13}
              />
              <p className="text-xs text-muted-foreground">
                Lämna tomt för Phone Auth utan förspecificerat nummer
              </p>
            </div>

            <Button 
              onClick={startNewAuth} 
              className="w-full"
              disabled={showAuth}
            >
              Starta BankID Test
            </Button>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Test-miljö:</strong> Denna demo använder BankID:s test-API. 
                För riktiga implementationer krävs produktionscertifikat och konfiguration.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* BankID Autentisering */}
        <div className="space-y-6">
          {showAuth && (
            <BankIDPhoneAuth
              onSuccess={handleSuccess}
              onError={handleError}
              userVisibleData={userVisibleData}
              userNonVisibleData={userNonVisibleData || undefined}
              personalNumber={personalNumber || undefined}
            />
          )}

          {/* Resultat */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle>Autentisering lyckades!</CardTitle>
                </div>
                <CardDescription>
                  BankID autentisering slutförd framgångsrikt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Namn:</Label>
                    <p>{result.completionData.user.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Personnummer:</Label>
                    <p>{result.completionData.user.personalNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Förnamn:</Label>
                    <p>{result.completionData.user.givenName}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Efternamn:</Label>
                    <p>{result.completionData.user.surname}</p>
                  </div>
                  <div>
                    <Label className="font-medium">IP-adress:</Label>
                    <p>{result.completionData.device.ipAddress}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Order Ref:</Label>
                    <p className="font-mono text-xs">{result.orderRef}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Signatur:</Label>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {result.completionData.signature.substring(0, 100)}...
                  </div>
                </div>

                <Button 
                  onClick={startNewAuth}
                  variant="outline"
                  className="w-full"
                >
                  Testa igen
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Felmeddelande */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Fel:</strong> {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Implementationsinfo */}
      <Card>
        <CardHeader>
          <CardTitle>Implementationsdetaljer</CardTitle>
          <CardDescription>
            Teknisk information om BankID Phone Auth integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Funktioner som implementerats:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>BankID Phone Auth API (v5.1) integration</li>
                <li>Automatisk IP-adress detektion på server-sidan</li>
                <li>QR-kod generering för desktop-användare</li>
                <li>Automatisk BankID app-start på mobila enheter</li>
                <li>Real-time status polling (var 2:a sekund)</li>
                <li>120 sekunder timeout med countdown</li>
                <li>Omfattande felhantering och användarfeedback</li>
                <li>Säker hantering av certifikat via Supabase secrets</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">BankID API endpoints som används:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground font-mono text-xs">
                <li>POST /rp/v5.1/auth - Initiera autentisering</li>
                <li>POST /rp/v5.1/collect - Hämta status</li>
                <li>POST /rp/v5.1/cancel - Avbryt transaktion</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Status-hantering:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><code>pending</code> - Väntar på användarinteraktion</li>
                <li><code>complete</code> - Autentisering slutförd</li>
                <li><code>failed</code> - Autentisering misslyckades</li>
                <li>Hint codes för detaljerad användarfeedback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};