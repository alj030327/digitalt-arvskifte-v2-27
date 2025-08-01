import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';
import QRCode from 'qrcode';

interface BankIDPhoneAuthProps {
  onSuccess: (result: BankIDResult) => void;
  onError: (error: string) => void;
  userVisibleData?: string;
  userNonVisibleData?: string;
  personalNumber?: string;
}

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

interface BankIDSession {
  orderRef: string;
  autoStartToken?: string;
  qrStartToken?: string;
  qrStartSecret?: string;
  qrCodeData?: string;
}

interface BankIDStatus {
  orderRef: string;
  status: 'pending' | 'complete' | 'failed';
  hintCode?: string;
  completionData?: BankIDResult['completionData'];
}

type AuthStatus = 'idle' | 'starting' | 'waiting' | 'scanning' | 'signing' | 'complete' | 'failed' | 'timeout';

const STATUS_MESSAGES = {
  idle: 'Klicka för att starta BankID-autentisering',
  starting: 'Startar BankID-autentisering...',
  waiting: 'Väntar på BankID-appen att öppnas',
  scanning: 'Scanna QR-koden med BankID-appen',
  signing: 'Signera med BankID-appen',
  complete: 'Autentisering slutförd!',
  failed: 'Autentisering misslyckades',
  timeout: 'Autentisering timeout - försök igen'
};

const HINT_CODE_MESSAGES = {
  outstandingTransaction: 'Startar BankID-appen...',
  noClient: 'BankID-appen är inte installerad eller startad',
  started: 'BankID-appen har startats',
  userSign: 'Väntar på att du signerar',
  userCancel: 'Användaren avbröt signeringen',
  cancelled: 'Signeringen avbröts',
  expiredTransaction: 'Signeringen tog för lång tid',
  certificateErr: 'Problem med BankID-certifikatet',
  startFailed: 'Kunde inte starta BankID-appen'
};

export const BankIDPhoneAuth: React.FC<BankIDPhoneAuthProps> = ({
  onSuccess,
  onError,
  userVisibleData = "Logga in med BankID",
  userNonVisibleData,
  personalNumber
}) => {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [session, setSession] = useState<BankIDSession | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minuter
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Rensa timers vid unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (status === 'waiting' || status === 'scanning' || status === 'signing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setStatus('timeout');
            handleCancel();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status]);

  // Generera QR-kod när session är tillgänglig
  useEffect(() => {
    if (session?.qrCodeData) {
      generateQRCode(session.qrCodeData);
    }
  }, [session]);

  const generateQRCode = async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setErrorMessage('Kunde inte generera QR-kod');
    }
  };

  const startAuthentication = async () => {
    setStatus('starting');
    setErrorMessage('');
    setTimeLeft(120);

    try {
      // Förbered request data
      const requestData = {
        endUserIp: '', // Kommer att auto-detekteras av Edge Function
        requirement: {
          allowFingerprint: true,
          autoStartTokenRequired: true
        },
        userVisibleData: btoa(unescape(encodeURIComponent(userVisibleData))),
        ...(userNonVisibleData && { 
          userNonVisibleData: btoa(unescape(encodeURIComponent(userNonVisibleData))) 
        }),
        ...(personalNumber && { personalNumber })
      };

      console.log('🔐 Starting BankID Phone Auth:', requestData);

      const response = await fetch('https://tjnqelwplalrsepzqotb.supabase.co/functions/v1/bankid-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbnFlbHdwbGFscnNlcHpxb3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjg2NTIsImV4cCI6MjA2ODk0NDY1Mn0.tSqdJ-zT9AIDhotT_0zWoKfetC1DYUxMw1TciT_9iPs`,
        },
        body: JSON.stringify({ endpoint: 'auth', data: requestData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'BankID autentisering misslyckades');
      }

      const result: BankIDSession = await response.json();
      setSession(result);
      setStatus('waiting');

      // Försök öppna BankID-appen automatiskt
      if (result.autoStartToken) {
        openBankIDApp(result.autoStartToken);
      }

      // Starta polling för status
      startPolling(result.orderRef);

    } catch (error) {
      console.error('BankID auth error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Något gick fel');
      setStatus('failed');
      onError(error instanceof Error ? error.message : 'Något gick fel');
    }
  };

  const openBankIDApp = (autoStartToken: string) => {
    const bankIdUrl = `bankid:///?autostarttoken=${autoStartToken}&redirect=null`;
    
    // Detektera om vi är på mobil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Attempting to open BankID app on mobile device');
      
      // Skapa dold iframe för att trigga app-start
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = bankIdUrl;
      document.body.appendChild(iframe);
      
      // Rensa upp efter kort delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
      // Försök också med direct window location
      setTimeout(() => {
        window.location.href = bankIdUrl;
      }, 100);
    } else {
      console.log('🖥️ Desktop detected - showing QR code for manual app opening');
      setStatus('scanning');
    }
  };

  const startPolling = (orderRef: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch('https://tjnqelwplalrsepzqotb.supabase.co/functions/v1/bankid-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbnFlbHdwbGFscnNlcHpxb3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjg2NTIsImV4cCI6MjA2ODk0NDY1Mn0.tSqdJ-zT9AIDhotT_0zWoKfetC1DYUxMw1TciT_9iPs`,
          },
          body: JSON.stringify({ endpoint: 'collect', data: { orderRef } }),
        });

        if (!response.ok) {
          throw new Error('Polling failed');
        }

        const result: BankIDStatus = await response.json();
        
        // Uppdatera status baserat på hint codes
        if (result.hintCode) {
          if (result.hintCode === 'userSign') {
            setStatus('signing');
          } else if (result.hintCode === 'started') {
            setStatus('waiting');
          }
        }

        if (result.status === 'complete') {
          setStatus('complete');
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (result.completionData) {
            onSuccess({
              orderRef: result.orderRef,
              completionData: result.completionData
            });
          }
        } else if (result.status === 'failed') {
          setStatus('failed');
          if (pollingRef.current) clearInterval(pollingRef.current);
          const errorMsg = result.hintCode ? 
            HINT_CODE_MESSAGES[result.hintCode as keyof typeof HINT_CODE_MESSAGES] || result.hintCode :
            'Autentisering misslyckades';
          setErrorMessage(errorMsg);
          onError(errorMsg);
        }

      } catch (error) {
        console.error('Polling error:', error);
        if (pollingRef.current) clearInterval(pollingRef.current);
        setStatus('failed');
        setErrorMessage('Anslutningsfel vid polling');
        onError('Anslutningsfel vid polling');
      }
    }, 2000); // Polla var 2:a sekund
  };

  const handleCancel = async () => {
    if (session?.orderRef) {
      try {
        await fetch('https://tjnqelwplalrsepzqotb.supabase.co/functions/v1/bankid-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbnFlbHdwbGFscnNlcHpxb3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjg2NTIsImV4cCI6MjA2ODk0NDY1Mn0.tSqdJ-zT9AIDhotT_0zWoKfetC1DYUxMw1TciT_9iPs`,
          },
          body: JSON.stringify({ endpoint: 'cancel', data: { orderRef: session.orderRef } }),
        });
      } catch (error) {
        console.error('Cancel error:', error);
      }
    }

    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('idle');
    setSession(null);
    setQrCodeUrl('');
    setErrorMessage('');
    setTimeLeft(120);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'starting':
      case 'waiting':
      case 'signing':
        return <Loader2 className="h-6 w-6 animate-spin" />;
      case 'scanning':
        return <QrCode className="h-6 w-6" />;
      case 'complete':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'failed':
      case 'timeout':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Smartphone className="h-6 w-6" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {getStatusIcon()}
        </div>
        <CardTitle>BankID Autentisering</CardTitle>
        <CardDescription>
          {STATUS_MESSAGES[status]}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Timer */}
        {(status === 'waiting' || status === 'scanning' || status === 'signing') && (
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Tid kvar: {formatTime(timeLeft)}</span>
          </div>
        )}

        {/* QR-kod för desktop */}
        {status === 'scanning' && qrCodeUrl && (
          <div className="text-center space-y-4">
            <img 
              src={qrCodeUrl} 
              alt="BankID QR Code" 
              className="mx-auto border border-border rounded-lg"
            />
            <p className="text-sm text-muted-foreground">
              Scanna QR-koden med BankID-appen på din telefon
            </p>
          </div>
        )}

        {/* Felmeddelande */}
        {errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Handlingsknappar */}
        <div className="flex flex-col space-y-2">
          {status === 'idle' && (
            <Button onClick={startAuthentication} className="w-full">
              <Smartphone className="w-4 h-4 mr-2" />
              Starta BankID
            </Button>
          )}
          
          {(status === 'waiting' || status === 'scanning' || status === 'signing') && (
            <Button variant="outline" onClick={handleCancel} className="w-full">
              Avbryt
            </Button>
          )}
          
          {(status === 'failed' || status === 'timeout') && (
            <Button onClick={startAuthentication} className="w-full">
              Försök igen
            </Button>
          )}
        </div>

        {/* Instruktioner */}
        {status === 'waiting' && (
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Om BankID-appen inte öppnas automatiskt, öppna den manuellt och välj "Autentisering pågår".
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};