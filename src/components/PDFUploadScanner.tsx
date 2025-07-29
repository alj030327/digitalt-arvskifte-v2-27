import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { PDFScanService, ScannedDocumentData } from "@/services/pdfScanService";
import { useToast } from "@/hooks/use-toast";

interface Heir {
  personalNumber: string;
  name: string;
  relationship: string;
  inheritanceShare?: number;
}

interface PDFUploadScannerProps {
  onScanComplete: (personalNumber: string, heirs: Heir[]) => void;
  t: (key: string) => string;
}

export const PDFUploadScanner = ({ onScanComplete, t }: PDFUploadScannerProps) => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScannedDocumentData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Fel filtyp",
        description: "Endast PDF-filer accepteras.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Fil för stor",
        description: "Filen får inte vara större än 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await PDFScanService.scanPDF(file);
      setScanResult(result);

      if (result.scanConfidence > 0.5) {
        toast({
          title: "Scanning lyckades",
          description: `${result.heirs.length} dödsbodelägare hittades i dokumentet.`,
        });
      } else {
        toast({
          title: "Låg scanningskvalitet",
          description: "Dokumentet kunde inte läsas korrekt. Kontrollera resultatet nedan.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Scanning misslyckades",
        description: "Kunde inte läsa PDF-filen. Försök med en annan fil.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleUseScanResult = () => {
    if (!scanResult) return;

    const heirs: Heir[] = scanResult.heirs.map(heir => ({
      personalNumber: PDFScanService.formatPersonalNumber(heir.personalNumber),
      name: heir.name,
      relationship: heir.relationship || 'Arvinge',
      inheritanceShare: heir.inheritanceShare
    }));

    const personalNumber = scanResult.deceasedPersonalNumber || '';
    onScanComplete(personalNumber, heirs);

    toast({
      title: "Information importerad",
      description: `${heirs.length} dödsbodelägare har importerats från dokumentet.`,
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "Hög kvalitet";
    if (confidence >= 0.5) return "Medium kvalitet";
    return "Låg kvalitet";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Ladda upp bouppteckning eller testamente
        </CardTitle>
        <CardDescription>
          Scanna PDF-dokument för att automatiskt identifiera dödsbodelägare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="pdf-upload">Välj PDF-fil</Label>
          <div className="flex items-center gap-4">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isScanning}
              className="flex-1"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Accepterar PDF-filer upp till 10MB
          </p>
        </div>

        {/* Scanning Status */}
        {isScanning && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Skannar PDF-dokument... Detta kan ta några sekunder.
            </AlertDescription>
          </Alert>
        )}

        {/* Scan Results */}
        {scanResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(scanResult.scanConfidence)}`} />
                {getConfidenceLabel(scanResult.scanConfidence)} ({Math.round(scanResult.scanConfidence * 100)}%)
              </Badge>
              <Badge variant="secondary">
                {PDFScanService.getDocumentTypeLabel(scanResult.documentType)}
              </Badge>
            </div>

            {/* Deceased Person Info */}
            {(scanResult.deceasedName || scanResult.deceasedPersonalNumber) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avliden person</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {scanResult.deceasedName && (
                    <p className="text-sm">Namn: {scanResult.deceasedName}</p>
                  )}
                  {scanResult.deceasedPersonalNumber && (
                    <p className="text-sm">Personnummer: {scanResult.deceasedPersonalNumber}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Heirs List */}
            {scanResult.heirs.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Dödsbodelägare ({scanResult.heirs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {scanResult.heirs.map((heir, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{heir.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {PDFScanService.formatPersonalNumber(heir.personalNumber)}
                            </p>
                            {heir.relationship && (
                              <Badge variant="outline" className="mt-1">
                                {heir.relationship}
                              </Badge>
                            )}
                          </div>
                          {heir.inheritanceShare && (
                            <Badge variant="secondary">
                              {heir.inheritanceShare}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Total Asset Value */}
            {scanResult.totalAssetValue && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Totalt tillgångsvärde: {scanResult.totalAssetValue.toLocaleString('sv-SE')} kr
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleUseScanResult}
                disabled={scanResult.heirs.length === 0}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Använd denna information
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setScanResult(null);
                  setUploadedFile(null);
                }}
              >
                Försök igen
              </Button>
            </div>

            {/* Low confidence warning */}
            {scanResult.scanConfidence < 0.5 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Scanningen gav låg kvalitet. Kontrollera att informationen är korrekt innan du fortsätter.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Instructions */}
        {!scanResult && !isScanning && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Tips för bästa resultat:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Använd tydliga, skannade dokument i PDF-format</li>
              <li>• Se till att texten är läsbar och inte för suddig</li>
              <li>• Dokument på svenska ger bäst resultat</li>
              <li>• Kontrollera alltid den skannade informationen</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};