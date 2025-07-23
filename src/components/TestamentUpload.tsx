import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Testament {
  id: string;
  filename: string;
  uploadDate: string;
  verified: boolean;
}

interface TestamentUploadProps {
  testament: Testament | null;
  setTestament: (testament: Testament | null) => void;
  hasTestament: boolean;
  setHasTestament: (has: boolean) => void;
}

export const TestamentUpload = ({ testament, setTestament, hasTestament, setHasTestament }: TestamentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTestament: Testament = {
      id: Date.now().toString(),
      filename: file.name,
      uploadDate: new Date().toLocaleDateString('sv-SE'),
      verified: false
    };
    
    setTestament(newTestament);
    setIsUploading(false);
    
    // Start verification
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setTestament({
      ...newTestament,
      verified: true
    });
    setIsVerifying(false);
  };

  const handleRemoveTestament = () => {
    setTestament(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Testamente</h3>
        <div className="flex gap-2">
          <Button
            variant={hasTestament ? "default" : "outline"}
            size="sm"
            onClick={() => setHasTestament(true)}
          >
            Ja, det finns testamente
          </Button>
          <Button
            variant={!hasTestament ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setHasTestament(false);
              setTestament(null);
            }}
          >
            Nej, inget testamente
          </Button>
        </div>
      </div>

      {!hasTestament && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Om inget testamente finns kommer lagstadgad arvordning att tillämpas. 
            Tillgångarna kommer att fördelas enligt svenska arvsregler.
          </AlertDescription>
        </Alert>
      )}

      {hasTestament && !testament && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ladda upp testamente</CardTitle>
            <CardDescription>
              Ladda upp en kopia av det giltiga testamentet. Accepterade format: PDF, JPG, PNG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Dra och släpp filen här eller klicka för att välja</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG up till 10MB</p>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {isUploading && (
                <div className="mt-4">
                  <div className="animate-pulse text-sm text-muted-foreground">
                    Laddar upp testamente...
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {testament && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileText className="w-8 h-8 text-primary mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{testament.filename}</span>
                    {testament.verified ? (
                      <Badge variant="default" className="bg-success text-success-foreground">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Inscannat
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {isVerifying ? "Scannar..." : "Ej inscannat"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Uppladdad: {testament.uploadDate}
                  </p>
                  {isVerifying && (
                    <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                      Scannar in testamentets innehåll...
                    </p>
                  )}
                  {testament.verified && (
                    <Alert className="mt-3">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Testamentet har scannats in och kommer att påverka arvsfördelningen. 
                        Kontrollera att fördelningen överensstämmer med testamentets innehåll.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveTestament}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};