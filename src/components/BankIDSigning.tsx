import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRCode from 'react-qr-code';
import { BankIdService } from '@/services/bankidService';
import { Smartphone, Monitor, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface BankIDSigningProps {
  personalNumber: string;
  userVisibleData: string;
  onSuccess: (completionData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const BankIDSigning = ({ 
  personalNumber, 
  userVisibleData, 
  onSuccess, 
  onError, 
  onCancel 
}: BankIDSigningProps) => {
  const [isInitiating, setIsInitiating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'complete' | 'failed'>('idle');
  const [hintCode, setHintCode] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const [orderTime, setOrderTime] = useState<number>(0);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  useEffect(() => {
    if (session?.qrStartToken && session?.qrStartSecret && orderTime > 0) {
      // Generate initial QR code data
      const qrData = BankIdService.generateQRCodeData(session.qrStartToken, session.qrStartSecret, orderTime);
      setQrCodeData(qrData);
      console.log('📱 QR Code generated:', { qrData, orderTime, session });
      
      // Update QR code every 1 second as per BankID specification
      const interval = setInterval(() => {
        const newQrData = BankIdService.generateQRCodeData(session.qrStartToken, session.qrStartSecret, orderTime);
        setQrCodeData(newQrData);
        console.log('🔄 QR Code updated:', newQrData);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session, orderTime]);

  const initiateSigning = async () => {
    setIsInitiating(true);
    setStatus('idle');
    setHintCode('');
    setAutoStartAttempted(false);

    try {
      const signRequest = {
        personalNumber: personalNumber.replace('-', ''),
        endUserIp: '127.0.0.1', // In production, get real IP
        userVisibleData: BankIdService.encodeUserVisibleData(userVisibleData),
        requirement: {
          autoStartTokenRequired: isMobile
        }
      };

      console.log('🔐 Initiating BankID signing with request:', signRequest);
      const newSession = await BankIdService.sign(signRequest);

      if (!newSession) {
        onError('Kunde inte starta BankID-signering. Försök igen.');
        return;
      }

      setSession(newSession);
      setOrderTime(Math.floor(Date.now() / 1000)); // Set order time when session is created
      setStatus('pending');
      
      // Auto-start on mobile
      if (isMobile && newSession.autoStartToken && !autoStartAttempted) {
        setAutoStartAttempted(true);
        BankIdService.openBankIDApp(newSession.autoStartToken);
      }

      // Start polling for completion
      pollStatus(newSession.orderRef);

    } catch (error) {
      console.error('BankID signing initiation failed:', error);
      onError('Kunde inte starta BankID-signering. Försök igen.');
    } finally {
      setIsInitiating(false);
    }
  };

  const pollStatus = async (orderRef: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes with 1s intervals

    const poll = async () => {
      try {
        const statusResult = await BankIdService.checkStatus(orderRef);

        if (!statusResult) {
          onError('Kunde inte kontrollera signeringsstatus.');
          return;
        }

        setHintCode(statusResult.hintCode || '');

        if (statusResult.status === 'complete') {
          setStatus('complete');
          onSuccess(statusResult.completionData);
          return;
        } else if (statusResult.status === 'failed') {
          setStatus('failed');
          onError(getErrorMessage(statusResult.hintCode || 'unknown'));
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          setStatus('failed');
          await BankIdService.cancel(orderRef);
          onError('Signeringen tog för lång tid och avbröts. Försök igen.');
        }
      } catch (error) {
        console.error('Status polling failed:', error);
        setStatus('failed');
        onError('Kunde inte kontrollera signeringsstatus.');
      }
    };

    poll();
  };

  const handleCancel = async () => {
    if (session?.orderRef) {
      await BankIdService.cancel(session.orderRef);
    }
    setStatus('idle');
    setSession(null);
    onCancel();
  };

  const handleRetryAutoStart = () => {
    if (session?.autoStartToken) {
      BankIdService.openBankIDApp(session.autoStartToken);
    }
  };

  const getStatusMessage = () => {
    switch (hintCode) {
      case 'outstandingTransaction':
        return 'Väntar på att BankID-appen ska öppnas...';
      case 'userSign':
        return 'Väntar på att du ska signera i BankID-appen...';
      case 'started':
        return 'BankID-appen har startats...';
      default:
        return 'Bearbetar signering...';
    }
  };

  const getErrorMessage = (hintCode: string) => {
    switch (hintCode) {
      case 'userCancel':
        return 'Signeringen avbröts av användaren.';
      case 'cancelled':
        return 'Signeringen avbröts.';
      case 'startFailed':
        return 'Kunde inte starta BankID-appen. Försök igen.';
      case 'expiredTransaction':
        return 'Signeringen tog för lång tid och avbröts.';
      default:
        return 'Signeringen misslyckades. Försök igen.';
    }
  };

  if (status === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-green-700">Signering slutförd</CardTitle>
          <CardDescription>
            Du har framgångsrikt signerat med BankID.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          BankID-signering
        </CardTitle>
        <CardDescription>
          {isMobile 
            ? 'BankID-appen kommer att öppnas automatiskt på din enhet'
            : 'Skanna QR-koden med din mobila BankID-app'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'idle' ? (
          <Button 
            onClick={initiateSigning} 
            disabled={isInitiating}
            className="w-full"
          >
            {isInitiating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Startar signering...
              </>
            ) : (
              'Starta BankID-signering'
            )}
          </Button>
        ) : status === 'pending' ? (
          <div className="space-y-4">
            {!isMobile && qrCodeData && (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <QRCode value={qrCodeData} size={200} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Skanna QR-koden med BankID-appen på din telefon
                </p>
              </div>
            )}

            {isMobile && (
              <div className="space-y-3">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    BankID-appen borde ha öppnats automatiskt. 
                    Om inte, tryck på knappen nedan.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  variant="outline" 
                  onClick={handleRetryAutoStart}
                  className="w-full"
                >
                  Öppna BankID-appen
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {getStatusMessage()}
              </span>
            </div>

            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="w-full"
            >
              Avbryt signering
            </Button>
          </div>
        ) : status === 'failed' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Signeringen misslyckades. Försök igen.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button onClick={initiateSigning} className="flex-1">
                Försök igen
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Avbryt
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};