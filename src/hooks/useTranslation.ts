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
    'button.select': 'Välj',
    'button.choose': 'Välj',
    
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
    'assets.add_asset': 'Lägg till tillgång',
    'assets.bank': 'Bank',
    'assets.account_type': 'Kontotyp',
    'assets.asset_type': 'Tillgångs-/Skuldtyp',
    'assets.account_number': 'Kontonummer',
    'assets.amount': 'Belopp (SEK)',
    'assets.debt': 'Skuld (SEK)',
    'assets.select_bank_first': 'Välj bank först',
    'assets.select_account_type': 'Välj kontotyp',
    'assets.select_asset_type': 'Välj tillgångs-/skuldtyp',
    'assets.account_remain': 'Konto ska vara kvar',
    'assets.debt_remain': 'Skuld ska vara kvar',
    'assets.amount_remain': 'Belopp som ska vara kvar (SEK)',
    'assets.reason_remain': 'Anledning till varför kontot ska vara kvar',
    'assets.reason_debt_remain': 'Anledning till varför skulden ska vara kvar',
    'assets.auto_import_description': 'Via PSD2/Open Banking kan vi automatiskt hämta kontoinformation från era banker. Detta kräver din godkännande och BankID-autentisering hos respektive bank.',
    'assets.start_auto_import': 'Starta automatisk hämtning',
    'assets.importing': 'Hämtar kontoinformation...',
    'assets.accounts_holdings': 'Konton och innehav:',
    'assets.marked_remain': 'Konto markerat att vara kvar',
    'assets.to_distribute': 'Att fördela:',
    'assets.debt_amount_help': 'Ange skuldbeloppet som ett positivt tal',
    'assets.remain_help_debt': 'Markera om skulden inte ska ingå i fördelningen (t.ex. bolån som ska fortsätta gälla)',
    'assets.remain_help_asset': 'Markera om kontot inte ska ingå i fördelningen (t.ex. skatteåterbäring)',
    'assets.remain_amount_help': 'Ange hur mycket som ska vara kvar efter skiftet. Resterande belopp kommer att fördelas.',
    'assets.reason_placeholder_debt': 'T.ex. bolån som ska övertas av specifik arvinge, kvarstående månatliga betalningar, etc.',
    'assets.reason_placeholder_asset': 'T.ex. skatteåterbäring, löpande ärende, etc.',
    'assets.reason_remain_general': 'T.ex. skatteåterbäring, löpande ärende, bolån som ska övertas...',
    'assets.remain_tooltip_on': 'Kontot kommer att vara kvar',
    'assets.remain_tooltip_off': 'Klicka för att markera att kontot ska vara kvar',
    
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
    'button.select': 'Select',
    'button.choose': 'Choose',
    
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
    'assets.add_asset': 'Add asset',
    'assets.bank': 'Bank',
    'assets.account_type': 'Account type',
    'assets.asset_type': 'Asset/Debt type',
    'assets.account_number': 'Account number',
    'assets.amount': 'Amount (SEK)',
    'assets.debt': 'Debt (SEK)',
    'assets.select_bank_first': 'Select bank first',
    'assets.select_account_type': 'Select account type',
    'assets.select_asset_type': 'Select asset/debt type',
    'assets.account_remain': 'Account should remain',
    'assets.debt_remain': 'Debt should remain',
    'assets.amount_remain': 'Amount that should remain (SEK)',
    'assets.reason_remain': 'Reason why the account should remain',
    'assets.reason_debt_remain': 'Reason why the debt should remain',
    'assets.auto_import_description': 'Via PSD2/Open Banking we can automatically retrieve account information from your banks. This requires your consent and BankID authentication with each bank.',
    'assets.start_auto_import': 'Start automatic import',
    'assets.importing': 'Importing account information...',
    'assets.accounts_holdings': 'Accounts and holdings:',
    'assets.marked_remain': 'Account marked to remain',
    'assets.to_distribute': 'To distribute:',
    'assets.debt_amount_help': 'Enter the debt amount as a positive number',
    'assets.remain_help_debt': 'Check if the debt should not be included in the distribution (e.g. mortgage to continue)',
    'assets.remain_help_asset': 'Check if the account should not be included in the distribution (e.g. tax refund)',
    'assets.remain_amount_help': 'Enter how much should remain after the settlement. The remaining amount will be distributed.',
    'assets.reason_placeholder_debt': 'E.g. mortgage to be taken over by specific heir, ongoing monthly payments, etc.',
    'assets.reason_placeholder_asset': 'E.g. tax refund, ongoing matter, etc.',
    'assets.reason_remain_general': 'E.g. tax refund, ongoing matter, mortgage to be taken over...',
    'assets.remain_tooltip_on': 'The account will remain',
    'assets.remain_tooltip_off': 'Click to mark that the account should remain',
    
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