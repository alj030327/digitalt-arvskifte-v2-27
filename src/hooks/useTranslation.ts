import { useState } from 'react';

type Language = 'sv' | 'en';

interface Translations {
  sv: Record<string, string>;
  en: Record<string, string>;
}

const translations: Translations = {
  sv: {
    // Step labels
    'step.identification': 'Identifiering',
    'step.assets': 'Tillgångar',
    'step.distribution': 'Fördelning',
    'step.contact': 'Kontaktuppgifter',
    'step.signing': 'E-signering',
    'step.summary': 'Sammanfattning',
    
    // Main headers
    'app.title': 'Digitalt Arvsskifte',
    'app.subtitle': 'Säker och effektiv hantering av arvsskiften',
    
    // Common buttons
    'button.back': 'Tillbaka',
    'button.next': 'Nästa',
    'button.continue': 'Fortsätt',
    'button.save': 'Spara',
    'button.complete': 'Slutför',
    'button.add': 'Lägg till',
    'button.remove': 'Ta bort',
    'button.edit': 'Redigera',
    
    // Assets page
    'assets.title': 'Tillgångar och bankkonton',
    'assets.subtitle': 'Samla in information om den avlidnes tillgångar från olika banker',
    'assets.auto_import': 'Automatisk hämtning',
    'assets.manual_input': 'Manuell inmatning',
    'assets.continue_distribution': 'Fortsätt till fördelning',
    'assets.registered_assets': 'Registrerade tillgångar och skulder',
    'assets.total_assets': 'Totala tillgångar',
    'assets.total_debts': 'Totala skulder',
    'assets.net_distributable': 'Nettotillgångar att fördela',
    
    // Account categories
    'category.private_accounts': '💳 Privatkonton',
    'category.savings_accounts': '💰 Sparkonton',
    'category.investment_accounts': '📈 Investeringskonton',
    'category.business_accounts': '🏦 Företags- & föreningskonton',
    'category.youth_accounts': '🧒 Barn- och ungdomskonton',
    'category.payment_accounts': '💸 Betal- & kreditkonton',
    'category.loan_accounts': '🏠 Lånekonton',
    'category.pension_accounts': '⚖️ Pensionskonton & försäkringar',
    
    // Footer
    'footer.copyright': '© 2024 Digitalt Arvsskifte - Säker hantering av arvsskiften',
    'footer.privacy': 'Integritet',
    'footer.terms': 'Villkor',
    'footer.support': 'Support'
  },
  en: {
    // Step labels
    'step.identification': 'Identification',
    'step.assets': 'Assets',
    'step.distribution': 'Distribution',
    'step.contact': 'Contact Information',
    'step.signing': 'E-signing',
    'step.summary': 'Summary',
    
    // Main headers
    'app.title': 'Digital Estate Settlement',
    'app.subtitle': 'Secure and efficient estate settlement management',
    
    // Common buttons
    'button.back': 'Back',
    'button.next': 'Next',
    'button.continue': 'Continue',
    'button.save': 'Save',
    'button.complete': 'Complete',
    'button.add': 'Add',
    'button.remove': 'Remove',
    'button.edit': 'Edit',
    
    // Assets page
    'assets.title': 'Assets and bank accounts',
    'assets.subtitle': 'Collect information about the deceased\'s assets from various banks',
    'assets.auto_import': 'Automatic import',
    'assets.manual_input': 'Manual input',
    'assets.continue_distribution': 'Continue to distribution',
    'assets.registered_assets': 'Registered assets and debts',
    'assets.total_assets': 'Total assets',
    'assets.total_debts': 'Total debts',
    'assets.net_distributable': 'Net distributable assets',
    
    // Account categories
    'category.private_accounts': '💳 Private accounts',
    'category.savings_accounts': '💰 Savings accounts',
    'category.investment_accounts': '📈 Investment accounts',
    'category.business_accounts': '🏦 Business & association accounts',
    'category.youth_accounts': '🧒 Children & youth accounts',
    'category.payment_accounts': '💸 Payment & credit accounts',
    'category.loan_accounts': '🏠 Loan accounts',
    'category.pension_accounts': '⚖️ Pension accounts & insurance',
    
    // Footer
    'footer.copyright': '© 2024 Digital Estate Settlement - Secure estate settlement management',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.support': 'Support'
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('sv');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const getStepLabels = (): string[] => {
    return [
      t('step.identification'),
      t('step.assets'),
      t('step.distribution'),
      t('step.contact'),
      t('step.signing'),
      t('step.summary')
    ];
  };

  return {
    t,
    language,
    changeLanguage,
    getStepLabels
  };
};