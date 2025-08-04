import { useState } from "react";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Step1PersonalNumber } from "@/components/steps/Step1PersonalNumber";
import { Step2Assets } from "@/components/steps/Step2Assets";
import { Step3Distribution } from "@/components/steps/Step3Distribution";
import { Step4ContactInfo } from "@/components/steps/Step4ContactInfo";
import { Step5BeneficiarySigning } from "@/components/steps/Step5BeneficiarySigning";
import { Step4Signing } from "@/components/steps/Step4Signing";
import { Scale, Globe } from "lucide-react";
import { PhysicalAsset } from "@/components/PhysicalAssets";
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

interface Heir {
  personalNumber: string;
  name: string;
  relationship: string;
  inheritanceShare?: number;
  signed?: boolean;
  signedAt?: string;
}

const Index = () => {
  const { t, language, changeLanguage, getStepLabels } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [personalNumber, setPersonalNumber] = useState("");
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [testament, setTestament] = useState<Testament | null>(null);
  const [hasTestament, setHasTestament] = useState(false);
  const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>([]);
  const [savedProgress, setSavedProgress] = useState(false);

  const stepLabels = getStepLabels();

  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const totalDistributableAmount = assets.reduce((sum, asset) => sum + (asset.toRemain ? 0 : asset.amount), 0);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    setSavedProgress(true);
    // Simulate saving progress
    console.log("Framsteg sparat!");
  };

  const handleComplete = () => {
    // Go to contact info step
    console.log("Går till kontaktuppgifter...");
    setCurrentStep(4);
  };

  const handleFinalComplete = () => {
    // Reset or redirect to completion page
    console.log("Arvsskifte genomfört!");
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
          totalSteps={6} 
          stepLabels={stepLabels} 
        />

        {currentStep === 1 && (
          <Step1PersonalNumber
            personalNumber={personalNumber}
            setPersonalNumber={setPersonalNumber}
            heirs={heirs}
            setHeirs={setHeirs}
            onNext={handleNext}
            t={t}
          />
        )}

        {currentStep === 2 && (
          <Step2Assets
            assets={assets}
            setAssets={setAssets}
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
            personalNumber={personalNumber}
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
          <Step4ContactInfo
            heirs={heirs}
            setHeirs={setHeirs}
            personalNumber={personalNumber}
            totalAmount={totalDistributableAmount}
            onNext={handleNext}
            onBack={handleBack}
            t={t}
          />
        )}

        {currentStep === 5 && (
          <Step5BeneficiarySigning
            heirs={heirs}
            setHeirs={setHeirs}
            onNext={handleNext}
            onBack={handleBack}
            t={t}
            totalAmount={totalDistributableAmount}
          />
        )}

        {currentStep === 6 && (
          <Step4Signing
            personalNumber={personalNumber}
            heirs={heirs}
            assets={assets}
            beneficiaries={beneficiaries}
            testament={testament}
            physicalAssets={physicalAssets}
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

export default Index;
