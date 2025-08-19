import { useState } from "react";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Step1EstateOwners, EstateOwner } from "@/components/steps/Step1EstateOwners";
import { Step2Assets } from "@/components/steps/Step2Assets";
import { Step3Distribution } from "@/components/steps/Step3Distribution";
import { Step4FinalSignature } from "@/components/steps/Step4FinalSignature";
import { Scale, Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

interface Asset {
  id: string;
  bank: string;
  accountType: string;
  assetType: string;
  accountNumber: string;
  amount: number;
  toRemain?: boolean;
  reasonToRemain?: string;
}

interface PhysicalAsset {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  category: string;
}

interface Beneficiary {
  id: string;
  name: string;
  personalNumber: string;
  relationship: string;
  percentage: number;
  accountNumber: string;
  signed?: boolean;
  signedAt?: string;
  assetPreferences?: {
    warrants: 'transfer' | 'sell';
    certificates: 'transfer' | 'sell';
    options: 'transfer' | 'sell';
    futures: 'transfer' | 'sell';
  };
  assetNotApplicable?: {
    warrants?: boolean;
    certificates?: boolean;
    options?: boolean;
    futures?: boolean;
  };
}

interface Testament {
  id: string;
  filename: string;
  uploadDate: string;
  verified: boolean;
}

const EstateProcess = () => {
  const { t, language, changeLanguage } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [deceasedFirstName, setDeceasedFirstName] = useState("");
  const [deceasedLastName, setDeceasedLastName] = useState("");
  const [deceasedPersonalNumber, setDeceasedPersonalNumber] = useState("");
  const [estateOwners, setEstateOwners] = useState<EstateOwner[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [testament, setTestament] = useState<Testament | null>(null);
  const [hasTestament, setHasTestament] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);

  const stepLabels = ["Dödsbodelägare", "Tillgångar", "Fördelning", "Signering"];

  const totalFinancialAssets = assets
    .filter(a => !['Bolån', 'Privatlån', 'Kreditkort', 'Blancolån', 'Billån', 'Företagslån'].includes(a.assetType))
    .reduce((sum, a) => sum + (a.toRemain ? 0 : a.amount), 0);
    
  const totalPhysicalAssets = physicalAssets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const totalDistributableAmount = totalFinancialAssets + totalPhysicalAssets;

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    setSavedProgress(true);
    console.log("Framsteg sparat!");
  };

  const handleComplete = () => {
    console.log("Går till signering...");
    setCurrentStep(4);
  };

  const handleFinalComplete = () => {
    console.log("Arvsskifte genomfört!");
    // Reset or redirect to completion page
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('app.title')}</h1>
                <p className="text-muted-foreground">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeLanguage(language === 'sv' ? 'en' : 'sv')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {language === 'sv' ? 'English' : 'Svenska'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={4} 
          stepLabels={stepLabels} 
        />

        {currentStep === 1 && (
          <Step1EstateOwners
            deceasedFirstName={deceasedFirstName}
            setDeceasedFirstName={setDeceasedFirstName}
            deceasedLastName={deceasedLastName}
            setDeceasedLastName={setDeceasedLastName}
            deceasedPersonalNumber={deceasedPersonalNumber}
            setDeceasedPersonalNumber={setDeceasedPersonalNumber}
            estateOwners={estateOwners}
            setEstateOwners={setEstateOwners}
            onNext={handleNext}
            t={t}
          />
        )}

        {currentStep === 2 && (
          <Step2Assets
            assets={assets}
            setAssets={setAssets}
            physicalAssets={physicalAssets}
          setPhysicalAssets={(assets) => setPhysicalAssets(assets)}
            onNext={handleNext}
            onBack={handleBack}
            t={t}
          />
        )}

        {currentStep === 3 && (
          <Step3Distribution
            beneficiaries={beneficiaries}
            setBeneficiaries={setBeneficiaries}
            totalAmount={totalDistributableAmount}
            assets={assets}
            personalNumber={deceasedPersonalNumber}
            testament={testament}
            setTestament={setTestament}
            hasTestament={hasTestament}
            setHasTestament={setHasTestament}
            physicalAssets={physicalAssets}
            setPhysicalAssets={setPhysicalAssets}
            onNext={handleNext}
            onBack={handleBack}
            onSave={handleSave}
            onComplete={handleComplete}
            savedProgress={savedProgress}
            t={t}
          />
        )}

        {currentStep === 4 && (
          <Step4FinalSignature
            deceasedFirstName={deceasedFirstName}
            deceasedLastName={deceasedLastName}
            deceasedPersonalNumber={deceasedPersonalNumber}
            estateOwners={estateOwners}
            assets={assets}
            physicalAssets={physicalAssets}
            beneficiaries={beneficiaries}
            onBack={handleBack}
            onComplete={handleFinalComplete}
            t={t}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>{t('footer.copyright')}</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t('footer.support')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstateProcess;